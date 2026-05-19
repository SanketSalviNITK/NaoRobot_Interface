import os
import threading
import requests
import json
import time
import re
from flask import Flask, request, jsonify

# --- AUTO-FIX FOR FFMPEG ---
try:
    import imageio_ffmpeg
    import shutil
    exe_path = imageio_ffmpeg.get_ffmpeg_exe()
    local_ffmpeg = os.path.join(os.getcwd(), "ffmpeg.exe")
    if not os.path.exists(local_ffmpeg):
        shutil.copy(exe_path, local_ffmpeg)
    if os.getcwd() not in os.environ['PATH']:
        os.environ['PATH'] = os.getcwd() + os.pathsep + os.environ['PATH']
except:
    pass

# --- CONFIGURATION ---
LM_STUDIO_URL = "http://169.254.175.100:1234/v1/chat/completions"
BRIDGE_URL = "http://127.0.0.1:5001"  # Where the Python 2.7 Bridge is listening

print("[System] LM Studio Brain initialized (Local Mode).")

# --- INIT FLASK SERVER ---
server = Flask(__name__)

def get_ai_decision(user_text):
    """Asks Gemini for a speech response and a physical gesture."""
    gestures_list = [
        "wave_right_hand", "nod_head", "shake_head", "thinking", 
        "explain", "happy", "sad", "stand", "sit", "none"
    ]
    
    system_prompt = (
        "You are the brain of a NAO humanoid robot. Respond to the user's input.\n"
        "1. Keep your speech short, natural, and friendly (one sentence).\n"
        "2. Choose the most appropriate gesture from the list below.\n"
        f"AVAILABLE GESTURES: {', '.join(gestures_list)}\n\n"
        "MAPPING RULES:\n"
        "- If user says 'hello' or greets: use 'wave_right_hand'.\n"
        "- If user asks you to stand up: use 'stand'.\n"
        "- If user asks you to sit down: use 'sit'.\n"
        "- If you agree or say yes: use 'nod_head'.\n"
        "- If you disagree or say no/don't know: use 'shake_head'.\n"
        "- If you are explaining something: use 'explain'.\n"
        "- If you express joy/success: use 'happy'.\n"
        "- If you express sorrow: use 'sad'.\n"
        "- If you are thinking or processing: use 'thinking'.\n\n"
        "You MUST reply ONLY with a valid JSON object. No markdown, no conversational text. "
        "Example format: {\"speech\": \"I am a robot.\", \"gesture\": \"explain\"}"
    )
    
    try:
        payload = {
            "model": "google/gemma-4-e4b",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ],
            "temperature": 0.7,
            "max_tokens": 300,
            "stream": False
        }
        response = requests.post(LM_STUDIO_URL, json=payload, timeout=30)
        response.raise_for_status()
        
        raw_text = response.json()['choices'][0]['message']['content'].strip()
        
        # Robust JSON extraction
        # Find the first '{' and the last '}'
        start_idx = raw_text.find('{')
        end_idx = raw_text.rfind('}')
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            raw_text = raw_text[start_idx:end_idx+1]
            
        data = json.loads(raw_text)
        return data.get("speech", ""), data.get("gesture", "none")
    except Exception as e:
        print(f"[Error] LM Studio reasoning failed: {e}")
        if 'raw_text' in locals():
            print(f"[Debug] Raw output was: {raw_text}")
        return "I am having a moment of digital confusion.", "none"

def execute_robot_actions(speech, gesture):
    """Sends the speech and motion commands to the Python 2.7 bridge."""
    try:
        # 1. Send Speech Command
        print(f"[Brain] Sending Speech: {speech}")
        requests.post(f"{BRIDGE_URL}/speak", json={"text": speech}, timeout=10)
        
        # 2. Send Motion Command (if any)
        if gesture and gesture != "none":
            print(f"[Brain] Triggering Gesture: {gesture}")
            # Increase timeout to 30s as complex motions take time
            requests.post(f"{BRIDGE_URL}/motion", json={"action": gesture}, timeout=30)
            
    except Exception as e:
        print(f"[Error] Failed to relay to bridge: {e}")

# This endpoint is called by bridge_naoqi.py when it hears a word
@server.route('/voice_input', methods=['POST'])
def voice_input():
    data = request.get_json()
    heard_word = data.get("text")
    print(f"\n[Voice Event] Robot heard: '{heard_word}'")
    
    # Process word through Gemini
    speech, gesture = get_ai_decision(heard_word)
    print(f"NAO Response: {speech} (Gesture: {gesture})")
    
    # Execute on robot
    execute_robot_actions(speech, gesture)
    
    return jsonify({"status": "received"})

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