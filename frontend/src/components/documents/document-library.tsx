"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Search } from "lucide-react";

import { DocumentTable } from "@/components/documents/document-table";
import { DocumentUploadZone } from "@/components/documents/document-upload-zone";
import { UploadDocumentDialog } from "@/components/documents/upload-document-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { documentsApi } from "@/services/api";
import type { Document } from "@/types/api";
import { formatDocumentType } from "@/components/documents/document-status-badge";

function matchesSearch(document: Document, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    document.filename.toLowerCase().includes(normalized) ||
    document.file_type.toLowerCase().includes(normalized) ||
    formatDocumentType(document.file_type).toLowerCase().includes(normalized) ||
    document.processing_status.includes(normalized)
  );
}

export function DocumentLibrary() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await documentsApi.list();
      setDocuments(data);
    } catch (err) {
      setDocuments([]);
      setError(
        err instanceof Error ? err.message : "Failed to load documents"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const filtered = useMemo(
    () => documents.filter((document) => matchesSearch(document, search)),
    [documents, search]
  );

  const uploadControls = (
    <>
      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => void loadDocuments()}
      />
      <DocumentUploadZone
        onOpenUpload={() => setUploadOpen(true)}
        disabled={loading || !!error}
      />
    </>
  );

  const toolbar = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search documents..."
          className="pl-9"
          aria-label="Search documents"
          disabled={loading || !!error}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {loading ? (
          "Loading documents..."
        ) : (
          <>
            <span className="font-medium text-foreground">{filtered.length}</span>
            {search.trim() ? " matching" : ""} of{" "}
            <span className="font-medium text-foreground">
              {documents.length}
            </span>{" "}
            document{documents.length === 1 ? "" : "s"}
          </>
        )}
      </p>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {uploadControls}
        {toolbar}
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Could not load documents
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadDocuments()}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!loading && documents.length === 0) {
    return (
      <div className="space-y-6">
        {uploadControls}
        {toolbar}
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No documents uploaded yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PDF or image to start running workflows against your files.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {uploadControls}
      {toolbar}

      {!loading && documents.length > 0 && filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No documents match your search
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different filename or clear the search box.
          </p>
        </div>
      ) : (
        <DocumentTable documents={filtered} loading={loading} />
      )}
    </div>
  );
}
