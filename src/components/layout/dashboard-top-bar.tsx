import type { ReactNode } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardTopBarProps {
  sidebarToggle?: ReactNode;
}

export function DashboardTopBar({ sidebarToggle }: DashboardTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-4">
      <div className="flex items-center gap-2">
        {sidebarToggle}
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
          DS
        </span>
        <span className="text-sm font-semibold tracking-tight">DevStash</span>
      </div>

      <div className="relative mx-auto w-full max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items, tags, collections..."
          className="pl-8"
          readOnly
          aria-label="Search"
        />
      </div>

      <Button type="button" tabIndex={-1}>
        <Plus data-icon="inline-start" />
        New item
      </Button>
    </header>
  );
}
