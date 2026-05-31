from typing import Optional

from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE, SchemaRegistry
from app.schemas.extraction import ExtractionResult
from app.services.normalizer_service import NormalizerService


class ExtractionValidationService:
    @staticmethod
    def validate(
        extraction: ExtractionResult,
        workflow_type: Optional[str] = None,
    ) -> tuple[ExtractionResult, bool]:
        workflow_type = workflow_type or extraction.workflow_type
        schema = SchemaRegistry.get(workflow_type)
        fields = dict(extraction.fields)
        valid = True

        for field in schema.fields:
            value = fields.get(field.name)

            if field.required and ExtractionValidationService._is_missing(value):
                valid = False

        if workflow_type == DEFAULT_WORKFLOW_TYPE:
            fields, invoice_valid = (
                ExtractionValidationService._validate_invoice(fields)
            )
            valid = valid and invoice_valid

        return (
            ExtractionResult(
                workflow_type=workflow_type,
                fields=fields,
            ),
            valid,
        )

    @staticmethod
    def _is_missing(value) -> bool:
        if value is None:
            return True
        if isinstance(value, str) and not value.strip():
            return True
        if isinstance(value, list) and len(value) == 0:
            return True
        return False

    @staticmethod
    def _validate_invoice(fields: dict) -> tuple[dict, bool]:
        valid = True

        currency = fields.get("currency")
        if isinstance(currency, str) and currency:
            fields["currency"] = NormalizerService.normalize_currency(currency)

        total_amount = fields.get("total_amount")
        if total_amount is None or float(total_amount) <= 0:
            valid = False

        vendor_name = fields.get("vendor_name")
        if not vendor_name or (
            isinstance(vendor_name, str) and not vendor_name.strip()
        ):
            valid = False

        return fields, valid
