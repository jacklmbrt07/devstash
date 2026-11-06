import Link from "next/link";
import {
  Folder,
  FolderHeart,
  Layers,
  Star,
  type LucideIcon,
} from "lucide-react";

import { ItemRow } from "@/components/items/item-row";
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
import type {
  CollectionStats,
  DashboardCollection,
} from "@/lib/db/collections";
import type { DashboardItem, ItemStats } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-relative-time";

interface StatCard {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
}

function getFirstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

function getStats(
  collectionStats: CollectionStats,
  itemStats: ItemStats
): StatCard[] {
  return [
    {
      label: "Items",
      value: itemStats.total,
      hint: "Across all types",
      icon: Layers,
    },
    {
      label: "Collections",
      value: collectionStats.total,
      hint: "Organized groups",
      icon: Folder,
    },
    {
      label: "Favorite items",
      value: itemStats.favorites,
      hint: "Starred for quick access",
      icon: Star,
    },
    {
      label: "Favorite collections",
      value: collectionStats.favorites,
      hint: "Collections you reach for",
      icon: FolderHeart,
    },
  ];
}

function SectionHeading({
  title,
  count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h2 className="text-sm font-medium tracking-tight">{title}</h2>
      {typeof count === "number" ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function StatsRow({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} size="sm">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="mt-1 text-2xl tabular-nums">
                  {stat.value}
                </CardTitle>
              </div>
              <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CollectionCard({ collection }: { collection: DashboardCollection }) {
  const itemCount = collection.itemCount;

  return (
    <Link href={`/collections/${collection.id}`} className="group block">
      <Card
        className={`h-full border-l-[3px] transition-colors hover:bg-accent/40${collection.borderColor ? "" : " border-transparent"}`}
        style={
          collection.borderColor
            ? { borderLeftColor: collection.borderColor }
            : undefined
        }
      >
        <CardHeader>
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
  );
}

function ItemList({ items: list }: { items: DashboardItem[] }) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="divide-y divide-border">
        {list.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function DashboardMain({
  recentCollections,
  collectionStats,
  pinnedItems,
  recentItems,
  itemStats,
  userName,
}: {
  recentCollections: DashboardCollection[];
  collectionStats: CollectionStats;
  pinnedItems: DashboardItem[];
  recentItems: DashboardItem[];
  itemStats: ItemStats;
  userName: string;
}) {
  const stats = getStats(collectionStats, itemStats);
  const firstName = getFirstName(userName);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything you&apos;ve stashed, one keystroke away.
        </p>
      </div>

      <StatsRow stats={stats} />

      <section>
        <SectionHeading
          title="Recent collections"
          count={recentCollections.length}
        />
        {recentCollections.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recentCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        )}
      </section>

      {pinnedItems.length > 0 ? (
        <section>
          <SectionHeading title="Pinned items" count={pinnedItems.length} />
          <ItemList items={pinnedItems} />
        </section>
      ) : null}

      <section>
        <SectionHeading title="Recent items" count={recentItems.length} />
        {recentItems.length > 0 ? (
          <ItemList items={recentItems} />
        ) : (
          <p className="text-sm text-muted-foreground">No recent items yet.</p>
        )}
      </section>
    </div>
  );
}
