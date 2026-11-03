"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";

import { SidebarUser } from "@/components/auth/sidebar-user";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  getItemTypeHref,
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
  PRO_ITEM_TYPES,
} from "@/lib/constants/item-types";
import type {
  SidebarCollection,
  SidebarCollections,
  SidebarRecentCollection,
} from "@/lib/db/collections";
import type { SidebarItemType } from "@/lib/db/items";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/session-user";

interface DashboardSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  itemTypes: SidebarItemType[];
  collections: SidebarCollections;
  user: SessionUser;
}

function NavSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 pt-4 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  iconColor,
  count,
  badge,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  iconColor?: string;
  count?: number;
  badge?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        collapsed && "justify-center px-0",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
      )}
    >
      <span
        className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-4"
        style={iconColor ? { color: iconColor } : undefined}
      >
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {badge ? (
            <Badge
              variant="outline"
              className="h-4 rounded-sm border-amber-400/25 bg-amber-400/10 px-1 text-[10px] font-semibold tracking-wide text-amber-400"
            >
              {badge}
            </Badge>
          ) : null}
          {typeof count === "number" ? (
            <span className="tabular-nums text-muted-foreground">{count}</span>
          ) : null}
        </>
      )}
    </Link>
  );
}

function TypeDot({ color }: { color: string | null }) {
  return (
    <span
      className="size-2.5 rounded-full bg-muted-foreground/40"
      style={color ? { backgroundColor: color } : undefined}
      aria-hidden
    />
  );
}

function FavoriteCollectionLinks({
  collections,
  onNavigate,
}: {
  collections: SidebarCollection[];
  onNavigate?: () => void;
}) {
  return collections.map((collection) => (
    <SidebarLink
      key={collection.id}
      href={`/collections/${collection.id}`}
      label={collection.name}
      icon={<Star className="fill-current" />}
      iconColor="#fde047"
      onNavigate={onNavigate}
    />
  ));
}

function RecentCollectionLinks({
  collections,
  onNavigate,
}: {
  collections: SidebarRecentCollection[];
  onNavigate?: () => void;
}) {
  return collections.map((collection) => (
    <SidebarLink
      key={collection.id}
      href={`/collections/${collection.id}`}
      label={collection.name}
      icon={<TypeDot color={collection.accentColor} />}
      onNavigate={onNavigate}
    />
  ));
}

export function DashboardSidebar({
  collapsed = false,
  onNavigate,
  itemTypes,
  collections,
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const viewAllActive = pathname === "/collections";

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <ScrollArea className="min-h-0 flex-1">
        <nav className={cn("flex flex-col gap-0.5 p-3", collapsed && "px-2")}>
          {!collapsed && <NavSectionLabel>Types</NavSectionLabel>}
          {collapsed && <Separator className="mb-2" />}
          {itemTypes.map((type) => {
            const Icon = ITEM_TYPE_ICONS[type.name];
            return (
              <SidebarLink
                key={type.id}
                href={getItemTypeHref(type.name)}
                label={getItemTypeLabel(type.name)}
                icon={Icon ? <Icon /> : null}
                iconColor={type.color}
                count={type.count}
                badge={PRO_ITEM_TYPES.has(type.name) ? "PRO" : undefined}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            );
          })}

          {!collapsed && (
            <>
              {collections.favorites.length > 0 ? (
                <>
                  <NavSectionLabel>Favorites</NavSectionLabel>
                  <FavoriteCollectionLinks
                    collections={collections.favorites}
                    onNavigate={onNavigate}
                  />
                </>
              ) : null}

              {collections.recent.length > 0 ? (
                <>
                  <NavSectionLabel>Recent</NavSectionLabel>
                  <RecentCollectionLinks
                    collections={collections.recent}
                    onNavigate={onNavigate}
                  />
                </>
              ) : null}

              <Link
                href="/collections"
                onClick={onNavigate}
                className={cn(
                  "mt-1 block rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  viewAllActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                )}
              >
                View all collections
              </Link>
            </>
          )}
        </nav>
      </ScrollArea>

      <div
        className={cn(
          "border-t border-sidebar-border p-3",
          collapsed && "flex justify-center px-2"
        )}
      >
        <SidebarUser
          user={user}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
