import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Database,
  FileStack,
  History,
  LayoutDashboard,
  Settings,
  Shapes,
  Workflow,
} from "lucide-react";

import type { NavIconName } from "@/config/navigation";

export const navIconMap: Record<NavIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  workflow: Workflow,
  "file-stack": FileStack,
  history: History,
  activity: Activity,
  database: Database,
  shapes: Shapes,
  settings: Settings,
};

export function NavIcon({
  name,
  className,
}: {
  name: NavIconName;
  className?: string;
}) {
  const Icon = navIconMap[name];
  return <Icon className={className} />;
}
