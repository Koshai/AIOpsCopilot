from datetime import date
from typing import Optional

from dateutil import parser as date_parser

from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
from app.extraction.validation import (
    CONTRACT_WORKFLOW_TYPE,
    ExtractionValidationService,
)
from app.schemas.extraction import ExtractionResult


class AnomalyService:
    @staticmethod
    def detect(
        extraction: ExtractionResult,
        workflow_type: Optional[str] = None,
    ) -> bool:
        workflow_type = workflow_type or extraction.workflow_type

        if workflow_type == DEFAULT_WORKFLOW_TYPE:
            return AnomalyService._detect_invoice(extraction.fields)

        if workflow_type == CONTRACT_WORKFLOW_TYPE:
            return AnomalyService._detect_contract(extraction.fields)

        return False

    @staticmethod
    def _detect_invoice(fields: dict) -> bool:
        anomaly_detected = False

        total_amount = fields.get("total_amount")
        if total_amount is not None and float(total_amount) > 100000:
            anomaly_detected = True

        currency = fields.get("currency")
        if currency and currency not in ["USD", "EUR", "GBP"]:
            anomaly_detected = True

        return anomaly_detected

    @staticmethod
    def _detect_contract(fields: dict) -> bool:
        if ExtractionValidationService._is_missing(fields.get("party_a")):
            return True

        if ExtractionValidationService._is_missing(fields.get("party_b")):
            return True

        effective_date = AnomalyService._parse_contract_date(
            fields.get("effective_date")
        )
        renewal_date = AnomalyService._parse_contract_date(fields.get("renewal_date"))

        if (
            effective_date is not None
            and renewal_date is not None
            and renewal_date < effective_date
        ):
            return True

        return False

    @staticmethod
    def _parse_contract_date(value) -> Optional[date]:
        if ExtractionValidationService._is_missing(value):
            return None

        if isinstance(value, date):
            return value

        try:
            return date_parser.parse(str(value), fuzzy=True).date()
        except (TypeError, ValueError, OverflowError):
            return None
