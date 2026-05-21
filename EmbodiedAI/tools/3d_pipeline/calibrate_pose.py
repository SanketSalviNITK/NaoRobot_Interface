# -*- coding: utf-8 -*-
import sys
import os
import time

SDK_PATH = r"C:\Users\ARVR\Documents\ARVRProjects\EmbodiedAI\pynaoqi-python2.7-2.8.6.23-win64-vs2015-20191127_152649\lib"
if SDK_PATH not in sys.path:
    sys.path.append(SDK_PATH)
if SDK_PATH not in os.environ['PATH']:
    os.environ['PATH'] = SDK_PATH + os.pathsep + os.environ['PATH']

from naoqi import ALProxy

ROBOT_IP = "169.254.80.144"
PORT = 9559

def main():
    print("Connecting to ALRobotPosture at {}...".format(ROBOT_IP))
    try:
        postureProxy = ALProxy("ALRobotPosture", ROBOT_IP, PORT)
    except Exception as e:
        print("Could not create proxy to ALRobotPosture: " + str(e))
        return

    print("Successfully connected. Transitioning to 'StandInit' at 20% speed (very slow)...")
    postureProxy.goToPosture("StandInit", 0.2)
    print("Transition complete. The robot is now in StandInit pose.")
    
    # Give the sensors a second to settle
    time.sleep(1.0)
    print("Calibration pose achieved.")

if __name__ == "__main__":
    main()
