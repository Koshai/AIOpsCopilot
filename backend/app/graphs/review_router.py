def review_router(state):

    if state["anomaly_detected"]:
        return "human_review"

    return "complete"