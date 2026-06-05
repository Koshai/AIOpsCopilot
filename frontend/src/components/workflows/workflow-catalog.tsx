"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Search } from "lucide-react";

import {
  WorkflowDefinitionCard,
  WorkflowDefinitionCardSkeletonGrid,
} from "@/components/workflows/workflow-definition-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { workflowsApi } from "@/services/api";
import type { WorkflowDefinition } from "@/types/api";

function matchesSearch(definition: WorkflowDefinition, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    definition.display_name.toLowerCase().includes(normalized) ||
    definition.workflow_type.toLowerCase().includes(normalized) ||
    definition.description.toLowerCase().includes(normalized) ||
    definition.schema_name.toLowerCase().includes(normalized)
  );
}

export function WorkflowCatalog() {
  const [definitions, setDefinitions] = useState<WorkflowDefinition[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDefinitions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await workflowsApi.listDefinitions();
      setDefinitions(data);
    } catch (err) {
      setDefinitions([]);
      setError(
        err instanceof Error ? err.message : "Failed to load workflow definitions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDefinitions();
  }, [loadDefinitions]);

  const filtered = useMemo(
    () => definitions.filter((item) => matchesSearch(item, search)),
    [definitions, search]
  );

  const toolbar = (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search workflows..."
          className="pl-9"
          aria-label="Search workflows"
          disabled={loading || !!error}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {loading ? (
          "Loading workflows..."
        ) : (
          <>
            <span className="font-medium text-foreground">{filtered.length}</span>
            {search.trim() ? " matching" : ""} of{" "}
            <span className="font-medium text-foreground">
              {definitions.length}
            </span>{" "}
            workflow{definitions.length === 1 ? "" : "s"}
          </>
        )}
      </p>
    </div>
  );

  if (loading) {
    return (
      <>
        {toolbar}
        <WorkflowDefinitionCardSkeletonGrid count={4} />
      </>
    );
  }

  if (error) {
    return (
      <>
        {toolbar}
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Could not load workflows
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadDefinitions()}
          >
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </>
    );
  }

  if (definitions.length === 0) {
    return (
      <>
        {toolbar}
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No workflows configured
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Workflow definitions will appear here once registered in the platform.
          </p>
        </div>
      </>
    );
  }

  if (filtered.length === 0) {
    return (
      <>
        {toolbar}
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No workflows match your search
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword or clear the search box.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {toolbar}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((definition) => (
          <WorkflowDefinitionCard
            key={definition.id}
            definition={definition}
          />
        ))}
      </div>
    </>
  );
}
