import { FileItemRow } from "@/components/items/file-item-row";
import { ImageThumbnailCard } from "@/components/items/image-thumbnail-card";
import { ItemCard } from "@/components/items/item-card";
import { Pagination } from "@/components/ui/pagination";
import { getItemTypeHref, getItemTypeLabel } from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";

export function ItemListView({
  typeName,
  items,
  total,
  page,
  totalPages,
}: {
  typeName: string;
  items: DashboardItem[];
  total: number;
  page: number;
  totalPages: number;
}) {
  const label = getItemTypeLabel(typeName);
  const countLabel = total === 1 ? "item" : "items";
  const useFileList = typeName === "file";
  const useImageGallery = typeName === "image";
  const pathname = getItemTypeHref(typeName);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="tabular-nums">{total}</span> {countLabel}
        </p>
      </div>
      {items.length > 0 ? (
        useFileList ? (
          <div className="divide-y divide-border rounded-xl border border-border">
            {items.map((item) => (
              <FileItemRow key={item.id} item={item} />
            ))}
          </div>
        ) : useImageGallery ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ImageThumbnailCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          No {label.toLowerCase()} yet.
        </p>
      )}
      <Pagination pathname={pathname} page={page} totalPages={totalPages} />
    </div>
  );
}
