import Link from "next/link";
import {
  Folder,
  FolderHeart,
  Layers,
  Pin,
  Star,
  type LucideIcon,
} from "lucide-react";

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
import { formatRelativeTime } from "@/lib/format-relative-time";
import {
  collections,
  currentUser,
  items,
  itemTypes,
  type Collection,
  type Item,
  type ItemType,
} from "@/lib/mock-data";

/** Newest mock timestamp — keeps relative labels stable during static prerender. */
const MOCK_NOW = new Date(
  Math.max(
    ...items.map((item) => new Date(item.updatedAt).getTime()),
    ...collections.map((collection) => new Date(collection.updatedAt).getTime())
  )
);

interface StatCard {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
}

function getFirstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

function getItemType(itemTypeId: string): ItemType | undefined {
  return itemTypes.find((type) => type.id === itemTypeId);
}

function getCollectionItemCount(collectionId: string): number {
  return items.filter((item) => item.collectionIds.includes(collectionId))
    .length;
}

function getRecentCollections(): Collection[] {
  return [...collections]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 4);
}

function getPinnedItems(): Item[] {
  return items.filter((item) => item.isPinned);
}

function getRecentItems(): Item[] {
  return [...items]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 10);
}

function getStats(): StatCard[] {
  const favoriteItems = items.filter((item) => item.isFavorite).length;
  const favoriteCollections = collections.filter(
    (collection) => collection.isFavorite
  ).length;

  return [
    {
      label: "Items",
      value: items.length,
      hint: "Across all types",
      icon: Layers,
    },
    {
      label: "Collections",
      value: collections.length,
      hint: "Organized groups",
      icon: Folder,
    },
    {
      label: "Favorite items",
      value: favoriteItems,
      hint: "Starred for quick access",
      icon: Star,
    },
    {
      label: "Favorite collections",
      value: favoriteCollections,
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

function CollectionCard({ collection }: { collection: Collection }) {
  const itemCount = getCollectionItemCount(collection.id);

  return (
    <Link href={`/collections/${collection.id}`} className="group block">
      <Card className="h-full transition-colors hover:bg-accent/40">
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
          <CardDescription className="line-clamp-2">
            {collection.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            <span className="tabular-nums">{itemCount}</span>{" "}
            {itemCount === 1 ? "item" : "items"} · Updated{" "}
            {formatRelativeTime(collection.updatedAt, MOCK_NOW)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ItemRow({ item }: { item: Item }) {
  const type = getItemType(item.itemTypeId);
  const Icon = type ? ITEM_TYPE_ICONS[type.name] : undefined;
  const typeLabel = type ? getItemTypeLabel(type.name) : "Item";

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
        style={type ? { color: type.color } : undefined}
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
        <p className="truncate text-xs text-muted-foreground">
          {item.description}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-muted-foreground">{typeLabel}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(item.updatedAt, MOCK_NOW)}
        </p>
      </div>
    </div>
  );
}

function ItemList({ items: list }: { items: Item[] }) {
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

export function DashboardMain() {
  const stats = getStats();
  const recentCollections = getRecentCollections();
  const pinnedItems = getPinnedItems();
  const recentItems = getRecentItems();
  const firstName = getFirstName(currentUser.name);

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
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recentCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Pinned items" count={pinnedItems.length} />
        {pinnedItems.length > 0 ? (
          <ItemList items={pinnedItems} />
        ) : (
          <p className="text-sm text-muted-foreground">No pinned items yet.</p>
        )}
      </section>

      <section>
        <SectionHeading title="Recent items" count={recentItems.length} />
        <ItemList items={recentItems} />
      </section>
    </div>
  );
}
