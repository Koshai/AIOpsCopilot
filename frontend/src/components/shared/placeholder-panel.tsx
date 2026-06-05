import { cn } from "@/lib/utils";

type PlaceholderPanelProps = {
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
};

export function PlaceholderPanel({
  title,
  description,
  className,
  children,
}: PlaceholderPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-card/50 p-8 text-center",
        className
      )}
    >
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
