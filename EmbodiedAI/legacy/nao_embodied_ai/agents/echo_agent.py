import asyncio
from .base_agent import BaseAgent

class EchoCognitionAgent(BaseAgent):
    """
    A temporary agent that simply echoes user utterances.
    Subscribes to: user_utterance
    Publishes: speak_text
    """
    async def run(self):
        self.subscribe("user_utterance", self.handle_utterance)
        self.logger.info("Echo Cognition Agent ready.")
        while True:
            await asyncio.sleep(1)

    async def handle_utterance(self, text):
        self.logger.info(f"Echoing user input: '{text}'")
        # Direct pass-through to gateway via speak_text
        await self.publish("speak_text", f"I heard you say: {text}")
