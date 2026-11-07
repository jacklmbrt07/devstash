"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PanelLeft } from "lucide-react";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";
import { ItemDrawer } from "@/components/items/item-drawer";
import { GlobalSearch } from "@/components/search/global-search";
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
import type { SearchIndex } from "@/lib/db/search";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/session-user";

interface DashboardShellProps {
  children: ReactNode;
  itemTypes: SidebarItemType[];
  collections: SidebarCollections;
  searchIndex: SearchIndex;
  user: SessionUser;
}

const LG_QUERY = "(min-width: 1024px)";

function subscribeToDesktop(onStoreChange: () => void) {
  const media = window.matchMedia(LG_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function isDesktopViewport() {
  return window.matchMedia(LG_QUERY).matches;
}

function subscribeToMac(onStoreChange: () => void) {
  void onStoreChange;
  return () => {};
}

function isMacPlatform() {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
}

export function DashboardShell({
  children,
  itemTypes,
  collections,
  searchIndex,
  user,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isDesktop = useSyncExternalStore(
    subscribeToDesktop,
    isDesktopViewport,
    () => false
  );
  const isMac = useSyncExternalStore(subscribeToMac, isMacPlatform, () => true);
  const searchShortcutLabel = isMac ? "⌘K" : "Ctrl+K";
  const sidebarLabel = isDesktop
    ? collapsed
      ? "Expand sidebar"
      : "Collapse sidebar"
    : mobileOpen
      ? "Close navigation"
      : "Open navigation";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setSearchOpen((open) => !open);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleToggle() {
    if (typeof window !== "undefined" && window.matchMedia(LG_QUERY).matches) {
      setCollapsed((value) => !value);
      return;
    }

    setMobileOpen((value) => !value);
  }

  return (
    <ItemDrawer>
      <div className="flex min-h-full flex-col">
        <DashboardTopBar
          sidebarToggle={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleToggle}
              aria-label={sidebarLabel}
              aria-expanded={isDesktop ? undefined : mobileOpen}
            >
              <PanelLeft />
            </Button>
          }
          user={user}
          onSearchOpen={() => setSearchOpen(true)}
          searchShortcutLabel={searchShortcutLabel}
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
              user={user}
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
                user={user}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>

      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        searchIndex={searchIndex}
      />
    </ItemDrawer>
  );
}
