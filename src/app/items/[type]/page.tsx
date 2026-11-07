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
import { getDashboardShellData } from "@/lib/db/dashboard-shell";
import { getItemsByType } from "@/lib/db/items";
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
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const name = getItemTypeNameFromSlug(type);
  if (!name) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [items, shell] = await Promise.all([
    getItemsByType(name),
    getDashboardShellData(session.user.id),
  ]);

  return (
    <DashboardShell
      itemTypes={shell.itemTypes}
      collections={shell.collections}
      searchIndex={shell.searchIndex}
      user={toSessionUser(session.user)}
    >
      <ItemListView typeName={name} items={items} />
    </DashboardShell>
  );
}

export default function ItemsPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">Loading items…</p>
      }
    >
      <ItemsContent params={params} />
    </Suspense>
  );
}
