"use client";

import { Bell, Search } from "lucide-react";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { findNavItemByHref } from "@/config/navigation";
import { usePathname } from "next/navigation";

export function TopNavbar() {
  const pathname = usePathname();
  const current = findNavItemByHref(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <MobileSidebar />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          AI Workflow Studio
        </p>
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {current?.title ?? "Overview"}
        </h1>
      </div>

      <div className="hidden max-w-sm flex-1 md:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Search workflows, documents..."
            disabled
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" disabled>
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 gap-2 px-2">
              <Avatar className="size-7">
                <AvatarFallback className="text-xs">AO</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">Ops Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
            <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
