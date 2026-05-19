import sys
import os

# Add Naoqi SDK to path
sdk_path = r"C:\Users\ARVR\Downloads\pynaoqi-python2.7-2.8.6.23-win64-vs2015-20191127_152649\pynaoqi-python2.7-2.8.6.23-win64-vs2015-20191127_152649\lib"
if os.path.exists(sdk_path):
    sys.path.append(sdk_path)

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from robot_controller import NaoRobot
import os
import time

app = Flask(__name__)
CORS(app)

# Global robot instance
robot = NaoRobot(ip="169.254.175.171", mock=False)

def gen_frames():
    while True:
        frame = robot.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        else:
            # Generate a "NO SIGNAL" placeholder frame
            from PIL import Image, ImageDraw
            import io
            img = Image.new('RGB', (320, 240), color = (20, 20, 30))
            d = ImageDraw.Draw(img)
            d.text((110,110), "OPTICAL_OFFLINE", fill=(0,242,255))
            
            buf = io.BytesIO()
            img.save(buf, format='JPEG')
            frame = buf.getvalue()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            time.sleep(1.0) # Lower frame rate for standby

@app.route('/api/video_feed')
def video_feed():
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/connect', methods=['POST'])
def connect():
    global robot
    data = request.json
    ip = data.get('ip')
    port = int(data.get('port', 9559))
    mock = data.get('mock', False)
    
    robot = NaoRobot(ip=ip, port=port, mock=mock)
    return jsonify(robot.get_status())

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(robot.get_status())

@app.route('/api/say', methods=['POST'])
def say():
    data = request.json
    text = data.get('text', 'Hello!')
    result = robot.say(text)
    return jsonify(result)

@app.route('/api/action', methods=['POST'])
def action():
    data = request.json
    action_type = data.get('action')
    
    if action_type == 'stand':
        result = robot.stand()
    elif action_type == 'sit':
        result = robot.sit()
    elif action_type == 'rest':
        result = robot.rest()
    elif action_type == 'wakeup':
        result = robot.wake_up()
    else:
        return jsonify({"status": "error", "message": "Unknown action"}), 400
        
    return jsonify(result)

@app.route('/api/life', methods=['POST'])
def toggle_life():
    data = request.json
    state = data.get('state', 'disabled')
    success = robot.set_autonomous_life(state)
    return jsonify({"status": "success" if success else "error", "state": state})

@app.route('/api/disconnect', methods=['POST'])
def disconnect():
    success = robot.disconnect()
    return jsonify({"status": "success" if success else "error"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
