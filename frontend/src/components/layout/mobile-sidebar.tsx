"use client";

import { Menu } from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  APP_NAME,
  primaryNavItems,
  secondaryNavItems,
} from "@/config/navigation";
import { Sparkles } from "lucide-react";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </div>

        <div className="space-y-6 py-4">
          <div>
            <p className="mb-2 px-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Platform
            </p>
            <SidebarNav items={primaryNavItems} />
          </div>
          <Separator className="mx-3" />
          <div>
            <p className="mb-2 px-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <SidebarNav items={secondaryNavItems} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
