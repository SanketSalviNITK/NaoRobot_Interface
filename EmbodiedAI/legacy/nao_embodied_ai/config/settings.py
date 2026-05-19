import os

# Robot Connection
NAO_IP = "169.254.175.171"
NAO_PORT = 9559

# AI Models (Placeholders for API Keys)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-key-here")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your-key-here")

# Agent Refresh Rates (Seconds)
VISION_FPS = 1
SENSOR_POLL_RATE = 0.5
STT_POLL_RATE = 0.2

# Logging Levels
LOG_LEVEL = "INFO"
