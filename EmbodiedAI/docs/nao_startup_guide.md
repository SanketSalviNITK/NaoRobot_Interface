# 🚀 NAO Embodied AI - Daily Startup Guide

Follow these simple steps in order every time you turn on your NAO robot and laptop to get the Embodied AI loop running!

---

## 💻 Step 1: Start LM Studio Server
Before starting the robot scripts, get the AI model running on your laptop.

1. Open a **new PowerShell terminal** on your laptop.
2. Start the server bound to all network interfaces:
   ```powershell
   lms server start --bind 0.0.0.0
   ```
3. Load the Gemma model into the server's memory:
   ```powershell
   lms load google/gemma-4-e4b
   ```

---

## 🌉 Step 2: Start the NAOqi Bridge (Python 2.7)
This handles the physical communication with the NAO robot.

1. Open another terminal, activate your Python 2.7 virtual environment (`nao_env`):
   ```powershell
   # If using conda or virtualenv, activate it first, for example:
   # workon nao_env   or   conda activate nao_env
   ```
2. Navigate to your project folder:
   ```powershell
   cd c:\Users\ARVR\Documents\ARVRProjects\EmbodiedAI
   ```
3. Run the bridge script:
   ```powershell
   python .\bridge_nao.py
   ```
   *Verify:* You should see `[Bridge] SUCCESS: NAO Audio and Motion ready.` and the terminal will say it's running on port `5001`.

---

## 🧠 Step 3: Start the Cognitive Brain (Python 3)
This handles the Whisper speech-to-text, LM Studio query, and action planning.

1. Open a third terminal (using Python 3).
2. Navigate to the project folder:
   ```powershell
   cd c:\Users\ARVR\Documents\ARVRProjects\EmbodiedAI
   ```
3. Run the AI script:
   ```powershell
   python3 .\minimal_ai.py
   ```
   *Verify:* You will see `[NAO EMBODIED AI: ONLINE]` and it will print the local Flask server URL on port `5002`.

---

## 🗣️ Step 4: Interact!
Now the system is fully operational. You can talk to NAO in two ways:

*   **Keyboard:** Type your prompt directly into the `minimal_ai.py` terminal and press `Enter`.
*   **Voice (Echo Mode):** Speak directly to NAO. The robot's face LEDs will turn **green** when listening, record your voice, transfer the file, transcribe it via Whisper, and reply with speech and physical motions!

---

### 🔍 Quick Troubleshooting Checklist
*   **Target Machine Actively Refused It:** LM Studio server is stopped or you forgot to run it with `--bind 0.0.0.0`.
*   **Multiple Models Loaded:** The script handles this automatically now, but you can clean up memory by running `lms unload --all`.
*   **No Sound captured:** Ensure your laptop and robot are connected to the same LAN cable/network. The robot needs to be accessible at `169.254.175.171`.
