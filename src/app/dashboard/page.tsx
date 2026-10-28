import { Suspense } from "react";

import { DashboardMain } from "@/components/dashboard/dashboard-main";
import {
  getCollectionStats,
  getRecentCollections,
} from "@/lib/db/collections";
import { getItemStats, getPinnedItems, getRecentItems } from "@/lib/db/items";

async function DashboardContent() {
  const [
    recentCollections,
    collectionStats,
    pinnedItems,
    recentItems,
    itemStats,
  ] = await Promise.all([
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
