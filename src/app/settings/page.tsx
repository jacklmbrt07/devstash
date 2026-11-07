import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SettingsView } from "@/components/settings/settings-view";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { toSessionUser } from "@/types/session-user";

export const metadata: Metadata = {
  title: "Settings · DevStash",
};

async function SettingsContent() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [itemTypes, collections] = await Promise.all([
    getSidebarItemTypes(),
    getSidebarCollections(session.user.id),
  ]);

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={collections}
      user={toSessionUser(session.user)}
    >
      <SettingsView />
    </DashboardShell>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">Loading settings…</p>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
