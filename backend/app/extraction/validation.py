from typing import Optional

from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE, SchemaRegistry
from app.schemas.extraction import ExtractionResult
from app.services.normalizer_service import NormalizerService

CONTRACT_WORKFLOW_TYPE = "contract"
CONTRACT_REQUIRED_FIELDS = (
    "contract_title",
    "party_a",
    "party_b",
    "effective_date",
)


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
        elif workflow_type == CONTRACT_WORKFLOW_TYPE:
            valid = valid and ExtractionValidationService._validate_contract(fields)

        return (
            ExtractionResult(
                workflow_type=workflow_type,
                fields=fields,
            ),
            valid,
        )

    @staticmethod
    def get_missing_fields(
        extraction: ExtractionResult,
        workflow_type: Optional[str] = None,
    ) -> list[str]:
        workflow_type = workflow_type or extraction.workflow_type
        schema = SchemaRegistry.get(workflow_type)
        fields = dict(extraction.fields)
        missing: list[str] = []

        for field in schema.fields:
            value = fields.get(field.name)
            if field.required and ExtractionValidationService._is_missing(value):
                missing.append(field.name)

        if workflow_type == DEFAULT_WORKFLOW_TYPE:
            total_amount = fields.get("total_amount")
            if total_amount is None or float(total_amount) <= 0:
                if "total_amount" not in missing:
                    missing.append("total_amount")

            vendor_name = fields.get("vendor_name")
            if not vendor_name or (
                isinstance(vendor_name, str) and not vendor_name.strip()
            ):
                if "vendor_name" not in missing:
                    missing.append("vendor_name")
        elif workflow_type == CONTRACT_WORKFLOW_TYPE:
            for name in CONTRACT_REQUIRED_FIELDS:
                if ExtractionValidationService._is_missing(fields.get(name)):
                    if name not in missing:
                        missing.append(name)

        return missing

    @staticmethod
    def _is_missing(value) -> bool:
        if value is None:
            return True
        if isinstance(value, str):
            normalized = value.strip().lower()
            if not normalized:
                return True
            if normalized in {"null", "none", "n/a", "na", "unknown"}:
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

    @staticmethod
    def _validate_contract(fields: dict) -> bool:
        return all(
            not ExtractionValidationService._is_missing(fields.get(name))
            for name in CONTRACT_REQUIRED_FIELDS
        )
