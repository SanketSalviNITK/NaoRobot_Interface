import requests

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

payload = {
    "model": "google/gemma-4-e4b",
    "messages": [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "tell me a joke"}
    ],
    "temperature": 0.7,
    "max_tokens": 300,
    "stream": False
}

response = requests.post("http://169.254.175.100:1234/v1/chat/completions", json=payload)
print("Status:", response.status_code)
print("Response text:")
print(response.text)
