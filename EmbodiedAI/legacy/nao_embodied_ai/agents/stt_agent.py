import asyncio
from .base_agent import BaseAgent

class SpeechToTextAgent(BaseAgent):
    """
    In this version, it prompts the user to type speech in the terminal.
    Acts as a manual interface for testing cognition.
    """
    async def run(self):
        self.logger.info("STT Agent ready. Type your messages in this terminal to speak to NAO.")
        
        loop = asyncio.get_event_loop()
        while True:
            # Use run_in_executor to avoid blocking the async event loop
            text = await loop.run_in_executor(None, self.get_user_input)
            
            if text.strip():
                self.logger.info(f"User Input: '{text}'")
                await self.publish("user_utterance", text)
            
            await asyncio.sleep(0.1)

    def get_user_input(self):
        try:
            # We use a custom prompt to distinguish from other logs
            return input("\n>>> [YOU]: ")
        except EOFError:
            return ""
        except Exception as e:
            return ""
