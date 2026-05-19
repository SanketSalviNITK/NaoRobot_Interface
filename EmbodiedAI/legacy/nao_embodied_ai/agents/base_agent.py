import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any
from ..bus.event_bus import EventBus

class BaseAgent(ABC):
    """
    Abstract base class for all agents in the NAO system.
    Handles lifecycle, graceful shutdown, and error reporting.
    """
    def __init__(self, name: str, bus: EventBus):
        self.name = name
        self.bus = bus
        self.logger = logging.getLogger(self.name)
        self._stop_event = asyncio.Event()
        self._task = None

    @abstractmethod
    async def run(self):
        """
        The main logic of the agent. 
        MUST respect self._stop_event and periodically check self._stop_event.is_set().
        """
        pass

    async def start(self):
        """Entry point called by the orchestrator to manage the agent's lifecycle."""
        try:
            self.logger.info("Agent starting...")
            await self.run()
        except asyncio.CancelledError:
            self.logger.info("Agent task cancelled.")
        except Exception as e:
            self.logger.exception(f"Agent encountered a fatal error: {e}")
            # Report the error to the bus before dying
            await self.publish("agent_error", {
                "agent": self.name,
                "error": str(e),
                "type": type(e).__name__
            })
        finally:
            await self.cleanup()

    async def cleanup(self):
        """
        Resource teardown logic (close sockets, stop motors, etc.)
        Should be overridden by subclasses if needed.
        """
        self.logger.info("Performing final cleanup...")

    def stop(self):
        """Signal the agent to stop gracefully."""
        self.logger.info("Stop signal received.")
        self._stop_event.set()

    async def publish(self, topic: str, message: Any):
        """Async wrapper for bus publishing."""
        await self.bus.publish(topic, message)

    def subscribe(self, topic: str, callback):
        """Wrapper for bus subscription."""
        self.bus.subscribe(topic, callback)
        self.logger.debug(f"Subscribed to {topic}")

    @property
    def is_running(self):
        return not self._stop_event.is_set()
