from langsmith import traceable


@traceable(name="workflow_execute")
def traced_workflow(
    graph,
    initial_state,
    config=None
):

    return graph.invoke(
        initial_state,
        config=config
    )