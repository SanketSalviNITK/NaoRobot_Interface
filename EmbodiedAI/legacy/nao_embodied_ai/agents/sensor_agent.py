import asyncio
from .base_agent import BaseAgent

class SensorContextAgent(BaseAgent):
    """
    Subscribes to raw sensor data and publishes high-level environment context.
    E.g., "Someone touched my head" or "I am close to an obstacle".
    """
    def __init__(self, name, bus):
        super().__init__(name, bus)

    async def run(self):
        self.subscribe("sensor_data", self.handle_sensors)
        self.logger.info("Sensor Context Agent ready.")
        while True:
            await asyncio.sleep(1)

    async def handle_sensors(self, data):
        """
        Interprets tactile, sonar, and battery data.
        """
        context = []
        
        # Sonar logic
        sonar_val = data.get("sonar", 1.0)
        if sonar_val < 0.3:
            context.append("There is an obstacle very close to me.")
        
        # Bumper logic
        if data.get("left_bumper", 0) > 0.5:
            context.append("My left foot bumper was triggered.")
            
        if context:
            summary = " ".join(context)
            self.logger.info(f"Environment Context Update: {summary}")
            await self.publish("environment_context", summary)
