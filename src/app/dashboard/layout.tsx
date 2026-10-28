import { Suspense, type ReactNode } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";

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
  const [itemTypes, collections] = await Promise.all([
    getSidebarItemTypes(),
    getSidebarCollections(),
  ]);

  return (
    <DashboardShell itemTypes={itemTypes} collections={collections}>
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
