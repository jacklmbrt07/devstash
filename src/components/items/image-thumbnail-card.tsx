"use client";

import { ImageIcon } from "lucide-react";

import { useItemDrawer } from "@/components/items/item-drawer";
import type { DashboardItem } from "@/lib/db/items";
import { displayFileName } from "@/lib/items/file-display";

export function ImageThumbnailCard({ item }: { item: DashboardItem }) {
  const { openItem } = useItemDrawer();
  const label = displayFileName(item.fileName, item.title);

  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className="group block w-full cursor-pointer rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
        <div className="aspect-video overflow-hidden">
          {item.fileUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote R2 preview; next/image not configured for R2
            <img
              src={item.fileUrl}
              alt={label}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-8" aria-hidden />
              <span className="sr-only">{label}</span>
            </div>
          )}
        </div>
        <p className="truncate px-3 py-2 text-sm font-medium">{label}</p>
      </div>
    </button>
  );
}
