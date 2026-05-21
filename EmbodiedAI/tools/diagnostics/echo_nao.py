import requests
import time
import os
import whisper
import paramiko

# --- ROBOT SSH CONFIG ---
ROBOT_IP = "169.254.175.171"
ROBOT_USER = "nao"
ROBOT_PASS = "nao"
REMOTE_FILE = "/home/nao/nao_mic_input.wav"
LOCAL_FILE = "nao_mic_input.wav"

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

BRIDGE_URL = "http://127.0.0.1:5001"

def download_audio():
    """Downloads the recorded file from the robot via SCP/SSH."""
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(ROBOT_IP, username=ROBOT_USER, password=ROBOT_PASS)
        sftp = ssh.open_sftp()
        sftp.get(REMOTE_FILE, LOCAL_FILE)
        sftp.close()
        ssh.close()
        return True
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False

def echo_loop():
    print("⏳ Loading Whisper...")
    model = whisper.load_model("base")
    print("✅ Ready! I will echo everything NAO hears (via SSH Fetch).")
    
    try:
        while True:
            print("\n🎤 Listening to robot's mics...")
            requests.post(f"{BRIDGE_URL}/record/start")
            time.sleep(4) 
            
            requests.post(f"{BRIDGE_URL}/record/stop")
            
            print("📥 Downloading audio from robot...")
            if download_audio():
                result = model.transcribe(LOCAL_FILE)
                text = result["text"].strip()
                if text:
                    print(f"🤖 NAO HEARD: {text}")
                    # Forward to the AI Brain
                    try:
                        brain_url = "http://127.0.0.1:5002/voice_input"
                        requests.post(brain_url, json={"text": text}, timeout=5)
                    except Exception as e:
                        print(f"❌ Failed to reach Brain: {e}")
                else:
                    print("... (silence) ...")
            
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Stopping echo.")

if __name__ == "__main__":
    echo_loop()
