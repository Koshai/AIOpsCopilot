from langsmith import traceable


@traceable(name="invoice_workflow")
def traced_workflow(
    graph,
    initial_state,
    config=None
):

    return graph.invoke(
        initial_state,
        config=config
    )