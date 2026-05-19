import requests
import time

BRIDGE_URL = "http://127.0.0.1:5001/motion"

MOTIONS = [
    "stand",
    "wave_right_hand",
    "nod_head",
    "shake_head",
    "thinking",
    "explain",
    "happy",
    "sad",
    "sit"
]

def test_motions():
    print("🚀 Starting Full Motion Test...")
    print("Make sure NAO has enough space around it!")
    
    for motion in MOTIONS:
        print("\n--- Testing: {} ---".format(motion))
        try:
            response = requests.post(BRIDGE_URL, json={"action": motion})
            if response.status_code == 200:
                print("✅ {} successful".format(motion))
            else:
                print("❌ {} failed: {}".format(motion, response.text))
        except Exception as e:
            print("❗ Connection Error: {}".format(e))
            break
        
        # Wait for the motion to finish before starting next one
        time.sleep(4)

    print("\n✅ All tests completed.")

if __name__ == "__main__":
    test_motions()
