import { ItemCard } from "@/components/items/item-card";
import { getItemTypeLabel } from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";

export function ItemListView({
  typeName,
  items,
}: {
  typeName: string;
  items: DashboardItem[];
}) {
  const label = getItemTypeLabel(typeName);
  const countLabel = items.length === 1 ? "item" : "items";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="tabular-nums">{items.length}</span> {countLabel}
        </p>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No {label.toLowerCase()} yet.
        </p>
      )}
    </div>
  );
}
