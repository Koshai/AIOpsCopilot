"use client";

import { useState } from "react";
import { FileUp, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DocumentUploadZoneProps = {
  onOpenUpload?: () => void;
  disabled?: boolean;
  className?: string;
};

export function DocumentUploadZone({
  onOpenUpload,
  disabled = false,
  className,
}: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const openUpload = () => {
    if (!disabled) {
      onOpenUpload?.();
    }
  };

  return (
    <div
      className={cn("space-y-4", className)}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) {
          setIsDragging(true);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) {
          setIsDragging(true);
        }
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        openUpload();
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Open upload dialog"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openUpload();
          }
        }}
        onClick={openUpload}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card/40 hover:border-primary/40 hover:bg-muted/20",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileUp className="size-5" />
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">
          Drag and drop files here
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF and image files supported
        </p>
        <Button
          type="button"
          className="mt-4"
          size="sm"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            openUpload();
          }}
        >
          <Upload className="size-4" />
          Upload document
        </Button>
      </div>
    </div>
  );
}
