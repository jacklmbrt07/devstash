import { CollectionDetailActions } from "@/components/collections/collection-detail-actions";
import { ItemCard } from "@/components/items/item-card";
import {
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import type { CollectionDetail } from "@/lib/db/collections";
import { formatRelativeTime } from "@/lib/format-relative-time";

export function CollectionDetailView({
  collection,
}: {
  collection: CollectionDetail;
}) {
  const countLabel = collection.items.length === 1 ? "item" : "items";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {collection.name}
          </h1>
          <CollectionDetailActions
            collectionId={collection.id}
            name={collection.name}
            description={collection.description}
            isFavorite={collection.isFavorite}
          />
        </div>
        {collection.description ? (
          <p className="text-sm text-muted-foreground">
            {collection.description}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <p>
            <span className="tabular-nums">{collection.items.length}</span>{" "}
            {countLabel} · Updated{" "}
            {formatRelativeTime(collection.updatedAt, new Date())}
          </p>
          {collection.types.length > 0 ? (
            <div className="flex items-center gap-2">
              {collection.types.map((type) => {
                const Icon = ITEM_TYPE_ICONS[type.name];
                if (!Icon) return null;
                const label = getItemTypeLabel(type.name);
                return (
                  <span
                    key={type.name}
                    className="flex size-5 items-center justify-center"
                    style={{ color: type.color }}
                    title={label}
                  >
                    <Icon className="size-3.5" aria-label={label} />
                  </span>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {collection.items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {collection.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No items in this collection yet.
        </p>
      )}
    </div>
  );
}
