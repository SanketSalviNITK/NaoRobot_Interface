import whisper
import requests
import time
import os
import sys

# --- AUTO-FIX FOR FFMPEG ---
try:
    import imageio_ffmpeg
    import shutil
    exe_path = imageio_ffmpeg.get_ffmpeg_exe()
    local_ffmpeg = os.path.join(os.getcwd(), "ffmpeg.exe")
    if not os.path.exists(local_ffmpeg):
        shutil.copy(exe_path, local_ffmpeg)
    # Add current directory to PATH so 'ffmpeg' command works
    if os.getcwd() not in os.environ['PATH']:
        os.environ['PATH'] = os.getcwd() + os.pathsep + os.environ['PATH']
    print(f"[System] FFmpeg bridged to: {local_ffmpeg}")
except Exception as e:
    print(f"[Warning] FFmpeg bridge failed: {e}")

BRIDGE_URL = "http://127.0.0.1:5001"

def test_nao_speech():
    print("⏳ Loading Whisper model (base)...")
    try:
        model = whisper.load_model("base")
        print("✅ Whisper Ready.")
        
        # 1. Start Recording on NAO
        print("\n🎤 Requesting NAO to start recording...")
        resp_start = requests.post(f"{BRIDGE_URL}/record/start")
        if resp_start.status_code != 200:
            print("❌ Failed to start recording on NAO.")
            return

        print(">>> Speak to the robot now! (5 seconds)")
        time.sleep(5)

        # 2. Stop Recording and get file
        print("🛑 Stopping recording...")
        resp_stop = requests.post(f"{BRIDGE_URL}/record/stop")
        if resp_stop.status_code != 200:
            print("❌ Failed to stop recording on NAO.")
            return
        
        audio_file = resp_stop.json().get("filename", "nao_mic_input.wav")
        
        if not os.path.exists(audio_file):
            print(f"❌ Error: Could not find the recorded file '{audio_file}'.")
            return

        # 3. Transcribe
        print(f"🔍 Transcribing audio from NAO's mic...")
        result = model.transcribe(audio_file)
        
        print("\n" + "="*30)
        print("🤖 NAO HEARD:")
        print(result["text"].strip())
        print("="*30 + "\n")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_nao_speech()
