import asyncio

from app.websocket.manager import manager


class WorkflowEvents:

    @staticmethod
    async def emit(message: str):

        await manager.send_message(
            message
        )

    @staticmethod
    def emit_from_sync(message: str):
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            asyncio.run(WorkflowEvents.emit(message))
            return

        loop.create_task(WorkflowEvents.emit(message))