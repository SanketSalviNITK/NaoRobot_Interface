import os
import threading
import requests
import json
import time
import re
import subprocess
import urllib.request
import speech_recognition as sr
import sounddevice as sd
import numpy as np
from flask import Flask, request, jsonify
import werkzeug.utils
import rag_engine

# Global process tracker for the digital twin sync
sync_process = None

# --- AUTO-FIX FOR FFMPEG ---
try:
    import imageio_ffmpeg
    import shutil
    exe_path = imageio_ffmpeg.get_ffmpeg_exe()
    base_dir = os.path.dirname(__file__)
    local_ffmpeg = os.path.join(base_dir, "ffmpeg.exe")
    if not os.path.exists(local_ffmpeg):
        shutil.copy(exe_path, local_ffmpeg)
    if base_dir not in os.environ['PATH']:
        os.environ['PATH'] = base_dir + os.pathsep + os.environ['PATH']
except:
    pass

# --- CONFIGURATION ---
LM_STUDIO_URL = "http://169.254.80.100:1234/v1/chat/completions"
BRIDGE_URL = "http://127.0.0.1:5001"

print("[System] LM Studio Brain initialized (Local Mode).")

# --- INIT FLASK SERVER ---
server = Flask(__name__)
chat_history = []

@server.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def get_ai_decision(user_text, use_rag=False):
    """Asks Gemini for a speech response and a physical gesture."""
    gestures_list = [
        "wave_right_hand", "nod_head", "shake_head", "thinking", 
        "explain", "happy", "sad", "stand", "sit", "none"
    ]
    
    global chat_history
    system_prompt = (
        "You are the brain of a NAO humanoid robot. Respond to the user's input.\n"
        "1. Keep your speech natural, friendly, and conversational. Ask follow-up questions when appropriate.\n"
        "2. Choose the most appropriate gesture from the list below.\n"
        f"AVAILABLE GESTURES: {', '.join(gestures_list)}\n\n"
        "MAPPING RULES:\n"
        "- If user says 'hello' or greets: use 'wave_right_hand'.\n"
        "- If user asks you to stand up: use 'stand'.\n"
        "- If user asks you to sit down: use 'sit'.\n"
        "- If you agree or say yes: use 'nod_head'.\n"
        "- If you disagree or say no/don't know: use 'shake_head'.\n"
        "- If you are explaining something or asking a question: use 'explain'.\n"
        "- If you express joy/success: use 'happy'.\n"
        "- If you express sorrow: use 'sad'.\n"
        "- If you are thinking or processing: use 'thinking'.\n"
        "- If you are just talking or conversing normally, default to: 'explain'.\n\n"
        "You MUST reply ONLY with a valid JSON object. No markdown, no conversational text. "
        "Example format: {\"speech\": \"I am a robot. What would you like to know?\", \"gestures\": [\"thinking\", \"explain\"]}"
    )
    
    if use_rag:
        print("[RAG] Fetching context...")
        context = rag_engine.query(user_text)
        if context:
            print(f"[RAG] Found context: {context[:100]}...")
            system_prompt += f"\n\nUSE THIS CONTEXT TO ANSWER THE USER: {context}"
        else:
            print("[RAG] No context found in vector DB.")
            
    try:
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": user_text})
        
        payload = {
            "model": "google/gemma-4-e4b",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1024,
            "stream": False
        }
        response = requests.post(LM_STUDIO_URL, json=payload, timeout=30)
        response.raise_for_status()
        
        raw_text = response.json()['choices'][0]['message']['content'].strip()
        
        # Robust JSON extraction
        start_idx = raw_text.find('{')
        end_idx = raw_text.rfind('}')
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            extracted_json = raw_text[start_idx:end_idx+1]
        else:
            extracted_json = raw_text
            
        data = json.loads(extracted_json)
        
        # Update chat history
        chat_history.append({"role": "user", "content": user_text})
        chat_history.append({"role": "assistant", "content": extracted_json})
        
        # Keep history manageable (last 5 turns)
        if len(chat_history) > 10:
            chat_history = chat_history[-10:]
            
        # Robustly find speech and gesture keys
        speech = data.get("speech", data.get("Speech", data.get("response", data.get("text", ""))))
        gestures = data.get("gestures", data.get("Gestures", data.get("gesture", ["none"])))
        
        # Normalize gestures to a list
        if isinstance(gestures, str):
            gestures = [gestures]
        elif not isinstance(gestures, list):
            gestures = ["none"]
            
        if not speech:
            speech = "I am processing the data but I lack the words to explain it."
            
        return speech, gestures
    except Exception as e:
        print(f"[Error] LM Studio reasoning failed: {e}")
        speech = "I am having a moment of digital confusion."
        if 'raw_text' in locals():
            print(f"[Debug] Raw output was: {raw_text}")
            # Fallback: if it's just raw text and failed JSON parsing, use it as speech
            if "{" not in raw_text or "}" not in raw_text:
                speech = raw_text.strip().replace("```json", "").replace("```", "")
                # Clean up broken JSON syntax if it got cut off mid-generation
                speech = re.sub(r'^\{?\s*"speech"\s*:\s*"', '', speech)
                speech = re.sub(r'\\n', ' ', speech)
        return speech, ["none"]

def execute_robot_actions(speech, gestures):
    """Sends the speech and motion commands to the Python 2.7 bridge."""
    try:
        # 1. Send Speech Command
        if speech and str(speech).strip():
            print(f"[Brain] Sending Speech: {speech}")
            requests.post(f"{BRIDGE_URL}/speak", json={"text": str(speech)}, timeout=10)
        
        # 2. Send Motion Command (if any)
        if not isinstance(gestures, list):
            gestures = [gestures]
            
        for gest in gestures:
            if gest and gest.lower() != "none":
                print(f"[Brain] Triggering Gesture: {gest}")
                try:
                    # Increase timeout to 30s as complex motions take time
                    requests.post(f"{BRIDGE_URL}/motion", json={"action": gest}, timeout=30)
                    import time
                    time.sleep(1.5) # small pause between animations
                except Exception as ex:
                    print(f"[Brain] Failed to send gesture '{gest}': {ex}")
            
    except Exception as e:
        print(f"[Error] Failed to relay to bridge: {e}")

# This endpoint is called by bridge_naoqi.py when it hears a word
@server.route('/voice_input', methods=['POST'])
def voice_input():
    data = request.get_json()
    heard_word = data.get("text")
    print(f"\n[Voice Event] Robot heard: '{heard_word}'")
    
    # Process word through Gemini
    speech, gestures = get_ai_decision(heard_word)
    print(f"NAO Response: {speech} (Gestures: {gestures})")
    
    # Execute on robot
    threading.Thread(target=execute_robot_actions, args=(speech, gestures)).start()
    
    return jsonify({"status": "received"})

# --- NEW FULL-DUPLEX VOICE ENDPOINTS ---

recognizer = sr.Recognizer()

@server.route('/voice/listen', methods=['POST'])
def voice_listen():
    print("\n[Voice] Activating laptop microphone via sounddevice...")
    try:
        duration = 5 # Record for 5 seconds
        fs = 16000
        print(f"[Voice] Listening for {duration} seconds... Speak now!")
        
        # Record audio using sounddevice (bypasses PyAudio dependency)
        myrecording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
        sd.wait()
        
        # Convert numpy array to sr.AudioData
        audio_data = sr.AudioData(myrecording.tobytes(), fs, 2)
            
        print("[Voice] Transcribing with Google Speech Recognition (en-IN)...")
        recognized_text = recognizer.recognize_google(audio_data, language="en-IN")
        print(f"[Voice] Transcription result: '{recognized_text}'")
        
        # Generate AI Decision
        speech, gestures = get_ai_decision(recognized_text)
        print(f"NAO Response: {speech} (Gestures: {gestures})")
        
        # Dispatch physical actions
        threading.Thread(target=execute_robot_actions, args=(speech, gestures)).start()
        
        first_gesture = gestures[0] if isinstance(gestures, list) and len(gestures) > 0 else "none"
        
        return jsonify({
            "status": "success",
            "recognized_text": recognized_text,
            "speech": speech,
            "gesture": first_gesture,
            "gestures": gestures
        })
        
    except sr.WaitTimeoutError:
        print("[Error] Voice processing failed: Timeout waiting for speech")
        return jsonify({"status": "error", "message": "Listening timeout. No speech detected."}), 500
    except sr.UnknownValueError:
        print("[Error] Voice processing failed: Could not understand audio")
        return jsonify({"status": "error", "message": "Could not understand audio"}), 500
    except Exception as e:
        print(f"[Error] Voice processing failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# This endpoint is called by the React dashboard
@server.route('/chat', methods=['POST'])
def chat_endpoint():
    data = request.get_json()
    user_text = data.get("text", "")
    use_rag = data.get("rag_mode", False)
    print(f"\n[Dashboard Chat] User sent: '{user_text}' (RAG: {use_rag})")
    
    # Process text through Gemini
    speech, gestures = get_ai_decision(user_text, use_rag=use_rag)
    print(f"NAO Response: {speech} (Gestures: {gestures})")
    
    # Dispatch physical actions asynchronously so UI remains snappy
    threading.Thread(target=execute_robot_actions, args=(speech, gestures)).start()
    
    first_gesture = gestures[0] if isinstance(gestures, list) and len(gestures) > 0 else "none"
    
    return jsonify({
        "status": "success",
        "speech": speech,
        "gesture": first_gesture,
        "gestures": gestures
    })

@server.route('/upload_doc', methods=['POST'])
def upload_doc():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
        
    if file:
        filename = werkzeug.utils.secure_filename(file.filename)
        temp_path = os.path.join(os.path.dirname(__file__), filename)
        file.save(temp_path)
        
        try:
            chunks = rag_engine.add_document(temp_path, filename)
            # Clean up
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
            return jsonify({
                "status": "success", 
                "message": f"Successfully ingested {chunks} chunks",
                "chunks": chunks,
                "filename": filename,
                "size": "Parsed"
            })
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({"status": "error", "message": str(e)}), 500

# This endpoint is called by the React dashboard buttons (Stand, Sit, Wave, etc.)
@server.route('/command', methods=['POST'])
def command_endpoint():
    data = request.get_json()
    action = data.get("action", "")
    print(f"\n[Dashboard Command] Triggering gesture: '{action}'")
    
    # Dispatch directly to bridge without Gemini processing
    threading.Thread(target=execute_robot_actions, args=("", action)).start()
    
    return jsonify({"status": "success"})

# Start time tracking for the mock animation cycle
start_time = time.time()

def generate_mock_telemetry(t):
    """Generates smooth, organic sine-wave joint values to simulate a live robot."""
    joints = {}
    
    # 1. Breathing motion (subtle shoulder pitch & roll shifts)
    breathing = math.sin(t * 2.0) * 0.03
    joints["LShoulderPitch"] = 1.4 + breathing
    joints["RShoulderPitch"] = 1.4 + breathing
    joints["LShoulderRoll"] = 0.1 + math.cos(t * 2.0) * 0.01
    joints["RShoulderRoll"] = -0.1 - math.cos(t * 2.0) * 0.01
    
    # 2. Scanning head motion (looking around slowly)
    joints["HeadYaw"] = math.sin(t * 0.5) * 0.4
    joints["HeadPitch"] = math.cos(t * 1.0) * 0.08
    
    # 3. Wave hand animation (L hand waving back and forth every few seconds)
    cycle = (t % 8.0)
    if cycle < 4.0:
        # High wave pose
        joints["LShoulderPitch"] = -0.8
        joints["LShoulderRoll"] = 0.4
        joints["LElbowYaw"] = -1.2
        # Wave bend
        joints["LElbowRoll"] = -0.6 - math.sin(t * 6.0) * 0.4
    else:
        # Normal standing arm pose
        joints["LShoulderPitch"] = 1.4
        joints["LShoulderRoll"] = 0.1
        joints["LElbowYaw"] = -0.8
        joints["LElbowRoll"] = 0.4
        
    # Symmetrical stand-by pose for limbs
    joints["RElbowYaw"] = 0.8
    joints["RElbowRoll"] = 0.4
    
    # Legs (slight standing flexion)
    joints["LHipPitch"] = -0.2
    joints["LKneePitch"] = 0.4
    joints["LAnklePitch"] = -0.2
    
    joints["RHipPitch"] = -0.2
    joints["RKneePitch"] = 0.4
    joints["RAnklePitch"] = -0.2
    
    return joints

@server.route('/telemetry', methods=['GET'])
def telemetry():
    """Fetches live joint telemetry from the bridge, or falls back to a graceful mock animation."""
    t = time.time() - start_time
    try:
        req = urllib.request.Request("http://127.0.0.1:5001/joints")
        with urllib.request.urlopen(req, timeout=0.2) as response:
            data = json.loads(response.read().decode('utf-8'))
            if "status" not in data or data.get("status") != "error":
                return jsonify({
                    "mode": "live", 
                    "joints": data.get("joints", data), 
                    "battery": data.get("battery", 0), 
                    "temperature": data.get("temperature", 0)
                })
    except Exception:
        pass
        
    # Fallback to mock data if bridge is offline
    mock_bat = 88 - int((t / 600) % 100) # Mock draining battery
    mock_temp = 38.4 + math.sin(t * 0.1) * 2.0
    return jsonify({
        "mode": "mock", 
        "joints": generate_mock_telemetry(t),
        "battery": mock_bat,
        "temperature": round(mock_temp, 1)
    })

def run_server():
    """Starts the Flask server to receive voice triggers."""
    # Running on 5002 to match the BRAIN_URL in your bridge script
    server.run(host="0.0.0.0", port=5002, debug=False, use_reloader=False)

def main():
    # 1. Start the Flask server in a background thread
    # daemon=True ensures it shuts down when you close the script
    threading.Thread(target=run_server, daemon=True).start()
    
    print("\n" + "="*50)
    print("[NAO EMBODIED AI: ONLINE]")
    print("Bridge (2.7): Port 5001 | Brain (3.x): Port 5002")
    print("Commands: Type your message or speak 'Hello' to Nao.")
    print("="*50 + "\n")
    
    # 2. Main Input Loop
    while True:
        try:
            user_input = input("\nYou (Type): ")
            if user_input.lower() in ['quit', 'exit']:
                break
            if not user_input.strip(): 
                continue

            print("Thinking...")
            speech, gesture = get_ai_decision(user_input)
            
            print(f"NAO: {speech}")
            execute_robot_actions(speech, gesture)
            
        except KeyboardInterrupt:
            break
            
    print("\n[System] Shutdown complete.")

if __name__ == "__main__":
    main()