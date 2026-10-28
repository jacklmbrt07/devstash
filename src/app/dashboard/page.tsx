import { Suspense } from "react";

import { DashboardMain } from "@/components/dashboard/dashboard-main";
import {
  getCollectionStats,
  getRecentCollections,
} from "@/lib/db/collections";

async function DashboardCollections() {
  const [recentCollections, collectionStats] = await Promise.all([
    getRecentCollections(),
    getCollectionStats(),
  ]);

  return (
    <DashboardMain
      recentCollections={recentCollections}
      collectionStats={collectionStats}
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
      <DashboardCollections />
    </Suspense>
  );
}
