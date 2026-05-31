import pytest


@pytest.fixture
def invoice_context() -> str:
    return """
    Invoice Number INV-1001
    Vendor: Acme Corp
    Date: 2026-01-15
    Total Due: USD 150.00
    Tax: 10.00
    """


@pytest.fixture
def resume_context() -> str:
    return """
    Jane Doe
    Email: jane.doe@example.com
    Skills: Python, FastAPI, PostgreSQL
    Experience: 7 years
    Education: B.S. Computer Science
    """
