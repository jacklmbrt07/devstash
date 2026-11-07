import Link from "next/link";
import { Star } from "lucide-react";

import { CollectionCardMenu } from "@/components/collections/collection-card-menu";
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
import type { DashboardCollection } from "@/lib/db/collections";
import { formatRelativeTime } from "@/lib/format-relative-time";

export function CollectionCard({
  collection,
}: {
  collection: DashboardCollection;
}) {
  const itemCount = collection.itemCount;

  return (
    <div className="group relative">
      <Link href={`/collections/${collection.id}`} className="block">
        <Card
          className={`h-full border-l-[3px] transition-colors hover:bg-accent/40${collection.borderColor ? "" : " border-transparent"}`}
          style={
            collection.borderColor
              ? { borderLeftColor: collection.borderColor }
              : undefined
          }
        >
          <CardHeader className="pr-10">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="group-hover:text-foreground">
                {collection.name}
              </CardTitle>
              {collection.isFavorite ? (
                <Star
                  className="size-4 shrink-0 fill-current text-[#fde047]"
                  aria-label="Favorite"
                />
              ) : null}
            </div>
            {collection.description ? (
              <CardDescription className="line-clamp-2">
                {collection.description}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="tabular-nums">{itemCount}</span>{" "}
              {itemCount === 1 ? "item" : "items"} · Updated{" "}
              {formatRelativeTime(collection.updatedAt, new Date())}
            </p>
            {collection.types.length > 0 ? (
              <div className="mt-3 flex items-center gap-2">
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
          </CardContent>
        </Card>
      </Link>
      <div className="absolute top-3 right-3 z-10">
        <CollectionCardMenu
          collectionId={collection.id}
          name={collection.name}
          description={collection.description}
          isFavorite={collection.isFavorite}
        />
      </div>
    </div>
  );
}
