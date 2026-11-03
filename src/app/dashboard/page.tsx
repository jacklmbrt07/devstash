import { Suspense } from "react";

import { auth } from "@/auth";
import { DashboardMain } from "@/components/dashboard/dashboard-main";
import {
  getCollectionStats,
  getRecentCollections,
} from "@/lib/db/collections";
import { getItemStats, getPinnedItems, getRecentItems } from "@/lib/db/items";

async function DashboardContent() {
  const [
    session,
    recentCollections,
    collectionStats,
    pinnedItems,
    recentItems,
    itemStats,
  ] = await Promise.all([
    auth(),
    getRecentCollections(),
    getCollectionStats(),
    getPinnedItems(),
    getRecentItems(),
    getItemStats(),
  ]);

  return (
    <DashboardMain
      recentCollections={recentCollections}
      collectionStats={collectionStats}
      pinnedItems={pinnedItems}
      recentItems={recentItems}
      itemStats={itemStats}
      userName={session?.user?.name?.trim() || "there"}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
