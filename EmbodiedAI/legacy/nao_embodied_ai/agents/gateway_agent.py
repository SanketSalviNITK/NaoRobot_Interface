import asyncio
import logging
import aiohttp
from .base_agent import BaseAgent
from ..config import settings

class NaoGatewayAgent(BaseAgent):
    """
    The bridge between the message bus and the physical NAO robot.
    In this version, it communicates with a Python 2.7 Bridge process
    that has direct access to the NAOqi SDK.
    """
    def __init__(self, name: str, bus):
        super().__init__(name, bus)
        self.bridge_url = "http://127.0.0.1:5001"
        self.session = None

    async def connect(self):
        """Check if the Python 2.7 Bridge is active."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.bridge_url}/sensors") as response:
                    if response.status == 200:
                        self.logger.info("Connected to Python 2.7 Bridge (Neural Link established).")
                        return True
        except Exception as e:
            self.logger.error(f"Could not reach Python 2.7 Bridge: {e}")
            self.logger.warning("Ensure the bridge is running in your nao_env (Python 2.7).")
            return False

    async def run(self):
        """Main gateway loop."""
        self.subscribe("speak_text", self.handle_speak)
        self.subscribe("execute_motion", self.handle_motion)

        self.logger.info("Gateway Agent ready and listening for bus commands.")
        
        # Main persistent session
        async with aiohttp.ClientSession() as session:
            self.session = session # Store for handle_speak/handle_motion
            
            # Initial status check
            await self.connect()

            while True:
                try:
                    # 1. Stream Sensors (Lower frequency)
                    async with self.session.get(f"{self.bridge_url}/sensors", timeout=1.0) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            await self.publish("sensor_data", data)
                    
                    # 2. Stream Camera (DISABLED FOR VOICE TEST)
                    # async with self.session.get(f"{self.bridge_url}/camera", timeout=2.0) as resp:
                    #     if resp.status == 200:
                    #         cam_data = await resp.json()
                    #         if "data" in cam_data:
                    #             import base64
                    #             frame_bytes = base64.b64decode(cam_data["data"])
                    #             await self.publish("camera_frames", {
                    #                 "width": cam_data["width"],
                    #                 "height": cam_data["height"],
                    #                 "data": frame_bytes
                    #             })
                except Exception as e:
                    self.logger.debug(f"Gateway loop warning: {e}")
                
                await asyncio.sleep(0.5) # Slow down polling to leave room for Speak/Motion

    async def handle_speak(self, text):
        """Send speech command to the Bridge."""
        if not self.session: return
        self.logger.info(f"Relaying speech to bridge: {text}")
        try:
            async with self.session.post(f"{self.bridge_url}/speak", json={"text": text}, timeout=5.0) as resp:
                if resp.status == 200:
                    self.logger.info("Bridge accepted speech command.")
                else:
                    self.logger.error(f"Bridge rejected speech: {resp.status}")
        except Exception as e:
            self.logger.error(f"Bridge speech request failed: {e}")

    async def handle_motion(self, action_name):
        """Send motion command to the Bridge."""
        if not self.session: return
        self.logger.info(f"Relaying motion to bridge: {action_name}")
        try:
            async with self.session.post(f"{self.bridge_url}/motion", json={"action": action_name}, timeout=5.0) as resp:
                if resp.status == 200:
                    self.logger.info("Bridge accepted motion command.")
                else:
                    self.logger.error(f"Bridge rejected motion: {resp.status}")
        except Exception as e:
            self.logger.error(f"Bridge motion request failed: {e}")
