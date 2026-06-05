import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from app.websocket.context import current_thread_id
from app.websocket.manager import manager

WORKFLOW_EVENT_TYPES = frozenset(
    {
        "workflow_started",
        "node_started",
        "node_completed",
        "approval_required",
        "workflow_completed",
    }
)


class WorkflowEvents:
    @staticmethod
    def _build_payload(event_type: str, **fields: Any) -> dict:
        payload = {
            "id": fields.pop("id", str(uuid.uuid4())),
            "type": event_type,
            "timestamp": fields.pop(
                "timestamp",
                datetime.now(timezone.utc).isoformat(),
            ),
        }

        for key, value in fields.items():
            if value is not None:
                payload[key] = value

        return payload

    @staticmethod
    async def emit(payload: dict):
        await manager.send_message(json.dumps(payload))

    @staticmethod
    async def emit_event(event_type: str, **fields: Any):
        if event_type not in WORKFLOW_EVENT_TYPES:
            raise ValueError(f"Unsupported workflow event type: {event_type}")

        await WorkflowEvents.emit(
            WorkflowEvents._build_payload(event_type, **fields)
        )

    @staticmethod
    def emit_from_sync(event_type: str, **fields: Any):
        payload = WorkflowEvents._build_payload(event_type, **fields)

        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            asyncio.run(WorkflowEvents.emit(payload))
            return

        loop.create_task(WorkflowEvents.emit(payload))

    @staticmethod
    def workflow_started(
        *,
        thread_id: str,
        workflow_type: str,
        message: Optional[str] = None,
    ):
        WorkflowEvents.emit_from_sync(
            "workflow_started",
            thread_id=thread_id,
            workflow_type=workflow_type,
            message=message or f"{workflow_type} workflow started",
        )

    @staticmethod
    def node_started(node: str, message: Optional[str] = None):
        WorkflowEvents.emit_from_sync(
            "node_started",
            node=node,
            thread_id=current_thread_id.get(),
            message=message or f"{node} started",
        )

    @staticmethod
    def node_completed(node: str, message: Optional[str] = None):
        WorkflowEvents.emit_from_sync(
            "node_completed",
            node=node,
            thread_id=current_thread_id.get(),
            message=message or f"{node} completed",
        )

    @staticmethod
    def approval_required(
        *,
        message: Optional[str] = None,
        thread_id: Optional[str] = None,
        node: str = "human_review",
    ):
        WorkflowEvents.emit_from_sync(
            "approval_required",
            node=node,
            thread_id=thread_id,
            message=message or "Human approval required",
        )

    @staticmethod
    def workflow_completed(
        *,
        thread_id: str,
        status: str,
        message: Optional[str] = None,
    ):
        WorkflowEvents.emit_from_sync(
            "workflow_completed",
            thread_id=thread_id,
            status=status,
            message=message or f"Workflow finished with status {status}",
        )
