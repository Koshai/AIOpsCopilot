from app.extraction.anomaly import AnomalyService
from app.schemas.extraction import ExtractionResult


def _contract_fields(**overrides):
    base = {
        "contract_title": "Master Services Agreement",
        "party_a": "Acme Corp",
        "party_b": "Beta LLC",
        "effective_date": "2024-06-01",
        "renewal_date": "2025-06-01",
        "termination_clause": "Either party may terminate with 30 days notice.",
    }
    base.update(overrides)
    return base


class TestContractAnomalyDetection:
    def test_no_anomaly_for_valid_contract(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(),
        )

        assert AnomalyService.detect(extraction) is False

    def test_anomaly_when_renewal_date_before_effective_date(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(
                effective_date="2024-06-01",
                renewal_date="2024-01-01",
            ),
        )

        assert AnomalyService.detect(extraction) is True

    def test_anomaly_when_party_a_missing(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(party_a=""),
        )

        assert AnomalyService.detect(extraction) is True

    def test_anomaly_when_party_b_missing(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(party_b="null"),
        )

        assert AnomalyService.detect(extraction) is True

    def test_no_anomaly_when_renewal_date_missing(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(renewal_date=None),
        )

        assert AnomalyService.detect(extraction) is False

    def test_invoice_anomaly_behavior_unchanged(self):
        extraction = ExtractionResult(
            workflow_type="invoice",
            fields={
                "vendor_name": "Acme",
                "invoice_number": "INV-1",
                "invoice_date": "2024-01-01",
                "total_amount": 150000.0,
                "currency": "USD",
            },
        )

        assert AnomalyService.detect(extraction) is True

        normal = ExtractionResult(
            workflow_type="invoice",
            fields={
                "vendor_name": "Acme",
                "invoice_number": "INV-1",
                "invoice_date": "2024-01-01",
                "total_amount": 100.0,
                "currency": "USD",
            },
        )

        assert AnomalyService.detect(normal) is False
