from app.extraction.field_types import (
    FieldDefinition,
    FieldType,
    ValidationCapabilities,
    ValidationRule,
    WorkflowSchema,
)

RESUME_SCHEMA = WorkflowSchema(
    workflow_type="resume",
    display_name="Resume Extraction",
    description="Extract candidate profile details including skills, experience, and education from resumes.",
    icon="user",
    fields=[
        FieldDefinition(
            name="candidate_name",
            type=FieldType.STRING,
            required=True,
            description="Full name of the candidate",
        ),
        FieldDefinition(
            name="email",
            type=FieldType.STRING,
            required=True,
            description="Primary email address",
        ),
        FieldDefinition(
            name="skills",
            type=FieldType.STRING_LIST,
            required=True,
            description="List of technical and professional skills",
        ),
        FieldDefinition(
            name="years_experience",
            type=FieldType.INTEGER,
            required=True,
            description="Total years of relevant professional experience",
        ),
        FieldDefinition(
            name="education",
            type=FieldType.STRING,
            required=True,
            description="Highest or most relevant education credential",
        ),
    ],
    validation=ValidationCapabilities(
        supports_validation=True,
        supports_anomaly_detection=False,
        supports_verifier=True,
        rules=[
            ValidationRule(
                name="required_fields",
                description="All required schema fields must be present and non-empty",
            ),
            ValidationRule(
                name="skills_list",
                description="skills must be a non-empty list of strings",
                field="skills",
            ),
        ],
    ),
    system_prompt="""
You are a resume extraction AI.

Extract structured candidate information from the provided resume text.

Rules:
- Follow the task instructions exactly.
- If multiple resumes appear in the context, extract ONLY the one that matches the task.
- Never merge fields from different candidates.
- skills must be a list of individual skill strings.
- Always populate education when an Education section or degree lines exist in the resume.
- Format education as a concise string (for example: "MS, Software Engineering, 2012, Stevens Institute of Technology").
- Use null only when a field is truly missing for that resume.
- Never return the literal string "null"; omit the field or use JSON null instead.

Return valid structured data only.
""",
)
