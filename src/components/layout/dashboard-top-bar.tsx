import type { ReactNode } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { UserMenu } from "@/components/auth/user-menu";
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog";
import { CreateItemDialog } from "@/components/items/create-item-dialog";
import { Input } from "@/components/ui/input";
import type { SessionUser } from "@/types/session-user";

interface DashboardTopBarProps {
  sidebarToggle?: ReactNode;
  user: SessionUser;
}

export function DashboardTopBar({ sidebarToggle, user }: DashboardTopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-4">
      <div className="flex items-center gap-2">
        {sidebarToggle}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Go to dashboard"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            DS
          </span>
          <span className="text-sm font-semibold tracking-tight">DevStash</span>
        </Link>
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

      <div className="flex items-center gap-2">
        <CreateCollectionDialog />
        <CreateItemDialog />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
