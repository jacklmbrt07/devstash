import { CollectionCard } from "@/components/collections/collection-card";
import type { DashboardCollection } from "@/lib/db/collections";

export function CollectionListView({
  collections,
}: {
  collections: DashboardCollection[];
}) {
  const countLabel = collections.length === 1 ? "collection" : "collections";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="tabular-nums">{collections.length}</span> {countLabel}
        </p>
      </div>
      {collections.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      )}
    </div>
  );
}
