# -*- coding: utf-8 -*-
import time

class NaoMotions:
    def __init__(self, motion_proxy, posture_proxy):
        self.motion = motion_proxy
        self.posture = posture_proxy
        self.is_moving = False

    def _safe_move(self, names, angles, times, is_absolute=True):
        """Helper to execute movements safely with error handling."""
        try:
            self.motion.angleInterpolation(names, angles, times, is_absolute)
            return True
        except Exception as e:
            print("[Motions] Error during move: " + str(e))
            return False

    def wake_up(self):
        """Wakes up the robot and sets stiffness."""
        self.motion.wakeUp()
        self.motion.setStiffnesses("Body", 1.0)

    def rest(self):
        """Safely sits and removes stiffness."""
        self.posture.goToPosture("Sit", 0.5)
        self.motion.rest()
        self.motion.setStiffnesses("Body", 0.0)

    # --- SOCIAL GESTURES ---

    def wave(self):
        """Friendly greeting wave with the right hand."""
        self.wake_up()
        names = ["RShoulderPitch", "RShoulderRoll", "RElbowRoll", "RElbowYaw", "RWristYaw"]
        # Raise arm safely
        self._safe_move(names, [0.0, -0.2, 0.6, 1.5, 0.0], [1.0, 1.0, 1.0, 1.0, 1.0])
        # Wave back and forth
        for _ in range(3):
            self._safe_move("RElbowRoll", [1.2], [0.3])
            self._safe_move("RElbowRoll", [0.5], [0.3])
        # Return to natural stand
        self.posture.goToPosture("Stand", 0.5)

    def nod(self):
        """Simple 'Yes' motion."""
        # Times must be cumulative: 0.4s, 0.8s, 1.2s, 1.6s
        self._safe_move("HeadPitch", [0.2, -0.1, 0.2, 0.0], [0.4, 0.8, 1.2, 1.6])

    def shake_head(self):
        """Simple 'No' motion."""
        # Times must be cumulative: 0.5s, 1.3s, 2.1s, 2.6s
        self._safe_move("HeadYaw", [0.5, -0.5, 0.5, 0.0], [0.5, 1.3, 2.1, 2.6])

    def explain(self):
        """Conversational hand gesture."""
        names = ["LShoulderRoll", "RShoulderRoll", "LElbowYaw", "RElbowYaw"]
        angles = [0.3, -0.3, -1.0, 1.0]
        self._safe_move(names, angles, [0.8, 0.8, 0.8, 0.8])
        time.sleep(1.0)
        self.posture.goToPosture("Stand", 0.5)

    def thinking(self):
        """Tilt head to indicate processing."""
        self._safe_move(["HeadYaw", "HeadPitch"], [0.2, 0.1], [1.0, 1.0])
        time.sleep(1.0)
        self._safe_move(["HeadYaw", "HeadPitch"], [0.0, 0.0], [1.0, 1.0])

    def happy(self):
        """Small joyful movement."""
        # Raise head and arms
        self.motion.post.angleInterpolation("HeadPitch", [-0.2], [0.5], True)
        self.motion.angleInterpolation(["LShoulderPitch", "RShoulderPitch"], [0.5, 0.5], [0.6, 0.6], True)
        time.sleep(1.0)
        self.posture.goToPosture("Stand", 0.5)

    def sad(self):
        """Lower head and shoulders."""
        self._safe_move(["HeadPitch", "LShoulderPitch", "RShoulderPitch"], [0.3, 2.0, 2.0], [1.5, 1.5, 1.5])
        time.sleep(1.0)
        self.posture.goToPosture("Stand", 0.5)

    # --- BODY CONTROL ---

    def stand(self):
        """Stand up safely."""
        self.wake_up()
        self.posture.goToPosture("Stand", 0.5)

    def sit(self):
        """Sit down safely."""
        self.posture.goToPosture("Sit", 0.5)
        self.motion.setStiffnesses("Body", 0.0)

    def look_around(self):
        """Gentle head scan."""
        self._safe_move("HeadYaw", [0.8, -0.8, 0.0], [1.5, 3.0, 1.5])
