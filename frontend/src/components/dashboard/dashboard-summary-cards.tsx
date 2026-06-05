"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { dashboardApi } from "@/services/api";
import type { DashboardSummary } from "@/types/api";

type StatKey = keyof DashboardSummary;

const STAT_CONFIG: {
  key: StatKey;
  label: string;
  hint: string;
}[] = [
  { key: "workflow_count", label: "Workflow runs", hint: "Total executions" },
  { key: "document_count", label: "Documents", hint: "Uploaded files" },
  { key: "pending_reviews", label: "Pending reviews", hint: "Awaiting approval" },
  {
    key: "available_schemas",
    label: "Available schemas",
    hint: "Workflow types",
  },
];

export function DashboardSummaryCards() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard summary"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  if (error) {
    return (
      <div
        role="alert"
        className="mb-8 flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex gap-3">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Could not load dashboard metrics
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadSummary()}
          className="shrink-0"
        >
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STAT_CONFIG.map(({ key, label, hint }) => (
        <StatCard
          key={key}
          label={label}
          hint={hint}
          value={summary ? summary[key] : null}
          loading={loading}
        />
      ))}
    </div>
  );
}
