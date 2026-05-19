import asyncio
from .base_agent import BaseAgent

class VisionAgent(BaseAgent):
    """
    Subscribes to camera frames and interprets the scene.
    Provides high-level text descriptions for the Cognition Agent.
    """
    def __init__(self, name, bus):
        super().__init__(name, bus)
        self.last_description = ""

    async def run(self):
        self.subscribe("camera_frames", self.handle_frames)
        self.logger.info("Vision Agent ready.")
        
        while True:
            # Periodically perform "inference" if new data arrived
            if self.last_description:
                # In a real system, this would happen per frame or at a fixed FPS
                await self.publish("scene_description", self.last_description)
                self.logger.info(f"Published scene: {self.last_description}")
                self.last_description = "" # Reset after publishing
            
            await asyncio.sleep(2) # Process scene every 2 seconds

    async def handle_frames(self, frame_bytes):
        """
        Placeholder for CV logic (OpenCV, YOLO, etc.)
        """
        # self.logger.debug("Received frame for processing")
        
        # MOCK INFERENCE: Randomly detect objects
        import random
        detections = ["a person smiling", "a red ball", "a bright room", "nothing interesting"]
        self.last_description = f"I see {random.choice(detections)}."
