import Link from "next/link";

import { SchemaIcon } from "@/components/schemas/schema-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkflowDefinition } from "@/types/api";

type WorkflowDefinitionCardProps = {
  definition: WorkflowDefinition;
  className?: string;
};

export function WorkflowDefinitionCard({
  definition,
  className,
}: WorkflowDefinitionCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SchemaIcon icon={definition.icon} className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-base">{definition.display_name}</CardTitle>
              <Badge variant="outline" className="font-mono text-[11px]">
                {definition.workflow_type}
              </Badge>
            </div>
          </div>
          <EnabledBadge enabled={definition.enabled} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <CardDescription className="flex-1 text-sm leading-relaxed">
          {definition.description}
        </CardDescription>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          asChild
          disabled={!definition.enabled}
        >
          <Link href={`/workflows/${definition.workflow_type}`}>
            Open studio
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EnabledBadge({ enabled }: { enabled: boolean }) {
  if (enabled) {
    return (
      <Badge
        variant="outline"
        className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      >
        Enabled
      </Badge>
    );
  }

  return (
    <Badge variant="muted" className="shrink-0">
      Disabled
    </Badge>
  );
}

function WorkflowDefinitionCardSkeleton() {
  return (
    <Card className="animate-pulse" aria-hidden>
      <CardHeader className="pb-4">
        <div className="flex gap-3">
          <div className="size-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkflowDefinitionCardSkeletonGrid({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <WorkflowDefinitionCardSkeleton key={index} />
      ))}
    </div>
  );
}
