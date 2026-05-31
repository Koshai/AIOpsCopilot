"""
Integration tests for schema-driven extraction.

Mocks the LLM client so tests run offline while proving ExtractionService
selects the correct dynamic model from SchemaRegistry per workflow_type.
"""

from unittest.mock import MagicMock, patch

import pytest

from app.extraction.field_types import FieldType
from app.extraction.model_builder import DynamicModelBuilder
from app.extraction.schema_registry import SchemaRegistry
from app.services.workflow_catalog_service import WorkflowCatalogService
from app.graphs.extract_node import extract_node
from app.services.extraction_service import ExtractionService


def _schema_field_names(workflow_type: str) -> set[str]:
    schema = SchemaRegistry.get(workflow_type)
    return {field.name for field in schema.fields}


def _sample_payload(workflow_type: str) -> dict:
    schema = SchemaRegistry.get(workflow_type)
    payload_model = DynamicModelBuilder.build_payload_model(schema)
    sample: dict = {}

    for name, field_info in payload_model.model_fields.items():
        field_def = next(f for f in schema.fields if f.name == name)

        if field_def.type == FieldType.STRING:
            sample[name] = f"sample_{name}"
        elif field_def.type == FieldType.NUMBER:
            sample[name] = 99.99
        elif field_def.type == FieldType.INTEGER:
            sample[name] = 5
        elif field_def.type == FieldType.BOOLEAN:
            sample[name] = True
        elif field_def.type == FieldType.STRING_LIST:
            sample[name] = ["skill_a", "skill_b"]
        else:
            sample[name] = f"sample_{name}"

    return payload_model(**sample)


def _mock_llm_create(*args, **kwargs):
    response_model = kwargs["response_model"]
    workflow_type = response_model.__name__.replace("ExtractionPayload", "").lower()
    if workflow_type == "invoice":
        return _sample_payload("invoice")
    if workflow_type == "resume":
        return _sample_payload("resume")
    raise AssertionError(f"Unexpected response_model: {response_model.__name__}")


@pytest.fixture
def mock_extraction_llm():
    with patch(
        "app.services.extraction_service.client.chat.completions.create",
        side_effect=_mock_llm_create,
    ) as mock_create:
        yield mock_create


class TestSchemaRegistry:
    def test_invoice_and_resume_registered(self):
        types = SchemaRegistry.list_types()
        assert "invoice" in types
        assert "resume" in types

    def test_list_catalog_for_frontend(self):
        catalog = WorkflowCatalogService.list_catalog()
        assert len(catalog) >= 2

        invoice = next(e for e in catalog if e.workflow_type == "invoice")
        assert invoice.display_name == "Invoice Extraction"
        assert invoice.description
        assert invoice.icon == "receipt"
        assert len(invoice.fields) == 6
        assert invoice.validation.supports_anomaly_detection is True

        resume = next(e for e in catalog if e.workflow_type == "resume")
        assert resume.icon == "user"
        assert len(resume.fields) == 5

    def test_dynamic_models_match_schema_fields(self):
        for workflow_type in ("invoice", "resume"):
            schema = SchemaRegistry.get(workflow_type)
            model = DynamicModelBuilder.build_payload_model(schema)
            assert set(model.model_fields.keys()) == _schema_field_names(workflow_type)


class TestExtractionServiceSchemaDriven:
    def test_invoice_workflow_returns_invoice_fields(
        self, mock_extraction_llm, invoice_context
    ):
        result = ExtractionService.extract(
            context=invoice_context,
            question="Extract invoice fields",
            workflow_type="invoice",
        )

        assert result.workflow_type == "invoice"
        assert set(result.fields.keys()) == _schema_field_names("invoice")
        assert result.fields["vendor_name"] == "sample_vendor_name"
        assert result.fields["invoice_number"] == "sample_invoice_number"
        assert isinstance(result.fields["total_amount"], float)

        call_kwargs = mock_extraction_llm.call_args.kwargs
        assert call_kwargs["response_model"].__name__ == "InvoiceExtractionPayload"

    def test_resume_workflow_returns_resume_fields(
        self, mock_extraction_llm, resume_context
    ):
        result = ExtractionService.extract(
            context=resume_context,
            question="Extract resume fields",
            workflow_type="resume",
        )

        assert result.workflow_type == "resume"
        assert set(result.fields.keys()) == _schema_field_names("resume")
        assert result.fields["candidate_name"] == "sample_candidate_name"
        assert result.fields["email"] == "sample_email"
        assert result.fields["skills"] == ["skill_a", "skill_b"]
        assert result.fields["years_experience"] == 5

        call_kwargs = mock_extraction_llm.call_args.kwargs
        assert call_kwargs["response_model"].__name__ == "ResumeExtractionPayload"

    def test_workflow_type_selects_different_models(
        self, mock_extraction_llm, invoice_context, resume_context
    ):
        ExtractionService.extract(
            context=invoice_context,
            workflow_type="invoice",
        )
        invoice_model = mock_extraction_llm.call_args.kwargs["response_model"]

        ExtractionService.extract(
            context=resume_context,
            workflow_type="resume",
        )
        resume_model = mock_extraction_llm.call_args.kwargs["response_model"]

        assert invoice_model.__name__ != resume_model.__name__
        assert set(invoice_model.model_fields.keys()) == _schema_field_names("invoice")
        assert set(resume_model.model_fields.keys()) == _schema_field_names("resume")

    def test_extract_invoice_data_wrapper_uses_invoice_schema(
        self, mock_extraction_llm, invoice_context
    ):
        result = ExtractionService.extract_invoice_data(context=invoice_context)

        assert result.workflow_type == "invoice"
        assert set(result.fields.keys()) == _schema_field_names("invoice")


class TestExtractNodeSchemaDriven:
    def test_extract_node_respects_workflow_type_in_state(
        self, mock_extraction_llm, resume_context
    ):
        state = {
            "question": "Extract candidate profile",
            "context": resume_context,
            "workflow_type": "resume",
        }

        output = extract_node(state)

        assert output["workflow_type"] == "resume"
        assert output["extraction"].workflow_type == "resume"
        assert set(output["extraction"].fields.keys()) == _schema_field_names("resume")

        call_kwargs = mock_extraction_llm.call_args.kwargs
        assert call_kwargs["response_model"].__name__ == "ResumeExtractionPayload"

    def test_extract_node_defaults_to_invoice(
        self, mock_extraction_llm, invoice_context
    ):
        state = {
            "question": "Extract invoice",
            "context": invoice_context,
        }

        output = extract_node(state)

        assert output["workflow_type"] == "invoice"
        assert set(output["extraction"].fields.keys()) == _schema_field_names("invoice")
