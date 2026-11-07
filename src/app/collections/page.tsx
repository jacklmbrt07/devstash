import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionListView } from "@/components/collections/collection-list-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  getAllCollections,
  getSidebarCollections,
} from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { toSessionUser } from "@/types/session-user";

export const metadata: Metadata = {
  title: "Collections · DevStash",
};

async function CollectionsContent() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [collections, itemTypes, sidebarCollections] = await Promise.all([
    getAllCollections(session.user.id),
    getSidebarItemTypes(),
    getSidebarCollections(session.user.id),
  ]);

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={sidebarCollections}
      user={toSessionUser(session.user)}
    >
      <CollectionListView collections={collections} />
    </DashboardShell>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">
          Loading collections…
        </p>
      }
    >
      <CollectionsContent />
    </Suspense>
  );
}
