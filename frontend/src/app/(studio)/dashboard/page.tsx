import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { RecentExecutionsPanel } from "@/components/dashboard/recent-executions-panel";
import { PageHeader } from "@/components/shared/page-header";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Platform overview, activity feed, and operational health at a glance."
      />

      <DashboardSummaryCards />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentExecutionsPanel className="lg:col-span-1" />
        <PlaceholderPanel
          title="Review queue snapshot"
          description="Pending human approvals will surface here for quick triage."
          className="min-h-[240px] text-left"
        />
      </div>
    </>
  );
}
