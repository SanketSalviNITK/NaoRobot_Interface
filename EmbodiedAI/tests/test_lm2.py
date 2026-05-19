import requests
import json

payload = {
    'messages': [
        {'role': 'system', 'content': 'You are a robot. Reply ONLY with JSON: {"speech": "...", "gesture": "..."}'},
        {'role': 'user', 'content': 'tell me a joke'}
    ],
    'temperature': 0.7,
    'response_format': {'type': 'json_object'}
}
try:
    response = requests.post('http://169.254.175.100:1234/v1/chat/completions', json=payload)
    print("Status:", response.status_code)
    print("Response JSON:")
    print(response.json())
except Exception as e:
    print(f"Error: {e}")
