"use client";

import { Pin, Star } from "lucide-react";

import { useItemDrawer } from "@/components/items/item-drawer";
import {
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-relative-time";

export function ItemRow({ item }: { item: DashboardItem }) {
  const { openItem } = useItemDrawer();
  const Icon = ITEM_TYPE_ICONS[item.typeName];
  const typeLabel = getItemTypeLabel(item.typeName);

  return (
    <button
      type="button"
      onClick={() => openItem(item.id)}
      className="flex w-full cursor-pointer items-center gap-3 border-l-[3px] px-3 py-2.5 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      style={{ borderLeftColor: item.typeColor }}
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
        style={{ color: item.typeColor }}
        title={typeLabel}
      >
        {Icon ? <Icon className="size-4" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{item.title}</p>
          {item.isPinned ? (
            <Pin className="size-3.5 shrink-0 text-muted-foreground" />
          ) : null}
          {item.isFavorite ? (
            <Star className="size-3.5 shrink-0 fill-current text-[#fde047]" />
          ) : null}
        </div>
        {item.description ? (
          <p className="truncate text-xs text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        {item.tags.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-muted-foreground">{typeLabel}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(item.updatedAt, new Date())}
        </p>
      </div>
    </button>
  );
}
