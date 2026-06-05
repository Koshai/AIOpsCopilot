"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { ExtractionResultViewer } from "@/components/extraction/extraction-result-viewer";
import { ExecutionStatusBadge } from "@/components/dashboard/execution-status-badge";
import { WorkflowStudioOverview } from "@/components/workflows/workflow-studio-overview";
import { WorkflowStudioRunPanel } from "@/components/workflows/workflow-studio-run-panel";
import { WorkflowTimeline } from "@/components/workflows/workflow-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useWorkflowEvents } from "@/hooks/use-workflow-events";
import { useWorkflowExecution } from "@/hooks/use-workflow-execution";
import { buildTimelineFromExecution } from "@/lib/workflow-timeline";
import {
  buildDefaultWorkflowQuestion,
  getSchemaFields,
} from "@/lib/workflow-studio";
import { cn } from "@/lib/utils";
import { documentsApi, schemasApi, workflowsApi } from "@/services/api";
import { getWorkflowExecutionErrorMessage } from "@/services/workflow-execution-service";
import type { Document, WorkflowDefinition, WorkflowSchema } from "@/types/api";

const CONNECTION_STATUS_LABELS = {
  idle: "Offline",
  connecting: "Connecting",
  connected: "Live",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting",
  error: "Connection error",
} as const;

type WorkflowStudioProps = {
  workflowType: string;
};

function WorkflowStudioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="animate-pulse lg:col-span-5">
          <CardHeader>
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="mt-2 h-4 w-full rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-24 rounded bg-muted" />
          </CardContent>
        </Card>
        <div className="space-y-6 lg:col-span-7">
          <Card className="animate-pulse">
            <CardContent className="h-48" />
          </Card>
          <Card className="animate-pulse">
            <CardContent className="h-40" />
          </Card>
        </div>
      </div>
    </div>
  );
}

export function WorkflowStudio({ workflowType }: WorkflowStudioProps) {
  const [definition, setDefinition] = useState<WorkflowDefinition | null>(null);
  const [schema, setSchema] = useState<WorkflowSchema | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [documentId, setDocumentId] = useState("");

  const {
    execute: executeWorkflow,
    result: lastResult,
    loading: running,
  } = useWorkflowExecution();

  const {
    events: liveEvents,
    connectionStatus,
    clearEvents,
  } = useWorkflowEvents({ enabled: !loading && !notFound && !error });

  const fields = useMemo(() => getSchemaFields(schema), [schema]);

  const timelineEvents = useMemo(() => {
    if (liveEvents.length > 0) {
      return liveEvents;
    }

    if (lastResult) {
      return buildTimelineFromExecution(lastResult);
    }

    return [];
  }, [lastResult, liveEvents]);

  const loadStudio = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const [definitions, schemaData, documentList] = await Promise.all([
        workflowsApi.listDefinitions(),
        schemasApi.getByWorkflowType(workflowType).catch(() => null),
        documentsApi.list().catch(() => [] as Document[]),
      ]);

      const match = definitions.find(
        (item) => item.workflow_type === workflowType
      );

      if (!match) {
        setDefinition(null);
        setSchema(null);
        setDocuments(documentList);
        setNotFound(true);
        return;
      }

      setDefinition(match);
      setSchema(schemaData);
      setDocuments(documentList);
      setQuestion(buildDefaultWorkflowQuestion(match, schemaData));
      setDocumentId("");
    } catch (err) {
      setDefinition(null);
      setSchema(null);
      setError(
        err instanceof Error ? err.message : "Failed to load workflow studio"
      );
    } finally {
      setLoading(false);
    }
  }, [workflowType]);

  useEffect(() => {
    void loadStudio();
  }, [loadStudio]);

  const handleRun = async () => {
    if (!definition?.enabled) {
      toast.error("Workflow disabled", {
        description: "This workflow is not enabled for execution.",
      });
      return;
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      toast.error("Question required", {
        description: "Enter a question or extraction prompt before running.",
      });
      return;
    }

    clearEvents();

    try {
      const result = await executeWorkflow({
        question: trimmedQuestion,
        workflow_type: workflowType,
        document_id: documentId ? Number(documentId) : null,
      });

      toast.success("Workflow completed", {
        description: `${definition.display_name} finished with status ${result.status}.`,
      });
    } catch (err) {
      toast.error("Workflow run failed", {
        description: getWorkflowExecutionErrorMessage(err),
      });
    }
  };

  if (loading) {
    return <WorkflowStudioSkeleton />;
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href="/workflows">
            <ArrowLeft className="size-4" />
            Back to workflows
          </Link>
        </Button>
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
        >
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Workflow not found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                No definition exists for{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {workflowType}
                </code>
                . Choose a workflow from the catalog.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !definition) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
          <Link href="/workflows">
            <ArrowLeft className="size-4" />
            Back to workflows
          </Link>
        </Button>
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Could not load workflow studio
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadStudio()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
            <Link href="/workflows">
              <ArrowLeft className="size-4" />
              Back to workflows
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {definition.display_name}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {definition.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[11px]",
              definition.enabled
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : undefined
            )}
          >
            {definition.enabled ? "Enabled" : "Disabled"}
          </Badge>
          {lastResult ? (
            <ExecutionStatusBadge status={lastResult.status} />
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <WorkflowStudioOverview definition={definition} fields={fields} />
        </div>

        <div className="space-y-6 lg:col-span-7">
          <WorkflowStudioRunPanel
            question={question}
            documentId={documentId}
            documents={documents}
            running={running}
            disabled={!definition.enabled}
            onQuestionChange={setQuestion}
            onDocumentChange={setDocumentId}
            onRun={() => void handleRun()}
          />

          <WorkflowTimeline
            events={timelineEvents}
            description={`LangGraph node progress · ${CONNECTION_STATUS_LABELS[connectionStatus]}`}
            emptyMessage="Run a workflow to visualize execution progress here."
          />

          <ExtractionResultViewer
            result={lastResult?.extraction ?? null}
            title="Extraction result"
            description={
              lastResult
                ? `Structured output from the latest run (${lastResult.status}).`
                : "Structured extraction output from the latest run."
            }
          />
        </div>
      </div>
    </div>
  );
}
