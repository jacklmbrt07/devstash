"use client";

import { useEffect, useRef, useState } from "react";

import { signOutAction } from "@/actions/auth";
import { UserAvatar } from "@/components/auth/user-avatar";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/session-user";

interface UserMenuProps {
  user: SessionUser;
  side?: "top" | "bottom";
}

export function UserMenu({ user, side = "bottom" }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar user={user} size="sm" />
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute right-0 z-20 min-w-36 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
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
