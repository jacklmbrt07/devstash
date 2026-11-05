import { Pin, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-relative-time";

export function ItemCard({ item }: { item: DashboardItem }) {
  const Icon = ITEM_TYPE_ICONS[item.typeName];
  const typeLabel = getItemTypeLabel(item.typeName);

  return (
    <Card
      className="h-full border-l-[3px]"
      style={{ borderLeftColor: item.typeColor }}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
              style={{ color: item.typeColor }}
              title={typeLabel}
            >
              {Icon ? (
                <Icon className="size-4" aria-label={typeLabel} />
              ) : null}
            </span>
            <CardTitle className="truncate">{item.title}</CardTitle>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {item.isPinned ? (
              <Pin
                className="size-3.5 text-muted-foreground"
                aria-label="Pinned"
              />
            ) : null}
            {item.isFavorite ? (
              <Star
                className="size-3.5 fill-current text-[#fde047]"
                aria-label="Favorite"
              />
            ) : null}
          </div>
        </div>
        {item.description ? (
          <CardDescription className="line-clamp-2">
            {item.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {item.tags.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5">
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
        <p className="text-xs text-muted-foreground">
          {typeLabel} · Updated {formatRelativeTime(item.updatedAt, new Date())}
        </p>
      </CardContent>
    </Card>
  );
}
