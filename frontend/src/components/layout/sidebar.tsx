import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  APP_NAME,
  APP_TAGLINE,
  primaryNavItems,
  secondaryNavItems,
} from "@/config/navigation";

export function Sidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <Link href="/dashboard" className="block truncate text-sm font-semibold text-sidebar-foreground">
            {APP_NAME}
          </Link>
          <p className="truncate text-[11px] text-muted-foreground">{APP_TAGLINE}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-6">
          <div>
            <p className="mb-2 px-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Platform
            </p>
            <SidebarNav items={primaryNavItems} />
          </div>

          <Separator className="mx-3 bg-sidebar-border" />

          <div>
            <p className="mb-2 px-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <SidebarNav items={secondaryNavItems} />
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2.5">
          <p className="text-xs font-medium text-sidebar-foreground">Studio preview</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            API integration coming next
          </p>
        </div>
      </div>
    </aside>
  );
}
