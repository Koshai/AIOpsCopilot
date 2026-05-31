import instructor
from openai import OpenAI

from app.core.config import settings
from app.extraction.model_builder import DynamicModelBuilder
from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE, SchemaRegistry
from app.schemas.extraction import ExtractionResult


client = instructor.from_openai(
    OpenAI(api_key=settings.OPENAI_API_KEY)
)


class ExtractionService:

    @staticmethod
    def extract(
        context: str,
        question: str = "",
        workflow_type: str = DEFAULT_WORKFLOW_TYPE,
    ) -> ExtractionResult:
        schema = SchemaRegistry.get(workflow_type)
        payload_model = DynamicModelBuilder.build_payload_model(schema)

        task = question.strip() or (
            f"Extract structured data for workflow type '{workflow_type}'."
        )

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            response_model=payload_model,
            messages=[
                {
                    "role": "system",
                    "content": schema.system_prompt.strip(),
                },
                {
                    "role": "user",
                    "content": (
                        f"Workflow type: {workflow_type}\n"
                        f"Schema fields: "
                        f"{', '.join(field.name for field in schema.fields)}\n\n"
                        f"Task:\n{task}\n\nContext:\n{context}"
                    ),
                },
            ],
        )

        return ExtractionResult(
            workflow_type=workflow_type,
            fields=response.model_dump(exclude_none=True),
        )

    @staticmethod
    def extract_invoice_data(
        context: str,
        question: str = "",
    ) -> ExtractionResult:
        return ExtractionService.extract(
            context=context,
            question=question,
            workflow_type=DEFAULT_WORKFLOW_TYPE,
        )
