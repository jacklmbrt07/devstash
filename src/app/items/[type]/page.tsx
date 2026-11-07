import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ItemListView } from "@/components/items/item-list-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  getItemTypeLabel,
  getItemTypeNameFromSlug,
} from "@/lib/constants/item-types";
import { ITEMS_PER_PAGE } from "@/lib/constants/pagination";
import { getDashboardShellData } from "@/lib/db/dashboard-shell";
import { getItemsByType } from "@/lib/db/items";
import { parsePageParam } from "@/lib/pagination";
import { toSessionUser } from "@/types/session-user";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const name = getItemTypeNameFromSlug(type);
  const label = name ? getItemTypeLabel(name) : "Items";
  return { title: `${label} · DevStash` };
}

async function ItemsContent({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { type } = await params;
  const name = getItemTypeNameFromSlug(type);
  if (!name) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const query = await searchParams;
  const page = parsePageParam(query.page);

  const [result, shell] = await Promise.all([
    getItemsByType(name, page, ITEMS_PER_PAGE),
    getDashboardShellData(session.user.id),
  ]);

  return (
    <DashboardShell
      itemTypes={shell.itemTypes}
      collections={shell.collections}
      searchIndex={shell.searchIndex}
      user={toSessionUser(session.user)}
    >
      <ItemListView
        typeName={name}
        items={result.items}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
      />
    </DashboardShell>
  );
}

export default function ItemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">Loading items…</p>
      }
    >
      <ItemsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
