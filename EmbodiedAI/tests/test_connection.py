import sys
SDK_PATH = r"C:\Users\ARVR\Documents\ARVRProjects\EmbodiedAI\pynaoqi-python2.7-2.8.6.23-win64-vs2015-20191127_152649\lib"
sys.path.append(SDK_PATH)
from naoqi import ALProxy

ip = "169.254.175.171"
port = 9559
print("Testing connection to " + ip + ":" + str(port))
try:
    tts = ALProxy("ALTextToSpeech", ip, port)
    tts.say("Connection successful")
    print("SUCCESS")
except Exception as e:
    print("FAILED: " + str(e))
