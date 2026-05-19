import requests
import time

BRAIN_URL = "http://127.0.0.1:5001/voice_input"

def simulate_hearing(word):
    print(f"Simulating NAO hearing: '{word}'...")
    try:
        payload = {"text": word}
        r = requests.post(BRAIN_URL, json=payload)
        print(f"Brain Response: {r.json()}")
    except Exception as e:
        print(f"Failed to connect to Brain: {e}")

if __name__ == "__main__":
    test_words = ["Hello", "Joke", "Status", "Help"]
    
    print("Starting Mock Robot Test...")
    for word in test_words:
        simulate_hearing(word)
        print("-" * 20)
        time.sleep(2) # Wait for Gemini to finish