"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FileUp, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { documentsApi } from "@/services/api/documents";
import { workflowsApi } from "@/services/api/workflows";
import type { Document, WorkflowDefinition } from "@/types/api";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];

type UploadDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultWorkflowType?: string;
  onUploaded?: (document: Document) => void;
};

function isAcceptedFile(file: File): boolean {
  return (
    ACCEPTED_TYPES.includes(file.type) ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  defaultWorkflowType,
  onUploaded,
}: UploadDocumentDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [workflowType, setWorkflowType] = useState(defaultWorkflowType ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);

  const resetForm = useCallback(() => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const loadWorkflows = useCallback(async () => {
    setLoadingWorkflows(true);
    try {
      const definitions = await workflowsApi.listDefinitions();
      const enabled = definitions.filter((item) => item.enabled);
      setWorkflows(enabled);

      setWorkflowType((current) => {
        if (current && enabled.some((item) => item.workflow_type === current)) {
          return current;
        }

        if (defaultWorkflowType) {
          const match = enabled.find(
            (item) => item.workflow_type === defaultWorkflowType
          );
          if (match) {
            return match.workflow_type;
          }
        }

        return enabled[0]?.workflow_type ?? "";
      });
    } catch (err) {
      toast.error("Failed to load workflow types", {
        description:
          err instanceof Error ? err.message : "Could not load workflow catalog",
      });
    } finally {
      setLoadingWorkflows(false);
    }
  }, [defaultWorkflowType]);

  useEffect(() => {
    if (open) {
      void loadWorkflows();
    } else {
      resetForm();
      setWorkflowType(defaultWorkflowType ?? "");
    }
  }, [open, loadWorkflows, resetForm, defaultWorkflowType]);

  useEffect(() => {
    if (defaultWorkflowType) {
      setWorkflowType(defaultWorkflowType);
    }
  }, [defaultWorkflowType]);

  const handleFileChange = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      return;
    }

    if (!isAcceptedFile(selected)) {
      toast.error("Unsupported file type", {
        description: "Upload a PDF or image file.",
      });
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Choose a file to upload");
      return;
    }

    if (!workflowType) {
      toast.error("Select a workflow type");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const document = await documentsApi.upload({
        file,
        workflowType,
        onProgress: setProgress,
      });

      toast.success("Document uploaded", {
        description: `${document.filename} is ready for ${workflowType} workflows.`,
      });

      onUploaded?.(document);
      onOpenChange(false);
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            Add a PDF or image and associate it with a workflow type for extraction runs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="upload-file">File</Label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/20",
                file && "border-primary/30 bg-primary/5"
              )}
            >
              <FileUp className="size-5 text-primary" />
              <span className="mt-3 text-sm font-medium text-foreground">
                {file ? file.name : "Choose PDF or image"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                Click to browse files
              </span>
            </button>
            <Input
              id="upload-file"
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf,image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) =>
                handleFileChange(event.target.files?.[0] ?? null)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow-type">Workflow type</Label>
            <select
              id="workflow-type"
              value={workflowType}
              disabled={uploading || loadingWorkflows || workflows.length === 0}
              onChange={(event) => setWorkflowType(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {workflows.length === 0 ? (
                <option value="">
                  {loadingWorkflows ? "Loading workflows..." : "No workflows available"}
                </option>
              ) : (
                workflows.map((workflow) => (
                  <option key={workflow.workflow_type} value={workflow.workflow_type}>
                    {workflow.display_name}
                  </option>
                ))
              )}
            </select>
          </div>

          {uploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={uploading || !file || !workflowType}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type UploadDocumentDialogTriggerProps = {
  defaultWorkflowType?: string;
  onUploaded?: (document: Document) => void;
  children?: ReactNode;
  buttonLabel?: string;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonSize?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

export function UploadDocumentDialogTrigger({
  defaultWorkflowType,
  onUploaded,
  children,
  buttonLabel = "Upload document",
  buttonVariant = "default",
  buttonSize = "default",
  className,
}: UploadDocumentDialogTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children ? (
        <span className={className} onClick={() => setOpen(true)}>
          {children}
        </span>
      ) : (
        <Button
          type="button"
          variant={buttonVariant}
          size={buttonSize}
          className={className}
          onClick={() => setOpen(true)}
        >
          <Upload className="size-4" />
          {buttonLabel}
        </Button>
      )}

      <UploadDocumentDialog
        open={open}
        onOpenChange={setOpen}
        defaultWorkflowType={defaultWorkflowType}
        onUploaded={onUploaded}
      />
    </>
  );
}
