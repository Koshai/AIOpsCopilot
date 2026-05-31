from typing import Optional

from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
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
