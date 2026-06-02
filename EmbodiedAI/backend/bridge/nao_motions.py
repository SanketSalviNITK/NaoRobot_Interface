# -*- coding: utf-8 -*-
import time

class NaoMotions:
    def __init__(self, motion_proxy, posture_proxy, leds_proxy=None):
        self.motion = motion_proxy
        self.posture = posture_proxy
        self.leds = leds_proxy
        self.is_moving = False

    def _safe_move(self, names, angles, times, is_absolute=True):
        """Helper to execute movements safely with error handling."""
        try:
            self.motion.angleInterpolation(names, angles, times, is_absolute)
            return True
        except Exception as e:
            print("[Motions] Error during move: " + str(e))
            return False

    def _set_leds(self, color_name, duration=0.2):
        """Helper to set eye colors if ALLeds is available."""
        if self.leds:
            try:
                self.leds.fadeRGB("FaceLeds", color_name, duration)
            except Exception as e:
                print("[Motions] LED error: " + str(e))

    def _reset_leds(self, duration=0.5):
        """Restores default white/cyan eye color."""
        if self.leds:
            try:
                self.leds.fadeRGB("FaceLeds", "white", duration)
            except: pass

    def wake_up(self):
        """Wakes up the robot and sets stiffness."""
        self.motion.wakeUp()
        self.motion.setStiffnesses("Body", 1.0)
        self._set_leds("white")

    def rest(self):
        """Safely sits and removes stiffness."""
        self.posture.goToPosture("Sit", 0.5)
        self.motion.rest()
        self.motion.setStiffnesses("Body", 0.0)
        self._set_leds("black") # Turn off LEDs

    # --- EMOTIONAL GESTURES ---

    def cheer(self):
        """Victory/Cheer gesture with green LEDs."""
        self.wake_up()
        self._set_leds("green", 0.1)
        # Throw arms up smoothly and not completely vertical to preserve center of gravity
        names = ["LShoulderPitch", "RShoulderPitch", "LShoulderRoll", "RShoulderRoll", "HeadPitch", "LHand", "RHand"]
        angles_up = [-1.0, -1.0, 0.3, -0.3, -0.3, 1.0, 1.0]
        times_up = [2.0] * len(names)
        self._safe_move(names, angles_up, times_up)
        
        time.sleep(0.5)
        
        # Bring arms down slowly to avoid downward momentum causing a fall
        angles_down = [1.4, 1.4, 0.1, -0.1, 0.0, 0.0, 0.0]
        times_down = [1.5] * len(names)
        self._safe_move(names, angles_down, times_down)
        
        self.posture.goToPosture("Stand", 0.8)
        self._reset_leds()

    def shrug(self):
        """Confused shrug with yellow LEDs."""
        self.wake_up()
        self._set_leds("yellow", 0.2)
        names = ["LShoulderRoll", "RShoulderRoll", "LElbowRoll", "RElbowRoll", "LHand", "RHand", "HeadPitch"]
        angles = [0.3, -0.3, -1.0, 1.0, 1.0, 1.0, 0.2]
        times = [0.8] * len(names)
        self._safe_move(names, angles, times)
        time.sleep(1.5)
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    def facepalm(self):
        """Embarrassed facepalm with red/purple LEDs."""
        self.wake_up()
        self._set_leds("magenta", 0.2)
        # Right hand to forehead, head down
        names = ["RShoulderPitch", "RShoulderRoll", "RElbowRoll", "RElbowYaw", "HeadPitch"]
        angles = [-0.8, -0.2, 1.5, -1.0, 0.3]
        times = [1.0] * len(names)
        self._safe_move(names, angles, times)
        time.sleep(1.5)
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    def deny(self):
        """Stop/Deny gesture with flashing red LEDs."""
        self.wake_up()
        self._set_leds("red", 0.1)
        # Hands raised forward
        names = ["LShoulderPitch", "RShoulderPitch", "LElbowRoll", "RElbowRoll", "LWristYaw", "RWristYaw", "LHand", "RHand"]
        angles = [0.0, 0.0, -1.0, 1.0, -1.5, 1.5, 1.0, 1.0]
        times = [0.8] * len(names)
        self._safe_move(names, angles, times)
        time.sleep(0.3)
        self._set_leds("black", 0.1)
        time.sleep(0.3)
        self._set_leds("red", 0.1)
        time.sleep(1.0)
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    def wave(self):
        """Friendly greeting wave with the right hand."""
        self.wake_up()
        self._set_leds("cyan", 0.2)
        names = ["RShoulderPitch", "RShoulderRoll", "RElbowRoll", "RElbowYaw", "RWristYaw", "RHand"]
        self._safe_move(names, [0.0, -0.2, 0.6, 1.5, 0.0, 1.0], [1.0, 1.0, 1.0, 1.0, 1.0, 1.0])
        for _ in range(3):
            self._safe_move("RElbowRoll", [1.2], [0.3])
            self._safe_move("RElbowRoll", [0.5], [0.3])
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    def nod(self):
        """Simple 'Yes' motion."""
        self._set_leds("green", 0.2)
        self._safe_move("HeadPitch", [0.2, -0.1, 0.2, 0.0], [0.4, 0.8, 1.2, 1.6])
        self._reset_leds()

    def shake_head(self):
        """Simple 'No' motion."""
        self._set_leds("red", 0.2)
        self._safe_move("HeadYaw", [0.5, -0.5, 0.5, 0.0], [0.5, 1.3, 2.1, 2.6])
        self._reset_leds()

    def explain(self):
        """Conversational hand gesture."""
        self._set_leds("cyan", 0.5)
        names = ["LShoulderRoll", "RShoulderRoll", "LElbowYaw", "RElbowYaw"]
        angles = [0.3, -0.3, -1.0, 1.0]
        self._safe_move(names, angles, [0.8, 0.8, 0.8, 0.8])
        time.sleep(1.0)
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    def thinking(self):
        """Tilt head to indicate processing."""
        self._set_leds("blue", 0.5)
        self._safe_move(["HeadYaw", "HeadPitch"], [0.2, 0.1], [1.0, 1.0])
        time.sleep(1.0)
        self._safe_move(["HeadYaw", "HeadPitch"], [0.0, 0.0], [1.0, 1.0])
        self._reset_leds()

    def happy(self):
        self.cheer()

    def sad(self):
        """Lower head and shoulders."""
        self._set_leds("blue", 1.0)
        self._safe_move(["HeadPitch", "LShoulderPitch", "RShoulderPitch"], [0.3, 2.0, 2.0], [1.5, 1.5, 1.5])
        time.sleep(1.0)
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    # --- DIRECTIVE GESTURES ---

    def point_right(self):
        """Point right with right arm."""
        self.wake_up()
        self._set_leds("cyan", 0.2)
        names = ["RShoulderPitch", "RShoulderRoll", "RElbowRoll", "RElbowYaw", "RHand", "HeadYaw"]
        angles = [0.0, -0.2, 0.0, 0.0, 1.0, -0.5]
        times = [1.0] * len(names)
        self._safe_move(names, angles, times)
        time.sleep(1.5)
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    def point_left(self):
        """Point left with left arm."""
        self.wake_up()
        self._set_leds("cyan", 0.2)
        names = ["LShoulderPitch", "LShoulderRoll", "LElbowRoll", "LElbowYaw", "LHand", "HeadYaw"]
        angles = [0.0, 0.2, 0.0, 0.0, 1.0, 0.5]
        times = [1.0] * len(names)
        self._safe_move(names, angles, times)
        time.sleep(1.5)
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    def present(self):
        """Vanna White style presentation gesture."""
        self.wake_up()
        self._set_leds("cyan", 0.2)
        names = ["RShoulderPitch", "RShoulderRoll", "RElbowRoll", "RElbowYaw", "RWristYaw", "RHand", "HeadYaw"]
        angles = [0.4, -0.8, 0.5, 1.0, 1.5, 1.0, -0.5]
        times = [1.2] * len(names)
        self._safe_move(names, angles, times)
        time.sleep(1.5)
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    def _presentation_loop(self):
        self.wake_up()
        self._set_leds("cyan", 0.5)
        self.is_presenting = True
        import random
        while self.is_presenting:
            names = ["HeadYaw", "HeadPitch", "LShoulderPitch", "LShoulderRoll", "RShoulderPitch", "RShoulderRoll", "LElbowYaw", "RElbowYaw", "LElbowRoll", "RElbowRoll"]
            angles = [
                random.uniform(-0.5, 0.5), # HeadYaw
                random.uniform(-0.2, 0.2), # HeadPitch
                random.uniform(0.0, 1.0),  # LShoulderPitch
                random.uniform(0.1, 0.5),  # LShoulderRoll
                random.uniform(0.0, 1.0),  # RShoulderPitch
                random.uniform(-0.5, -0.1),# RShoulderRoll
                random.uniform(-1.5, -0.5),# LElbowYaw
                random.uniform(0.5, 1.5),  # RElbowYaw
                random.uniform(-1.0, -0.2),# LElbowRoll
                random.uniform(0.2, 1.0)   # RElbowRoll
            ]
            times = [1.5] * len(names)
            self._safe_move(names, angles, times)
            time.sleep(0.5)
            
        self.posture.goToPosture("Stand", 1.0)
        self._reset_leds()

    def start_presentation(self):
        if hasattr(self, 'is_presenting') and self.is_presenting:
            return
        import threading
        t = threading.Thread(target=self._presentation_loop)
        t.daemon = True
        t.start()

    def stop_presentation(self):
        self.is_presenting = False


    def beckon(self):
        """Come here gesture."""
        self.wake_up()
        self._set_leds("blue", 0.2)
        # Arm out
        self._safe_move(["RShoulderPitch", "RShoulderRoll", "RElbowYaw", "RHand"], [0.0, -0.2, 0.0, 1.0], [1.0, 1.0, 1.0, 1.0])
        # Curl inward twice
        for _ in range(2):
            self._safe_move("RElbowRoll", [1.0], [0.4])
            self._safe_move("RElbowRoll", [0.0], [0.4])
        self.posture.goToPosture("Stand", 0.5)
        self._reset_leds()

    # --- BODY CONTROL ---

    def bow(self):
        """Formal greeting bow."""
        self.wake_up()
        self._set_leds("white", 0.5)
        # Arms down, pitch forward
        names = ["LShoulderPitch", "RShoulderPitch", "HipPitch", "HeadPitch"]
        angles = [1.5, 1.5, -0.4, 0.3]
        times = [1.5] * len(names)
        self._safe_move(names, angles, times)
        time.sleep(1.0)
        self.posture.goToPosture("Stand", 1.0)
        self._reset_leds()

    def crouch(self):
        """Safely transition to crouch posture."""
        self.wake_up()
        self._set_leds("blue", 1.0)
        self.posture.goToPosture("Crouch", 1.0)

    def stand(self):
        """Stand up safely."""
        self.wake_up()
        self.posture.goToPosture("Stand", 1.0)

    def sit(self):
        """Sit down safely."""
        self.rest()

    def look_around(self):
        """Gentle head scan."""
        self._safe_move("HeadYaw", [0.8, -0.8, 0.0], [1.5, 3.0, 1.5])
