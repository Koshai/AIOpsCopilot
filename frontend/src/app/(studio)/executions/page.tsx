import { ExecutionHistory } from "@/components/executions/execution-history";
import { PageHeader } from "@/components/shared/page-header";

export default function ExecutionsPage() {
  return (
    <>
      <PageHeader
        title="Executions"
        description="Inspect workflow run history, status, duration, and timing."
      />

      <ExecutionHistory />
    </>
  );
}
