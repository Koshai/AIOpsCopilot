from app.extraction.field_types import (
    FieldDefinition,
    FieldType,
    ValidationCapabilities,
    ValidationRule,
    WorkflowSchema,
)

CONTRACT_SCHEMA = WorkflowSchema(
    workflow_type="contract",
    display_name="Contract Review",
    description="Extract important contract information.",
    icon="file-text",
    fields=[
        FieldDefinition(
            name="contract_title",
            type=FieldType.STRING,
            required=True,
            description="Title or name of the contract",
        ),
        FieldDefinition(
            name="party_a",
            type=FieldType.STRING,
            required=True,
            description="First party to the contract",
        ),
        FieldDefinition(
            name="party_b",
            type=FieldType.STRING,
            required=True,
            description="Second party to the contract",
        ),
        FieldDefinition(
            name="effective_date",
            type=FieldType.STRING,
            required=True,
            description="Contract effective date as shown on the document",
        ),
        FieldDefinition(
            name="renewal_date",
            type=FieldType.STRING,
            required=False,
            description="Contract renewal or expiration date as shown on the document",
        ),
        FieldDefinition(
            name="termination_clause",
            type=FieldType.STRING,
            required=False,
            description="Summary of termination conditions or notice requirements",
        ),
    ],
    validation=ValidationCapabilities(
        supports_validation=True,
        supports_anomaly_detection=True,
        supports_verifier=True,
        rules=[
            ValidationRule(
                name="required_fields",
                description="All required schema fields must be present and non-empty",
            ),
            ValidationRule(
                name="parties_present",
                description="party_a and party_b must be present",
                field="party_a",
            ),
            ValidationRule(
                name="contract_title_present",
                description="contract_title must be present",
                field="contract_title",
            ),
            ValidationRule(
                name="renewal_before_effective",
                description="renewal_date before effective_date triggers anomaly review",
            ),
            ValidationRule(
                name="missing_party_a",
                description="missing party_a triggers anomaly review",
                field="party_a",
            ),
            ValidationRule(
                name="missing_party_b",
                description="missing party_b triggers anomaly review",
                field="party_b",
            ),
        ],
    ),
    system_prompt="""
You are a contract extraction AI.

Extract structured contract information from the provided text.

Rules:
- Follow the task instructions exactly.
- If multiple contracts appear in the context, extract ONLY the one that matches the task.
- Never merge fields from different contracts.
- Use the exact party names as written in the document.
- Dates should reflect the document wording; prefer ISO 8601 (YYYY-MM-DD) when possible.
- Summarize termination_clause in one or two concise sentences.
- Use null only when a field is truly missing for that contract.

Return valid structured data only.
""",
)
