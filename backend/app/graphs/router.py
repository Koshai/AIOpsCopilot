from app.graphs.retry_extract_node import MAX_RETRIES


def validation_router(state):

    if state["validation_passed"]:
        return "anomaly"

    retry_count = state.get("retry_count", 0)

    if retry_count < MAX_RETRIES:
        return "retry"

    return "failed"