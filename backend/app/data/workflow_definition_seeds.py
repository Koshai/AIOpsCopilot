WORKFLOW_DEFINITION_SEEDS = [
    {
        "workflow_type": "invoice",
        "display_name": "Invoice Extraction",
        "description": (
            "Extract vendor, invoice number, dates, amounts, and tax "
            "from uploaded invoices."
        ),
        "icon": "receipt",
        "schema_name": "invoice",
        "enabled": True,
    },
    {
        "workflow_type": "resume",
        "display_name": "Resume Extraction",
        "description": (
            "Extract candidate profile details including skills, experience, "
            "and education from resumes."
        ),
        "icon": "user",
        "schema_name": "resume",
        "enabled": True,
    },
]
