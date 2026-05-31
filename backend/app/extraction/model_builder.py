from typing import Any, List, Optional, Type

from pydantic import BaseModel, Field, create_model

from app.extraction.field_types import FieldType, WorkflowSchema

_TYPE_MAP = {
    FieldType.STRING: str,
    FieldType.NUMBER: float,
    FieldType.INTEGER: int,
    FieldType.BOOLEAN: bool,
    FieldType.STRING_LIST: List[str],
}


class DynamicModelBuilder:
    @staticmethod
    def build_payload_model(schema: WorkflowSchema) -> Type[BaseModel]:
        field_defs: dict[str, Any] = {}

        for field in schema.fields:
            py_type = _TYPE_MAP[field.type]
            if field.required:
                field_defs[field.name] = (
                    py_type,
                    Field(description=field.description),
                )
            else:
                field_defs[field.name] = (
                    Optional[py_type],
                    Field(default=None, description=field.description),
                )

        model_name = "".join(
            part.capitalize() for part in schema.workflow_type.split("_")
        )

        return create_model(f"{model_name}ExtractionPayload", **field_defs)
