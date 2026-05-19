import asyncio
import cv2
import numpy as np
import logging
from .base_agent import BaseAgent

class UIAgent(BaseAgent):
    """
    HUD (Heads-Up Display) Agent.
    Subscribes to camera frames and overlays telemetry/speech data.
    """
    def __init__(self, name, bus):
        super().__init__(name, bus)
        self.current_frame = None
        self.last_utterance = "Listening..."
        self.last_reply = "Ready."
        self.last_scene = "Scanning..."
        self.window_name = "NAO Embodied AI - Live Telemetry"

    async def run(self):
        self.subscribe("camera_frames", self.handle_frames)
        self.subscribe("user_utterance", self.handle_utterance)
        self.subscribe("speak_text", self.handle_reply)
        self.subscribe("scene_description", self.handle_scene)
        
        self.logger.info("UI Agent (HUD) started. Waiting for first frame...")
        
        try:
            while True:
                if self.current_frame is not None:
                    self.draw_hud()
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        self.logger.info("User requested shutdown via UI.")
                        break
                await asyncio.sleep(0.05)
        except Exception as e:
            self.logger.error(f"UI Loop crashed: {e}")
        finally:
            cv2.destroyAllWindows()

    async def handle_frames(self, frame_obj):
        try:
            if not isinstance(frame_obj, dict): return
            
            width = frame_obj["width"]
            height = frame_obj["height"]
            data = frame_obj["data"]
            
            # Convert raw RGB to BGR for OpenCV
            frame = np.frombuffer(data, dtype=np.uint8)
            if len(frame) == height * width * 3:
                frame = frame.reshape((height, width, 3))
                self.current_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            else:
                self.logger.warning(f"Malformed frame data: expected {height*width*3}, got {len(frame)}")
        except Exception as e:
            self.logger.error(f"UI Frame Error: {e}")

    async def handle_utterance(self, text):
        self.last_utterance = f"LISTEN: {text}"

    async def handle_reply(self, text):
        self.last_reply = f"REPLY: {text}"

    async def handle_scene(self, text):
        self.last_scene = f"SIGHT: {text}"

    def draw_hud(self):
        try:
            canvas = self.current_frame.copy()
            h, w, _ = canvas.shape

            # HUD Background
            overlay = canvas.copy()
            cv2.rectangle(overlay, (0, h-100), (w, h), (0, 0, 0), -1)
            cv2.addWeighted(overlay, 0.7, canvas, 0.3, 0, canvas)

            # HUD Text
            font = cv2.FONT_HERSHEY_SIMPLEX
            cv2.putText(canvas, self.last_scene, (10, h-70), font, 0.5, (255, 255, 0), 1)
            cv2.putText(canvas, self.last_utterance, (10, h-45), font, 0.5, (0, 255, 0), 1)
            cv2.putText(canvas, self.last_reply, (10, h-20), font, 0.5, (0, 255, 255), 1)
            
            # Connection Indicator
            cv2.circle(canvas, (w-20, 20), 8, (0, 255, 0), -1)
            cv2.putText(canvas, "LIVE", (w-65, 25), font, 0.4, (0, 255, 0), 1)

            cv2.imshow(self.window_name, canvas)
        except Exception as e:
            self.logger.error(f"HUD Drawing error: {e}")
