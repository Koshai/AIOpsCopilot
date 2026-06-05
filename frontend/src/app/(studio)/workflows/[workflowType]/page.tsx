import { WorkflowStudio } from "@/components/workflows/workflow-studio";

type WorkflowStudioPageProps = {
  params: Promise<{
    workflowType: string;
  }>;
};

export default async function WorkflowStudioPage({
  params,
}: WorkflowStudioPageProps) {
  const { workflowType } = await params;

  return <WorkflowStudio workflowType={decodeURIComponent(workflowType)} />;
}
