from app.extraction.field_types import (
    FieldDefinition,
    FieldType,
    ValidationCapabilities,
    ValidationRule,
    WorkflowSchema,
)

INVOICE_SCHEMA = WorkflowSchema(
    workflow_type="invoice",
    display_name="Invoice Extraction",
    description="Extract vendor, invoice number, dates, amounts, and tax from uploaded invoices.",
    icon="receipt",
    fields=[
        FieldDefinition(
            name="vendor_name",
            type=FieldType.STRING,
            required=True,
            description="Vendor or supplier name on the invoice",
        ),
        FieldDefinition(
            name="invoice_number",
            type=FieldType.STRING,
            required=True,
            description="Invoice identifier or number",
        ),
        FieldDefinition(
            name="invoice_date",
            type=FieldType.STRING,
            required=True,
            description="Invoice issue date as shown on the document",
        ),
        FieldDefinition(
            name="total_amount",
            type=FieldType.NUMBER,
            required=True,
            description="Final total amount due",
        ),
        FieldDefinition(
            name="currency",
            type=FieldType.STRING,
            required=True,
            description="Currency code such as USD, EUR, or GBP",
        ),
        FieldDefinition(
            name="tax_amount",
            type=FieldType.NUMBER,
            required=False,
            description="Tax amount if present",
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
                name="positive_total",
                description="total_amount must be greater than zero",
                field="total_amount",
            ),
            ValidationRule(
                name="vendor_present",
                description="vendor_name must be present",
                field="vendor_name",
            ),
            ValidationRule(
                name="currency_normalization",
                description="currency values are normalized to ISO codes",
                field="currency",
            ),
            ValidationRule(
                name="high_amount_anomaly",
                description="total_amount above 100000 triggers human review",
                field="total_amount",
            ),
            ValidationRule(
                name="unsupported_currency",
                description="currency must be USD, EUR, or GBP",
                field="currency",
            ),
        ],
    ),
    system_prompt="""
You are an invoice extraction AI.

Extract structured invoice information from the provided text.

Rules:
- Follow the task instructions exactly.
- If multiple invoices appear in the context, extract ONLY the one that matches the task.
- Never merge fields from different invoices.
- Use null only when a field is truly missing for that invoice.

Return valid structured data only.
""",
)
