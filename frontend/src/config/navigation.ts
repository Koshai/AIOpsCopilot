export type NavIconName =
  | "layout-dashboard"
  | "workflow"
  | "file-stack"
  | "history"
  | "activity"
  | "database"
  | "shapes"
  | "settings";

export type NavItem = {
  title: string;
  href: string;
  icon: NavIconName;
  description: string;
  badge?: string;
};

export const APP_NAME = "AI Workflow Studio";
export const APP_TAGLINE = "Enterprise workflow operations platform";

export const primaryNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "layout-dashboard",
    description: "Overview of platform activity and health",
  },
  {
    title: "Workflows",
    href: "/workflows",
    icon: "workflow",
    description: "Browse and launch extraction workflows",
  },
  {
    title: "Documents",
    href: "/documents",
    icon: "file-stack",
    description: "Uploaded files and ingestion status",
  },
  {
    title: "Executions",
    href: "/executions",
    icon: "history",
    description: "Workflow run history and performance",
  },
  {
    title: "Monitor",
    href: "/monitor",
    icon: "activity",
    description: "Real-time workflow execution operations",
    badge: "Live",
  },
  {
    title: "Reviews",
    href: "/reviews",
    icon: "database",
    description: "Human-in-the-loop approval queue",
    badge: "Queue",
  },
  {
    title: "Schemas",
    href: "/schemas",
    icon: "shapes",
    description: "Field definitions and validation rules",
  },
];

export const secondaryNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: "settings",
    description: "Workspace preferences and integrations",
  },
];

export const allNavItems: NavItem[] = [
  ...primaryNavItems,
  ...secondaryNavItems,
];

export function findNavItemByHref(href: string): NavItem | undefined {
  return allNavItems.find((item) => item.href === href);
}
