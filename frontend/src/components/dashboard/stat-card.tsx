import { cn } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  hint: string;
  value: number | null;
  loading?: boolean;
  className?: string;
};

export function StatCard({
  label,
  hint,
  value,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <div
          className="mt-3 h-9 w-20 animate-pulse rounded-md bg-muted"
          aria-hidden
        />
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {value ?? "—"}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
