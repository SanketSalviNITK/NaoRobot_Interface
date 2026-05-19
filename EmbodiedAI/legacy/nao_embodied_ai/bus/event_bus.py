import asyncio
import logging
from collections import defaultdict
from typing import Any, Callable, Coroutine

logger = logging.getLogger("EventBus")

class EventBus:
    """
    An asynchronous message bus implementing the Publish/Subscribe pattern.
    Allows agents to communicate without direct coupling.
    """
    def __init__(self):
        self._subscribers = defaultdict(list)
        self._is_closing = False

    def subscribe(self, topic: str, callback: Callable[[Any], Coroutine[Any, Any, None]]):
        """Register a callback for a specific topic."""
        if self._is_closing:
            return
        self._subscribers[topic].append(callback)
        logger.info(f"Subscribed to topic: {topic}")

    async def publish(self, topic: str, message: Any):
        """Publish a message to a topic with robust error handling."""
        if self._is_closing:
            return

        if topic in self._subscribers:
            # We wrap callbacks to ensure one failure doesn't kill the bus
            tasks = []
            for callback in self._subscribers[topic]:
                tasks.append(self._safe_call(callback, topic, message))
            
            if tasks:
                await asyncio.gather(*tasks)
                logger.debug(f"Published to {topic}: {message}")
        else:
            logger.debug(f"No subscribers for topic {topic}")

    async def _safe_call(self, callback, topic, message):
        """Executes a callback safely, logging any errors."""
        try:
            await callback(message)
        except Exception as e:
            logger.error(f"Error in subscriber for topic {topic}: {e}", exc_info=True)

    def close(self):
        """Signal the bus to stop accepting new subscriptions or messages."""
        self._is_closing = True
        self._subscribers.clear()
        logger.info("EventBus closed.")

    async def start(self):
        """Placeholder for any background bus logic if needed."""
        logger.info("EventBus operational.")
        while not self._is_closing:
            await asyncio.sleep(1)
