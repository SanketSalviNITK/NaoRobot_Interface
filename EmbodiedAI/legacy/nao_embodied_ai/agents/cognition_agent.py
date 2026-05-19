import os
import asyncio
import json
import google.generativeai as genai
from .base_agent import BaseAgent

class CognitionAgent(BaseAgent):
    """
    The Brain of the system.
    Subscribes to all perception data and uses Gemini to decide the next action.
    Outputs structured JSON intents.
    """
    def __init__(self, name, bus):
        super().__init__(name, bus)
        self.context = {
            "last_seen": "nothing in particular",
            "environment": "clear",
            "history": []
        }
        
        # --- CONFIGURE GEMINI ---
        API_KEY = os.getenv("GEMINI_API_KEY", "your-key-here")
        try:
            genai.configure(api_key=API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.logger.info("Gemini Brain successfully integrated into Cognition Agent.")
        except Exception as e:
            self.logger.error(f"Failed to initialize Gemini in CognitionAgent: {e}")
            self.model = None

    async def run(self):
        self.subscribe("user_utterance", self.handle_utterance)
        self.subscribe("scene_description", self.handle_vision)
        self.subscribe("environment_context", self.handle_sensors)
        self.logger.info("Cognition Agent ready.")
        
        # Keep the agent alive
        while self.is_running:
            await asyncio.sleep(1)

    async def handle_vision(self, description):
        self.context["last_seen"] = description

    async def handle_sensors(self, context_summary):
        self.context["environment"] = context_summary

    async def handle_utterance(self, text):
        """
        Trigger reasoning when the user speaks.
        """
        self.logger.info(f"Reasoning about user input: '{text}'")
        
        if not self.model:
            self.logger.warning("Gemini model not initialized. Using fallback.")
            await self.publish("ai_intent", json.dumps({"intent": "interact", "speech": "My brain is offline.", "gesture": "none"}))
            return

        # Construct a rich prompt using visual and sensor context
        prompt = (
            f"SYSTEM: You are a NAO humanoid robot. Keep your speech responses short and friendly (max 20 words). "
            f"Output JSON only with keys: 'intent', 'speech', 'gesture'. "
            f"GESTURES AVAILABLE: 'wave_right_hand', 'nod_head', 'shake_head'.\n"
            f"CURRENT VISUALS: {self.context['last_seen']}\n"
            f"ENVIRONMENT STATUS: {self.context['environment']}\n"
            f"USER INPUT: {text}"
        )

        try:
            # Call Gemini
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            raw_text = response.text.strip()
            
            # Clean up potential markdown formatting from LLM
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            
            decision = json.loads(raw_text)
            self.logger.info(f"AI Decision: {decision['speech']}")
            
            # Publish intent to Action Planner
            await self.publish("ai_intent", json.dumps(decision))
            
        except Exception as e:
            self.logger.error(f"Gemini reasoning failed: {e}")
            await self.publish("ai_intent", json.dumps({
                "intent": "interact", 
                "speech": "I had a bit of trouble thinking there. Could you say that again?",
                "gesture": "shake_head"
            }))
