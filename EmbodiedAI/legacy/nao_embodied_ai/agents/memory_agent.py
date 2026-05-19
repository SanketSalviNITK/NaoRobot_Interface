import asyncio
from .base_agent import BaseAgent

class MemoryAgent(BaseAgent):
    """
    Manages long-term memory, conversation history, and entity recognition.
    """
    def __init__(self, name, bus):
        super().__init__(name, bus)
        self.history = []
        self.known_people = {}

    async def run(self):
        self.subscribe("user_utterance", self.record_user)
        self.subscribe("ai_intent", self.record_ai)
        self.logger.info("Memory Agent ready.")
        while True:
            await asyncio.sleep(1)

    async def record_user(self, text):
        self.history.append({"role": "user", "content": text})
        self.logger.info(f"Stored user utterance in memory (History size: {len(self.history)})")

    async def record_ai(self, intent_json):
        self.history.append({"role": "ai", "content": intent_json})
        # Trim history if too long
        if len(self.history) > 100:
            self.history.pop(0)
