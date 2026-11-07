import { Suspense, type ReactNode } from "react";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getDashboardShellData } from "@/lib/db/dashboard-shell";
import { getSidebarItemTypes } from "@/lib/db/items";
import { toSessionUser } from "@/types/session-user";

function DashboardFallback() {
  return (
    <p className="p-6 text-sm text-muted-foreground">Loading dashboard…</p>
  );
}

async function DashboardFrame({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  const shell = userId
    ? await getDashboardShellData(userId)
    : {
        itemTypes: await getSidebarItemTypes(),
        collections: { favorites: [], recent: [] },
        searchIndex: { items: [], collections: [] },
      };

  return (
    <DashboardShell
      itemTypes={shell.itemTypes}
      collections={shell.collections}
      searchIndex={shell.searchIndex}
      user={toSessionUser(session?.user)}
    >
      {children}
    </DashboardShell>
  );
}

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardFrame>{children}</DashboardFrame>
    </Suspense>
  );
}
