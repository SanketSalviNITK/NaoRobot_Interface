import requests

for i in range(5):
    try:
        response = requests.post(
            'http://169.254.175.100:1234/v1/chat/completions',
            json={
                'messages': [
                    {'role': 'system', 'content': 'You are a robot. Reply ONLY with JSON: {"speech": "...", "gesture": "..."}'},
                    {'role': 'user', 'content': 'tell me a joke'}
                ],
                'temperature': 0.7
            }
        )
        print(f"Response {i+1}:")
        print(repr(response.json()['choices'][0]['message']['content']))
    except Exception as e:
        print(f"Error: {e}")
