from app.services.workflow_catalog_service import WorkflowCatalogService


class TestWorkflowCatalogService:
    def test_list_workflow_types(self):
        types = WorkflowCatalogService.list_workflow_types()
        assert types == ["invoice", "resume"]

    def test_list_catalog_includes_schema_and_validation(self):
        catalog = WorkflowCatalogService.list_catalog()
        assert len(catalog) == 2

        invoice = next(e for e in catalog if e.workflow_type == "invoice")
        assert invoice.display_name == "Invoice Extraction"
        assert invoice.icon == "receipt"
        assert len(invoice.fields) == 6
        assert invoice.validation.supports_anomaly_detection is True
        assert any(r.name == "high_amount_anomaly" for r in invoice.validation.rules)

        resume = next(e for e in catalog if e.workflow_type == "resume")
        assert resume.validation.supports_anomaly_detection is False
        assert len(resume.fields) == 5

    def test_list_summaries_for_selection_screen(self):
        summaries = WorkflowCatalogService.list_summaries()
        assert summaries[0].workflow_type
        assert summaries[0].display_name
        assert summaries[0].description
        assert summaries[0].icon
        assert "fields" not in summaries[0].model_dump()

    def test_get_entry_by_workflow_type(self):
        entry = WorkflowCatalogService.get_entry("resume")
        assert entry.workflow_type == "resume"
        assert entry.validation.supports_validation is True

    def test_get_validation_capabilities(self):
        validation = WorkflowCatalogService.get_validation_capabilities("invoice")
        assert validation.supports_verifier is True
        assert len(validation.rules) >= 4
