from app.extraction.validation import (
    CONTRACT_REQUIRED_FIELDS,
    ExtractionValidationService,
)
from app.schemas.extraction import ExtractionResult


def _contract_fields(**overrides):
    base = {
        "contract_title": "Master Services Agreement",
        "party_a": "Acme Corp",
        "party_b": "Beta LLC",
        "effective_date": "2024-01-01",
        "renewal_date": "2025-01-01",
        "termination_clause": "Either party may terminate with 30 days notice.",
    }
    base.update(overrides)
    return base


class TestContractValidation:
    def test_contract_validation_passes_with_required_fields(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(),
        )

        _, valid = ExtractionValidationService.validate(extraction)

        assert valid is True

    def test_contract_validation_passes_without_optional_fields(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(
                renewal_date=None,
                termination_clause=None,
            ),
        )

        _, valid = ExtractionValidationService.validate(extraction)

        assert valid is True

    def test_contract_validation_fails_when_required_field_missing(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(party_b=""),
        )

        _, valid = ExtractionValidationService.validate(extraction)

        assert valid is False

    def test_contract_get_missing_fields(self):
        extraction = ExtractionResult(
            workflow_type="contract",
            fields=_contract_fields(
                contract_title="null",
                effective_date="",
            ),
        )

        missing = ExtractionValidationService.get_missing_fields(extraction)

        assert "contract_title" in missing
        assert "effective_date" in missing
        assert "renewal_date" not in missing
        assert set(missing).issubset(set(CONTRACT_REQUIRED_FIELDS))

    def test_invoice_validation_unchanged(self):
        extraction = ExtractionResult(
            workflow_type="invoice",
            fields={
                "vendor_name": "Acme",
                "invoice_number": "INV-1",
                "invoice_date": "2024-01-01",
                "total_amount": 100.0,
                "currency": "USD",
            },
        )

        _, valid = ExtractionValidationService.validate(extraction)

        assert valid is True
