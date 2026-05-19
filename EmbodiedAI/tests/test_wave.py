import requests
import json

BRIDGE_URL = "http://127.0.0.1:5001/motion"

def test_wave():
    print("Sending wave request to Bridge...")
    payload = {"action": "wave_right_hand"}
    try:
        response = requests.post(BRIDGE_URL, json=payload)
        if response.status_code == 200:
            print("SUCCESS: NAO should be waving now!")
        else:
            print("FAILED: Bridge returned error", response.status_code, response.text)
    except Exception as e:
        print("FAILED: Could not connect to Bridge:", str(e))

if __name__ == "__main__":
    test_wave()
