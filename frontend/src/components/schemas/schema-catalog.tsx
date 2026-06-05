"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import {
  SchemaCard,
  SchemaCardSkeletonGrid,
} from "@/components/schemas/schema-card";
import { Button } from "@/components/ui/button";
import { schemasApi } from "@/services/api";
import type { WorkflowSchema } from "@/types/api";

export function SchemaCatalog() {
  const [schemas, setSchemas] = useState<WorkflowSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchemas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await schemasApi.list();
      setSchemas(data);
    } catch (err) {
      setSchemas([]);
      setError(
        err instanceof Error ? err.message : "Failed to load workflow schemas"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchemas();
  }, [loadSchemas]);

  if (loading) {
    return <SchemaCardSkeletonGrid count={2} />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex gap-3">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Could not load schemas
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadSchemas()}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (schemas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-foreground">
          No schemas available
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Registered workflow schemas will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
      {schemas.map((schema) => (
        <SchemaCard key={schema.workflow_type} schema={schema} />
      ))}
    </div>
  );
}
