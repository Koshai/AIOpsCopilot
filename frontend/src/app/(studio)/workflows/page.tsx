import { WorkflowCatalog } from "@/components/workflows/workflow-catalog";
import { PageHeader } from "@/components/shared/page-header";

export default function WorkflowsPage() {
  return (
    <>
      <PageHeader
        title="Workflows"
        description="Browse workflow definitions and launch extraction runs against your documents."
      />

      <WorkflowCatalog />
    </>
  );
}
