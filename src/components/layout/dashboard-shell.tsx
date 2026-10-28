"use client";

import { useState, type ReactNode } from "react";
import { PanelLeft } from "lucide-react";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SidebarCollections } from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
  itemTypes: SidebarItemType[];
  collections: SidebarCollections;
}

const LG_QUERY = "(min-width: 1024px)";

export function DashboardShell({
  children,
  itemTypes,
  collections,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleToggle() {
    if (typeof window !== "undefined" && window.matchMedia(LG_QUERY).matches) {
      setCollapsed((value) => !value);
      return;
    }

    setMobileOpen((value) => !value);
  }

  return (
    <div className="flex min-h-full flex-col">
      <DashboardTopBar
        sidebarToggle={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft />
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 overflow-hidden border-r border-sidebar-border transition-[width] duration-200 ease-in-out lg:block",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <DashboardSidebar
            collapsed={collapsed}
            itemTypes={itemTypes}
            collections={collections}
          />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-72 max-w-[85vw] gap-0 p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>
                Browse item types and collections
              </SheetDescription>
            </SheetHeader>
            <DashboardSidebar
              itemTypes={itemTypes}
              collections={collections}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
