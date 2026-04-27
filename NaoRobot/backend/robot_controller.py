import logging
from nao_agent import NaoAgent

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RobotController")

class NaoRobot(object):
    def __init__(self, ip=None, port=9559, mock=True):
        self.ip = ip
        self.port = port
        self.mock = mock
        self.session = None
        self.tts = None
        self.motion = None
        self.posture = None
        self.connected = False
        self.battery = 85 # Initial mock battery
        self.is_speaking = False
        self.dialogue = [] # List of {role: 'user'|'robot', text: str}
        self.agent = NaoAgent()

        if not self.mock:
            try:
                import qi
                self.session = qi.Session()
                self.session.connect("tcp://{}:{}".format(self.ip, self.port))
                self.tts = self.session.service("ALAnimatedSpeech")
                self.motion = self.session.service("ALMotion")
                self.posture = self.session.service("ALRobotPosture")
                self.memory = self.session.service("ALMemory")
                self.speech_rec = self.session.service("ALSpeechRecognition")
                self.life = self.session.service("ALAutonomousLife")
                
                self.connected = True
                logger.info("Connected to Robot at {}:{}".format(ip, port))
                
                # Setup Speech Recognition
                self.setup_speech_recognition()
            except Exception as e:
                logger.error("Failed to connect to Robot: {}".format(e))
                self.mock = True
                logger.info("Falling back to MOCK mode")

    def disconnect(self):
        logger.info("Disconnecting from Robot...")
        if self.session:
            try:
                self.session.close()
            except:
                pass
        self.connected = False
        self.mock = True
        self.session = None
        self.tts = None
        self.motion = None
        self.posture = None
        self.speech_rec = None
        self.life = None
        return True

    def set_autonomous_life(self, state):
        """state: 'disabled' or 'interactive'"""
        logger.info("Setting Autonomous Life to: {}".format(state))
        if not self.mock and self.life:
            try:
                self.life.setState(state)
                return True
            except Exception as e:
                logger.error("Life Toggle Failed: {}".format(e))
        return False

    def setup_speech_recognition(self):
        try:
            self.speech_rec.pause(True)
            self.speech_rec.setLanguage("English")
            vocabulary = ["hi", "hello", "status", "stand", "sit", "rest", "name"]
            
            # Clear existing and set new
            try:
                self.speech_rec.removeAllContext()
            except:
                pass
                
            self.speech_rec.setVocabulary(vocabulary, False)
            self.speech_rec.pause(False)
            
            # Subscribe to memory signal
            self.sub = self.memory.subscriber("WordRecognized")
            self.sub.signal.connect(self.on_word_recognized)
            self.speech_rec.subscribe("NaoOS_Speech")
            logger.info("Speech Recognition Active")
        except Exception as e:
            logger.error("Speech Rec Setup Failed: {}".format(e))

    def on_word_recognized(self, value):
        if self.is_speaking:
            return # Ignore self-speech
            
        if len(value) > 1 and value[1] > 0.4: # Confidence threshold
            word = value[0]
            logger.info("Recognized Word: {} (conf: {})".format(word, value[1]))
            # Inject into our say method to trigger brain and response
            self.say(word)

    def say(self, text):
        if not text: return {"status": "error", "message": "Empty text"}
        if self.is_speaking: return {"status": "busy", "message": "Robot is already speaking"}
        
        logger.info("User says: {}".format(text))
        self.dialogue.append({"role": "user", "text": text})
        
        # Generate Conversational Response using the AGENT
        response_text = self.agent.process_input(text)
        
        self.is_speaking = True
        if not self.mock and self.tts:
            try:
                # Disable ASR briefly if needed, but flag is safer
                self.tts.say(response_text)
                self.dialogue.append({"role": "robot", "text": response_text})
            except Exception as e:
                logger.error("TTS Error: {}".format(e))
        else:
            # Mock response
            self.dialogue.append({"role": "robot", "text": response_text})
            
        self.is_speaking = False
        return {"status": "success", "message": "Robot responded"}

    def move_to_posture(self, posture_name, speed=0.5):
        logger.info("Moving to posture: {}".format(posture_name))
        if not self.mock and self.posture:
            self.posture.goToPosture(posture_name, speed)
        return {"status": "success", "message": "Moved to posture: {}".format(posture_name)}

    def stand(self):
        return self.move_to_posture("StandInit")

    def sit(self):
        return self.move_to_posture("Sit")

    def rest(self):
        logger.info("Robot resting")
        if not self.mock and self.motion:
            self.motion.rest()
        return {"status": "success", "message": "Robot is resting"}

    def wake_up(self):
        logger.info("Robot waking up")
        if not self.mock and self.motion:
            self.motion.wakeUp()
        return {"status": "success", "message": "Robot is awake"}

    def fetch_sensors(self):
        sensors = {
            "head_touch": 0,
            "sonar_left": 0,
            "sonar_right": 0,
            "cpu_load": 0,
            "memory_usage": 0
        }
        if not self.mock and self.memory:
            try:
                # Basic sensor polling
                sensors["head_touch"] = self.memory.getData("Device/SubDeviceList/Head/Touch/Front/Sensor/Value")
                sensors["sonar_left"] = self.memory.getData("Device/SubDeviceList/US/Left/Sensor/Value")
                sensors["sonar_right"] = self.memory.getData("Device/SubDeviceList/US/Right/Sensor/Value")
                
                # System metrics (requires ALSystem or ALLauncher - using mock for simplicity if missing)
                # In real pynaoqi, we might use psutil or subprocess for CPU if allowed
                sensors["cpu_load"] = 12 # Placeholder
                sensors["memory_usage"] = 45 # Placeholder
            except:
                pass
        return sensors

    def get_status(self):
        life_state = "disabled"
        if not self.mock and self.life:
            try:
                life_state = self.life.getState()
            except:
                pass
        
        status = {
            "connected": self.connected or self.mock,
            "mock_mode": self.mock,
            "battery": 85 if self.mock else 0,
            "name": "NaoMock" if self.mock else "Nao",
            "ip": self.ip,
            "dialogue": self.dialogue[-10:],
            "life_state": life_state,
            "sensors": self.fetch_sensors()
        }
        return status
