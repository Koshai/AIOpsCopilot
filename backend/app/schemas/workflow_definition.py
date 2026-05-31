from pydantic import BaseModel, ConfigDict


class WorkflowDefinitionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workflow_type: str
    display_name: str
    description: str
    icon: str
    schema_name: str
    enabled: bool
