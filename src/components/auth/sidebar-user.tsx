"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { signOutAction } from "@/actions/auth";
import { UserAvatar } from "@/components/auth/user-avatar";
import { cn } from "@/lib/utils";
import { displayName, type SessionUser } from "@/types/session-user";

interface SidebarUserProps {
  user: SessionUser;
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarUser({ user, collapsed = false, onNavigate }: SidebarUserProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const name = displayName(user);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={cn("relative", collapsed && "flex justify-center")}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-md p-1.5",
          collapsed && "justify-center p-0",
        )}
      >
        <Link
          href="/profile"
          aria-label="Go to profile"
          title="Profile"
          onClick={onNavigate}
          className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <UserAvatar user={user} size="sm" />
        </Link>
        {!collapsed && (
          <button
            type="button"
            className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left outline-none hover:bg-sidebar-accent/70 focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
            onClick={() => setOpen((value) => !value)}
          >
            <p className="truncate text-sm font-medium">{name}</p>
            {user.email ? (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            ) : null}
          </button>
        )}
      </div>
      {open && !collapsed ? (
        <div
          role="menu"
          className="absolute right-0 bottom-full left-0 z-20 mb-2 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <Link
            href="/settings"
            role="menuitem"
            className="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            Settings
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
