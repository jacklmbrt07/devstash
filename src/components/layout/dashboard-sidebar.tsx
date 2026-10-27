"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  getItemTypeHref,
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
  PRO_ITEM_TYPES,
} from "@/lib/constants/item-types";
import {
  collections,
  currentUser,
  items,
  itemTypes,
  type Collection,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getItemCount(itemTypeId: string): number {
  return items.filter((item) => item.itemTypeId === itemTypeId).length;
}

function getFavoriteCollections(): Collection[] {
  return collections.filter((collection) => collection.isFavorite);
}

function getRecentCollections(): Collection[] {
  const favoriteIds = new Set(
    getFavoriteCollections().map((collection) => collection.id)
  );

  return [...collections]
    .filter((collection) => !favoriteIds.has(collection.id))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 4);
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
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              {badge}
            </span>
          ) : null}
          {typeof count === "number" ? (
            <span className="tabular-nums text-muted-foreground">{count}</span>
          ) : null}
        </>
      )}
    </Link>
  );
}

export function DashboardSidebar({
  collapsed = false,
  onNavigate,
}: DashboardSidebarProps) {
  const favoriteCollections = getFavoriteCollections();
  const recentCollections = getRecentCollections();

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
                count={getItemCount(type.id)}
                badge={PRO_ITEM_TYPES.has(type.name) ? "Pro" : undefined}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            );
          })}

          {!collapsed && (
            <>
              <NavSectionLabel>Favorites</NavSectionLabel>
              {favoriteCollections.map((collection) => (
                <SidebarLink
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  label={collection.name}
                  icon={<Star className="fill-current" />}
                  iconColor="#fde047"
                  onNavigate={onNavigate}
                />
              ))}

              <NavSectionLabel>Recent</NavSectionLabel>
              {recentCollections.map((collection) => (
                <SidebarLink
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  label={collection.name}
                  icon={<Folder />}
                  onNavigate={onNavigate}
                />
              ))}
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
        <div
          className={cn(
            "flex items-center gap-3 rounded-md p-1.5",
            collapsed && "justify-center p-0"
          )}
        >
          <Avatar size="sm">
            <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{currentUser.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentUser.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
