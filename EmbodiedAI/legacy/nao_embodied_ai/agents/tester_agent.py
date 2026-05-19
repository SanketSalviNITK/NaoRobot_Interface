import asyncio
from .base_agent import BaseAgent

class TesterAgent(BaseAgent):
    """
    Automated test agent to verify the robot's physical output.
    """
    async def run(self):
        self.logger.info("Automated Tester Agent active. Preparing test sequence...")
        
        # Wait for system to stabilize
        await asyncio.sleep(5)
        
        test_phrases = [
            "Initiating voice system test.",
            "Testing speaker volume at maximum level.",
            "I am now waving my right hand.",
            "System check complete. I am ready for your commands."
        ]
        
        for phrase in test_phrases:
            self.logger.info(f"TEST: Requesting speech: '{phrase}'")
            await self.publish("speak_text", phrase)
            
            if "wave" in phrase:
                await self.publish("execute_motion", "wave_right_hand")
            
            await asyncio.sleep(5) # Wait for speech to finish
        
        self.logger.info("Automated test sequence finished.")
