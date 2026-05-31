from app.data.workflow_definition_seeds import WORKFLOW_DEFINITION_SEEDS


def test_workflow_definition_seeds():
    assert len(WORKFLOW_DEFINITION_SEEDS) == 2

    invoice = WORKFLOW_DEFINITION_SEEDS[0]
    assert invoice["workflow_type"] == "invoice"
    assert invoice["schema_name"] == "invoice"
    assert invoice["display_name"] == "Invoice Extraction"
    assert invoice["icon"] == "receipt"
    assert invoice["enabled"] is True

    resume = WORKFLOW_DEFINITION_SEEDS[1]
    assert resume["workflow_type"] == "resume"
    assert resume["schema_name"] == "resume"
    assert resume["display_name"] == "Resume Extraction"
    assert resume["icon"] == "user"
    assert resume["enabled"] is True
