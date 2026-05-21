# -*- coding: utf-8 -*-
import sys
import os

SDK_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "pynaoqi-python2.7-2.8.6.23-win64-vs2015-20191127_152649", "lib")
if SDK_PATH not in sys.path:
    sys.path.append(SDK_PATH)
if SDK_PATH not in os.environ['PATH']:
    os.environ['PATH'] = SDK_PATH + os.pathsep + os.environ['PATH']

import time
import logging
from flask import Flask, request, jsonify
from naoqi import ALProxy



from naoqi import ALProxy, ALModule, ALBroker
from nao_motions import NaoMotions
import wave
import numpy as np

ROBOT_IP = "169.254.80.144"
MY_IP = "0.0.0.0" # Listen on all interfaces
PORT = 9559

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# --- AUDIO RECORDING MODULE ---
class NAOAudioModule(ALModule):
    def __init__(self, name):
        ALModule.__init__(self, name)
        self.recorder = ALProxy("ALAudioRecorder")
        self.leds = ALProxy("ALLeds")
        self.life = ALProxy("ALAutonomousLife")
        self.is_recording = False
        self.remote_path = "/home/nao/nao_mic_input.wav"

    def start_recording(self):
        # 1. Visual Cue: Green Eyes
        self.leds.fadeRGB("FaceLeds", "green", 0.1)
        
        # 2. Stop Autonomous Life
        try: self.life.setState("disabled")
        except: pass

        # 3. Start Local Recording on the robot
        print("[Audio] Starting local recording on robot: " + self.remote_path)
        # channels: [0,0,1,0] means front mic only, 16000Hz, wav
        try:
            self.recorder.startMicrophonesRecording(self.remote_path, "wav", 16000, [0,0,1,0])
            self.is_recording = True
        except Exception as e:
            print("[Audio] Error starting recorder: " + str(e))

    def stop_recording(self, filename="nao_mic_input.wav"):
        if self.is_recording:
            try:
                self.recorder.stopMicrophonesRecording()
            except: pass
            self.is_recording = False
        
        self.leds.fadeRGB("FaceLeds", "white", 0.1)
        print("[Audio] Recording finished on robot.")
        # We return the remote path so the Brain knows what to download
        return self.remote_path

    def play_last_recording(self):
        try:
            player = ALProxy("ALAudioPlayer")
            print("[Audio] Echoing audio file: " + self.remote_path)
            player.playFile(self.remote_path)
            return True
        except Exception as e:
            print("[Audio] Error playing audio: " + str(e))
            return False

# Global instances
_motions_instance = None
_audio_module = None
_broker = None
_memory = None

def get_local_ip():
    """Detects the local IP address of the computer running this script."""
    import socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect((ROBOT_IP, 9559))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "127.0.0.1"

def init_bridge():
    global _motions_instance, _audio_module, _broker
    
    # 0. Automate LM Studio startup
    try:
        import subprocess
        print("[Bridge] Automating LM Studio startup...")
        print("[Bridge] Starting LM Studio Server on all network interfaces...")
        subprocess.call("lms server start --bind 0.0.0.0", shell=True)
        print("[Bridge] Loading model google/gemma-4-e4b...")
        subprocess.call("lms load google/gemma-4-e4b", shell=True)
        print("[Bridge] LM Studio automation completed.")
    except Exception as lms_err:
        print("[Bridge] Warning: Failed to automate LM Studio startup: " + str(lms_err))

    local_ip = get_local_ip()
    print("[Bridge] Local IP detected as: " + local_ip)
    print("[Bridge] Connecting to robot at " + ROBOT_IP + "...")
    
    try:
        # 1. Create a local broker
        print("[Bridge] Step 1: Creating ALBroker...")
        _broker = ALBroker("myBroker", local_ip, 0, ROBOT_IP, 9559)
        
        # 1.5 Disable Autonomous Features to prevent overheating and conflicts
        print("[Bridge] Step 1.5: Disabling Autonomous Features...")
        try:
            life = ALProxy("ALAutonomousLife")
            if life.getState() != "disabled":
                life.setState("disabled")
                print("[Bridge] ALAutonomousLife disabled.")
        except Exception as e:
            print("[Bridge] Notice: Could not disable ALAutonomousLife (might not exist): " + str(e))
            
        try:
            awareness = ALProxy("ALBasicAwareness")
            if awareness.isAwarenessRunning():
                awareness.stopAwareness()
                print("[Bridge] ALBasicAwareness disabled.")
        except Exception: pass

        try:
            bg = ALProxy("ALBackgroundMovement")
            bg.setEnabled(False)
            print("[Bridge] ALBackgroundMovement disabled.")
        except Exception: pass
        
        # 2. Init Motions
        print("[Bridge] Step 2: Initializing Motion Proxies...")
        _motions_instance = NaoMotions(ALProxy("ALMotion"), ALProxy("ALRobotPosture"))
        
        # 3. Audio Device Check
        print("[Bridge] Step 3: Checking Audio Device Methods...")
        audio = ALProxy("ALAudioDevice")
        methods = audio.getMethodList()
        # Find exactly what we have
        print("[Bridge] Found Audio Methods: " + str([m for m in methods if "subscribe" in m.lower() or "Preferences" in m]))
        
        # 4. Initialize Telemetry Sensors
        print("[Bridge] Step 4: Initializing ALMemory Sensors...")
        global _memory
        _memory = ALProxy("ALMemory")
        
        # 5. Init Audio Module
        _audio_module = NAOAudioModule("NAOAudioModule")
        print("[Bridge] SUCCESS: NAO Sensors, Audio and Motion ready.")
        
    except Exception as e:
        print("[Bridge] ERROR: Initialization failed!")
        print("[Bridge] Error details: " + str(e))

def get_motions():
    return _motions_instance

@app.route('/speak', methods=['POST'])
def speak():
    data = request.get_json(force=True)
    text = data.get("text", "")
    if isinstance(text, unicode):
        text = text.encode('utf-8')
    text = str(text)

    print("[Bridge] Speaking: " + text)
    tts = get_proxy("ALTextToSpeech")
    if tts:
        tts.post.say(text)
        return jsonify({"status": "ok"})
    return jsonify({"status": "error"}), 500

@app.route('/record/start', methods=['POST'])
def record_start():
    if _audio_module:
        _audio_module.start_recording()
        return jsonify({"status": "recording"})
    return jsonify({"status": "error"}), 500

@app.route('/record/stop', methods=['POST'])
def record_stop():
    if _audio_module:
        filename = _audio_module.stop_recording()
        return jsonify({"status": "saved", "filename": filename})
    return jsonify({"status": "error"}), 500

@app.route('/audio/echo', methods=['POST'])
def audio_echo():
    if _audio_module:
        success = _audio_module.play_last_recording()
        if success:
            return jsonify({"status": "playing"})
    return jsonify({"status": "error"}), 500

@app.route('/motion', methods=['POST'])
def motion():
    action = request.json.get("action", "")
    print("[Bridge] Received motion request: " + action)
    nm = get_motions()
    if not nm: return jsonify({"status": "error"}), 500

    try:
        if action == "wave_right_hand": nm.wave()
        elif action == "nod_head": nm.nod()
        elif action == "shake_head": nm.shake_head()
        elif action == "explain": nm.explain()
        elif action == "thinking": nm.thinking()
        elif action == "happy": nm.happy()
        elif action == "sad": nm.sad()
        elif action == "stand": nm.stand()
        elif action == "sit": nm.sit()
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "reason": str(e)}), 500

@app.route('/joints', methods=['GET'])
def get_joints():
    nm = get_motions()
    if not nm or not nm.motion:
        return jsonify({"status": "error", "reason": "Actuator bridge or motion proxy offline"}), 500
    try:
        # Query NAOqi ALMotion for all joint names and current sensor angles
        names = nm.motion.getBodyNames("Body")
        angles = nm.motion.getAngles("Body", True)  # True = use physical sensor encoders
        
        joints_map = {}
        for name, angle in zip(names, angles):
            joints_map[str(name)] = float(angle)
            
        battery = 0
        temp = 0.0
        if _memory:
            try:
                bat_val = _memory.getData("Device/SubDeviceList/Battery/Charge/Sensor/Value")
                battery = int(bat_val * 100) if bat_val else 0
                
                temp_keys = [
                    "Device/SubDeviceList/HeadYaw/Temperature/Sensor/Value",
                    "Device/SubDeviceList/LShoulderPitch/Temperature/Sensor/Value",
                    "Device/SubDeviceList/RShoulderPitch/Temperature/Sensor/Value",
                    "Device/SubDeviceList/LHipPitch/Temperature/Sensor/Value"
                ]
                temps = _memory.getListData(temp_keys)
                valid_temps = [t for t in temps if t is not None and isinstance(t, (int, float))]
                if valid_temps:
                    temp = round(max(valid_temps), 1)
            except Exception as e:
                print("[Bridge] Sensor read error: " + str(e))
            
        return jsonify({
            "joints": joints_map,
            "battery": battery,
            "temperature": temp
        })
    except Exception as e:
        return jsonify({"status": "error", "reason": str(e)}), 500

def get_proxy(name):
    try: return ALProxy(name, ROBOT_IP, PORT)
    except Exception as e:
        print("[Bridge] Error getting proxy " + name + ": " + str(e))
        return None

if __name__ == "__main__":
    init_bridge()
    print("NAO Bridge running on port 5001")
    app.run(host="0.0.0.0", port=5001)
