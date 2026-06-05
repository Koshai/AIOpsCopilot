import type { LucideIcon } from "lucide-react";
import { Receipt, Shapes, User } from "lucide-react";

const SCHEMA_ICON_MAP: Record<string, LucideIcon> = {
  receipt: Receipt,
  user: User,
};

type SchemaIconProps = {
  icon: string;
  className?: string;
};

export function SchemaIcon({ icon, className }: SchemaIconProps) {
  const Icon = SCHEMA_ICON_MAP[icon] ?? Shapes;
  return <Icon className={className} />;
}
