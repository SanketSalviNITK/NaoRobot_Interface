from flask import Flask, request, jsonify
import werkzeug.utils
import os
import requests
import json
import threading
import document_parser

server = Flask(__name__)

# Constants
LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions"

@server.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def generate_slides_from_text(text):
    system_prompt = (
        "You are an AI assistant that summarizes document text into presentation slides. "
        "You MUST output ONLY a valid JSON array. Each element in the array represents a slide. "
        "Each slide must have the following keys: 'title' (string), 'bullets' (array of strings), and 'speaker_notes' (string). "
        "Example output: [{\"title\": \"Introduction\", \"bullets\": [\"Welcome to the presentation\"], \"speaker_notes\": \"Hello everyone, welcome...\"}]"
    )
    
    # Simple chunking: take up to ~8000 characters to fit in context for testing
    truncated_text = text[:8000]

    payload = {
        "model": "google/gemma-4-e4b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Create slides for the following text:\n\n{truncated_text}"}
        ],
        "temperature": 0.3,
        "max_tokens": 2048,
        "stream": False
    }
    
    try:
        response = requests.post(LM_STUDIO_URL, json=payload, timeout=60)
        response.raise_for_status()
        raw_text = response.json()['choices'][0]['message']['content'].strip()
        
        # Robust JSON extraction
        start_idx = raw_text.find('[')
        end_idx = raw_text.rfind(']')
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            extracted_json = raw_text[start_idx:end_idx+1]
        else:
            extracted_json = raw_text
            
        slides = json.loads(extracted_json)
        return slides
    except Exception as e:
        print(f"[Error] LM Studio reasoning failed: {e}")
        return []

@server.route('/upload_presentation', methods=['POST'])
def upload_presentation():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
        
    if file:
        filename = werkzeug.utils.secure_filename(file.filename)
        temp_path = os.path.join(os.path.dirname(__file__), filename)
        file.save(temp_path)
        
        text = ""
        if filename.lower().endswith(".pdf"):
            text = document_parser.extract_text_from_pdf(temp_path)
        
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        if not text:
            return jsonify({"status": "error", "message": "Could not extract text"}), 500
            
        slides = generate_slides_from_text(text)
        
        if not slides:
            return jsonify({"status": "error", "message": "Failed to generate slides"}), 500
            
        return jsonify({
            "status": "success", 
            "message": "Slides generated",
            "slides": slides
        })

def start_lm_studio():
    try:
        import subprocess
        print("[Sandbox] Automating LM Studio startup...")
        print("[Sandbox] Starting LM Studio Server on all network interfaces...")
        subprocess.call("lms server start --bind 0.0.0.0", shell=True)
        print("[Sandbox] Loading model google/gemma-4-e4b...")
        subprocess.call("lms load google/gemma-4-e4b", shell=True)
        print("[Sandbox] LM Studio automation completed.")
    except Exception as lms_err:
        print("[Sandbox] Warning: Failed to automate LM Studio startup: " + str(lms_err))

if __name__ == "__main__":
    print("[Sandbox Presentation] Starting on Port 5003...")
    start_lm_studio()
    server.run(host="0.0.0.0", port=5003, debug=True, use_reloader=False)
