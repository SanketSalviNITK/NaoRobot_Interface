import asyncio
import logging
import signal
from typing import List
from nao_embodied_ai.bus.event_bus import EventBus
from nao_embodied_ai.agents.gateway_agent import NaoGatewayAgent
from nao_embodied_ai.agents.vision_agent import VisionAgent
from nao_embodied_ai.agents.stt_agent import SpeechToTextAgent
from nao_embodied_ai.agents.sensor_agent import SensorContextAgent
from nao_embodied_ai.agents.cognition_agent import CognitionAgent
from nao_embodied_ai.agents.planner_agent import ActionPlannerAgent
from nao_embodied_ai.agents.memory_agent import MemoryAgent
from nao_embodied_ai.agents.ui_agent import UIAgent
from nao_embodied_ai.agents.tester_agent import TesterAgent

# Configure root logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(name)s] %(levelname)s: %(message)s')
logger = logging.getLogger("Main")

class SystemOrchestrator:
    def __init__(self):
        self.bus = EventBus()
        self.agents = []
        self.tasks = []
        self.stop_event = asyncio.Event()

    async def initialize(self):
        logger.info("Initializing Full Multi-Agent Embodied AI System...")
        
        # Instantiate agents
        self.agents = [
            NaoGatewayAgent("NaoGateway", self.bus),
            VisionAgent("VisionAgent", self.bus),
            SpeechToTextAgent("STTAgent", self.bus),
            SensorContextAgent("SensorAgent", self.bus),
            CognitionAgent("CognitionAgent", self.bus),
            ActionPlannerAgent("PlannerAgent", self.bus),
            MemoryAgent("MemoryAgent", self.bus),
            UIAgent("UIAgent", self.bus),
            TesterAgent("AutoTester", self.bus)
        ]

        # Register shutdown signals (Compatibility check for Windows)
        try:
            loop = asyncio.get_running_loop()
            for sig in (signal.SIGINT, signal.SIGTERM):
                loop.add_signal_handler(sig, lambda: asyncio.create_task(self.shutdown()))
        except NotImplementedError:
            # Signal handlers not supported on Windows asyncio loop
            # We will rely on KeyboardInterrupt catching in main()
            pass

    async def start(self):
        # 1. Lifecycle Management: Small delay to let the bus and infrastructure settle
        logger.info("Readying system infrastructure...")
        await asyncio.sleep(1.0)
        
        # 2. Start agents as individual tasks
        logger.info(f"Starting {len(self.agents)} agents...")
        for agent in self.agents:
            task = asyncio.create_task(agent.start(), name=agent.name)
            self.tasks.append(task)

        # 3. Monitor tasks
        try:
            # Wait until the stop event is set or all tasks are done
            done, pending = await asyncio.wait(
                self.tasks + [asyncio.create_task(self.stop_event.wait())],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            # Check if any task failed
            for task in done:
                if task.exception():
                    logger.error(f"Task {task.get_name()} failed with exception: {task.exception()}")

        except Exception as e:
            logger.exception(f"Unexpected system error: {e}")
        finally:
            if not self.stop_event.is_set():
                await self.shutdown()

    async def shutdown(self):
        """Gracefully shuts down all agents and the bus."""
        if self.stop_event.is_set():
            return
            
        logger.info("Shutdown signal received. Commencing graceful teardown...")
        self.stop_event.set()

        # Signal all agents to stop
        for agent in self.agents:
            agent.stop()

        # Wait for tasks to finish with a timeout
        if self.tasks:
            logger.info("Waiting for agents to finish their cleanup...")
            await asyncio.wait(self.tasks, timeout=5.0)

            # Cancel remaining tasks if they didn't stop
            for task in self.tasks:
                if not task.done():
                    logger.warning(f"Task {task.get_name()} did not exit in time. Cancelling...")
                    task.cancel()
            
            await asyncio.gather(*self.tasks, return_exceptions=True)

        self.bus.close()
        logger.info("System shutdown complete.")

async def main():
    orchestrator = SystemOrchestrator()
    await orchestrator.initialize()
    await orchestrator.start()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # Handled by signal handlers in initialize()
        pass
