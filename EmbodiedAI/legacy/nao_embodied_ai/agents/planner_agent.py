import json
from .base_agent import BaseAgent

class ActionPlannerAgent(BaseAgent):
    """
    Safety and mapping layer.
    Subscribes to AI intents and converts them into low-level robot commands.
    Ensures the LLM never controls joints directly.
    """
    def __init__(self, name, bus):
        super().__init__(name, bus)
        
        # Skill Mapping: AI Intent -> Robot Action
        self.skill_map = {
            "greet_user": "wave_right_hand",
            "stand": "stand_up",
            "wave": "wave_right_hand",
            "rest": "sit_down" # Placeholder for future skill
        }

    async def run(self):
        self.subscribe("ai_intent", self.handle_intent)
        self.logger.info("Action Planner ready.")
        while True:
            import asyncio
            await asyncio.sleep(1)

    async def handle_intent(self, intent_json):
        """
        Parses structured intent and routes to Gateway.
        Example Intent: {"intent": "greet_user", "speech": "Hello!", "gesture": "wave"}
        """
        try:
            data = json.loads(intent_json) if isinstance(intent_json, str) else intent_json
            intent = data.get("intent")
            speech = data.get("speech")
            gesture = data.get("gesture")

            self.logger.info(f"Planning actions for intent: {intent}")

            # 1. Handle Speech
            if speech:
                await self.publish("speak_text", speech)

            # 2. Handle Gesture/Motion
            # Use specific gesture if provided, otherwise map the intent
            action_to_exec = gesture or self.skill_map.get(intent)
            
            if action_to_exec:
                # Resolve mapping if needed (e.g. "wave" -> "wave_right_hand")
                resolved_action = self.skill_map.get(action_to_exec, action_to_exec)
                await self.publish("execute_motion", resolved_action)
            
        except Exception as e:
            self.logger.error(f"Error parsing intent: {e}")
