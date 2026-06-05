import instructor
from openai import OpenAI

from app.core.config import settings
from app.extraction.model_builder import DynamicModelBuilder
from app.extraction.resume_helpers import (
    infer_education_from_context,
    looks_like_degree_line,
)
from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE, SchemaRegistry
from app.extraction.validation import ExtractionValidationService
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
                    "content": ExtractionService._build_user_prompt(
                        workflow_type=workflow_type,
                        schema=schema,
                        task=task,
                        context=context,
                    ),
                },
            ],
        )

        fields = response.model_dump(exclude_none=True)
        fields = ExtractionService._backfill_fields(
            workflow_type=workflow_type,
            fields=fields,
            context=context,
        )

        return ExtractionResult(
            workflow_type=workflow_type,
            fields=fields,
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

    @staticmethod
    def _build_user_prompt(
        *,
        workflow_type: str,
        schema,
        task: str,
        context: str,
    ) -> str:
        field_lines = "\n".join(
            f"- {field.name} ({'required' if field.required else 'optional'}): "
            f"{field.description}"
            for field in schema.fields
        )

        return (
            f"Workflow type: {workflow_type}\n"
            f"Extract every schema field below, even if the task omits them.\n\n"
            f"Schema fields:\n{field_lines}\n\n"
            f"Task:\n{task}\n\nContext:\n{context}"
        )

    @staticmethod
    def _backfill_fields(
        *,
        workflow_type: str,
        fields: dict,
        context: str,
    ) -> dict:
        updated = dict(fields)

        if workflow_type != "resume":
            return updated

        education = updated.get("education")
        should_backfill = ExtractionValidationService._is_missing(education)
        if not should_backfill and isinstance(education, str):
            should_backfill = not looks_like_degree_line(education)

        if should_backfill:
            inferred = infer_education_from_context(context)
            if inferred:
                updated["education"] = inferred

        return updated

    @staticmethod
    def build_retry_question(
        question: str,
        *,
        workflow_type: str,
        missing_fields: list[str],
    ) -> str:
        if not missing_fields:
            return question

        schema = SchemaRegistry.get(workflow_type)
        descriptions = {
            field.name: field.description
            for field in schema.fields
            if field.name in missing_fields
        }

        reminders = "\n".join(
            f"- {name}: {descriptions.get(name, 'required field')}"
            for name in missing_fields
        )

        return (
            f"{question.strip()}\n\n"
            f"Previous extraction was incomplete. "
            f"Return values for these missing fields:\n{reminders}"
        ).strip()
