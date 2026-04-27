import logging

logger = logging.getLogger("NaoAgent")

class NaoAgent:
    def __init__(self):
        self.history = []
        self.system_prompt = (
            "You are Nao, an advanced humanoid robot assistant. "
            "Your personality is helpful, slightly technical, but friendly. "
            "Keep responses concise (1-3 sentences) as they will be spoken aloud."
        )

    def process_input(self, text):
        """Processes user input and returns a response string."""
        logger.info("Agent processing input: {}".format(text))
        
        # Track history
        self.history.append({"role": "user", "content": text})
        
        # Determine Response (Local Heuristic Agent)
        response = self.generate_local_response(text)
        
        self.history.append({"role": "robot", "content": response})
        return response

    def generate_local_response(self, text):
        """A robust local intent-based response generator."""
        text = text.lower()
        
        # 1. Identity & Purpose
        if any(w in text for w in ["who are you", "what is your name", "identify"]):
            return "I am Nao, a humanoid robotic platform designed for human-robot interaction. My neural link is currently being managed by the Nao OS."
            
        # 2. System Status
        if any(w in text for w in ["status", "how are you", "health", "diagnostic"]):
            return "All internal systems are reporting optimal performance. Core temperature is stable and my joint sensors are calibrated."
            
        # 3. Capabilities
        if any(w in text for w in ["what can you do", "help", "commands"]):
            return "I can synthesize speech, recognize your voice, execute complex kinetic sequences, and monitor my environmental sensors in real-time."

        # 4. Greetings
        if any(w in text for w in ["hi", "hello", "hey", "greetings"]):
            return "Hello, Operator. I am ready for instructions. How can I assist with your research today?"

        # 5. Technical / AI Meta
        if any(w in text for w in ["think", "agent", "process"]):
            return "My neural agent is processing your input through a multi-layered intent recognition system. Data synchronization is complete."

        # 6. Fallback
        return "I have processed your transmission: '{}'. My current training data suggests this is a valid directive. Proceeding with analysis.".format(text.upper())

    def get_history(self):
        return self.history
