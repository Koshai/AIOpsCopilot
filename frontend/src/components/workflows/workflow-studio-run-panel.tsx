import { Loader2, Play, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Document } from "@/types/api";

type WorkflowStudioRunPanelProps = {
  question: string;
  documentId: string;
  documents: Document[];
  running: boolean;
  disabled: boolean;
  onQuestionChange: (value: string) => void;
  onDocumentChange: (value: string) => void;
  onRun: () => void;
};

function selectClassName(className?: string) {
  return cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    className
  );
}

function textareaClassName(className?: string) {
  return cn(
    "flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    className
  );
}

export function WorkflowStudioRunPanel({
  question,
  documentId,
  documents,
  running,
  disabled,
  onQuestionChange,
  onDocumentChange,
  onRun,
}: WorkflowStudioRunPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Play className="size-4" />
          Run workflow
        </CardTitle>
        <CardDescription>
          Choose a document scope, describe what to extract, and start the
          workflow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="workflow-document">Document</Label>
          <select
            id="workflow-document"
            value={documentId}
            onChange={(event) => onDocumentChange(event.target.value)}
            className={selectClassName()}
            disabled={running || disabled}
          >
            <option value="">Search all documents</option>
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.filename} ({document.processing_status})
              </option>
            ))}
          </select>
          {documents.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No documents uploaded yet. Upload files from the Documents page to
              scope extraction.
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workflow-question">Question</Label>
          <textarea
            id="workflow-question"
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="Describe the structured data you want this workflow to extract."
            className={textareaClassName()}
            disabled={running || disabled}
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Extraction follows the schema fields defined for this workflow type.
        </p>
        <Button
          className="w-full sm:w-auto"
          onClick={onRun}
          disabled={running || disabled}
        >
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Run workflow
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
