import { Suspense, type ReactNode } from "react";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSidebarCollections } from "@/lib/db/collections";
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
  const [session, itemTypes, collections] = await Promise.all([
    auth(),
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={collections}
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
