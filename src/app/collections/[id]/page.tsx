import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { CollectionDetailView } from "@/components/collections/collection-detail-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants/pagination";
import {
  getCollectionById,
  getCollectionName,
} from "@/lib/db/collections";
import { getDashboardShellData } from "@/lib/db/dashboard-shell";
import { parsePageParam } from "@/lib/pagination";
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

  const name = await getCollectionName(userId, id);
  return {
    title: name ? `${name} · DevStash` : "Collection · DevStash",
  };
}

async function CollectionContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = await searchParams;
  const page = parsePageParam(query.page);

  const [collection, shell] = await Promise.all([
    getCollectionById(session.user.id, id, page, COLLECTIONS_PER_PAGE),
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">
          Loading collection…
        </p>
      }
    >
      <CollectionContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
