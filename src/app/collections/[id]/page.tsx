import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionDetailView } from "@/components/collections/collection-detail-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCollectionById } from "@/lib/db/collections";
import { getDashboardShellData } from "@/lib/db/dashboard-shell";
import { toSessionUser } from "@/types/session-user";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { title: "Collection · DevStash" };
  }

  const collection = await getCollectionById(userId, id);
  return {
    title: collection
      ? `${collection.name} · DevStash`
      : "Collection · DevStash",
  };
}

async function CollectionContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [collection, shell] = await Promise.all([
    getCollectionById(session.user.id, id),
    getDashboardShellData(session.user.id),
  ]);

  if (!collection) notFound();

  return (
    <DashboardShell
      itemTypes={shell.itemTypes}
      collections={shell.collections}
      searchIndex={shell.searchIndex}
      user={toSessionUser(session.user)}
    >
      <CollectionDetailView collection={collection} />
    </DashboardShell>
  );
}

export default function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">
          Loading collection…
        </p>
      }
    >
      <CollectionContent params={params} />
    </Suspense>
  );
}
