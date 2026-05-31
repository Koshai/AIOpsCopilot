from typing import Any, Optional

from pydantic import BaseModel, Field, model_serializer


class ExtractionResult(BaseModel):
    workflow_type: str = "invoice"
    fields: dict[str, Any] = Field(default_factory=dict)

    def get(self, key: str, default: Any = None) -> Any:
        return self.fields.get(key, default)

    @model_serializer(mode="wrap")
    def _serialize(self, handler):
        data = handler(self)
        if self.workflow_type == "invoice":
            return {**self.fields, **data}
        return data
