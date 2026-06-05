import { WorkflowMonitor } from "@/components/monitor/workflow-monitor";
import { PageHeader } from "@/components/shared/page-header";

export default function MonitorPage() {
  return (
    <>
      <PageHeader
        title="Operations Center"
        description="Real-time monitoring for AI workflow executions — active runs, live WebSocket events, node timelines, and status."
      />

      <WorkflowMonitor />
    </>
  );
}
