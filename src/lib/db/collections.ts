import type { CreateCollectionData } from "@/lib/collections/create-collection-input";
import type { DashboardItem } from "@/lib/db/items";
import { db } from "@/prisma/db";

const RECENT_COLLECTION_LIMIT = 6;

const ITEM_TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
] as const;

export interface CollectionTypeSummary {
  name: string;
  color: string;
}

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  updatedAt: string;
  itemCount: number;
  borderColor: string | null;
  types: CollectionTypeSummary[];
}

export interface CollectionStats {
  total: number;
  favorites: number;
}

export interface SidebarCollection {
  id: string;
  name: string;
}

export interface CollectionOption {
  id: string;
  name: string;
}

export interface SidebarRecentCollection extends SidebarCollection {
  accentColor: string | null;
}

export interface SidebarCollections {
  favorites: SidebarCollection[];
  recent: SidebarRecentCollection[];
}

export interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  updatedAt: string;
  borderColor: string | null;
  types: CollectionTypeSummary[];
  items: DashboardItem[];
}

const SIDEBAR_RECENT_LIMIT = 4;

function typeRank(name: string): number {
  const index = ITEM_TYPE_ORDER.indexOf(name as (typeof ITEM_TYPE_ORDER)[number]);
  return index === -1 ? ITEM_TYPE_ORDER.length : index;
}

/** Most-used item type first. Ties follow the system type order. */
export function summarizeCollectionTypes(
  types: CollectionTypeSummary[]
): { borderColor: string | null; types: CollectionTypeSummary[] } {
  const counts = new Map<string, CollectionTypeSummary & { count: number }>();

  for (const type of types) {
    const existing = counts.get(type.name);
    if (existing) {
      existing.count += 1;
      continue;
    }
    counts.set(type.name, { name: type.name, color: type.color, count: 1 });
  }

  const ranked = [...counts.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return typeRank(a.name) - typeRank(b.name);
  });

  return {
    borderColor: ranked[0]?.color ?? null,
    types: ranked.map(({ name, color }) => ({ name, color })),
  };
}

function toIsoTimestamp(value: string): string {
  if (value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value)) return value;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return `${normalized}Z`;
}

function collectionTypeSummaries(
  itemCollections: {
    item: { itemType: { name: string; color: string } | null } | null;
  }[],
): CollectionTypeSummary[] {
  return itemCollections.flatMap((link) => {
    const itemType = link.item?.itemType;
    if (!itemType) return [];
    return [{ name: itemType.name, color: itemType.color }];
  });
}

function toDashboardCollection(row: {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  updatedAt: string;
  itemCollections: {
    item: { itemType: { name: string; color: string } | null } | null;
  }[];
}): DashboardCollection {
  const summary = summarizeCollectionTypes(
    collectionTypeSummaries(row.itemCollections),
  );

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isFavorite: row.isFavorite,
    updatedAt: toIsoTimestamp(row.updatedAt),
    itemCount: row.itemCollections.length,
    borderColor: summary.borderColor,
    types: summary.types,
  };
}

async function listCollections(
  userId: string,
  limit?: number,
): Promise<DashboardCollection[]> {
  let query = db.orm.public.Collection.where({ userId })
    .orderBy((collection) => collection.updatedAt.desc())
    .include("itemCollections", (links) =>
      links.include("item", (item) =>
        item
          .select("id")
          .include("itemType", (itemType) => itemType.select("name", "color")),
      ),
    );

  if (limit !== undefined) {
    query = query.limit(limit);
  }

  const rows = await query.all();
  return rows.map(toDashboardCollection);
}

export async function getRecentCollections(
  userId: string,
): Promise<DashboardCollection[]> {
  return listCollections(userId, RECENT_COLLECTION_LIMIT);
}

export async function getAllCollections(
  userId: string,
): Promise<DashboardCollection[]> {
  return listCollections(userId);
}

export async function getCollectionOptions(
  userId: string,
): Promise<CollectionOption[]> {
  const rows = await db.orm.public.Collection.where({ userId })
    .orderBy((collection) => collection.name.asc())
    .select("id", "name")
    .all();

  return rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function getCollectionById(
  userId: string,
  id: string,
): Promise<CollectionDetail | null> {
  const row = await db.orm.public.Collection.where({ id, userId })
    .include("itemCollections", (links) =>
      links.include("item", (item) =>
        item
          .include("itemType", (itemType) => itemType.select("name", "color"))
          .include("itemTags", (tags) =>
            tags.include("tag", (tag) => tag.select("name")),
          ),
      ),
    )
    .first();

  if (!row) return null;

  const types = collectionTypeSummaries(row.itemCollections);
  const summary = summarizeCollectionTypes(types);

  const items: DashboardItem[] = row.itemCollections
    .flatMap((link) => {
      const item = link.item;
      if (!item) return [];
      return [
        {
          id: item.id,
          title: item.title,
          description: item.description,
          isFavorite: item.isFavorite,
          isPinned: item.isPinned,
          fileUrl: item.fileUrl,
          fileName: item.fileName,
          fileSize: item.fileSize,
          createdAt: toIsoTimestamp(item.createdAt),
          updatedAt: toIsoTimestamp(item.updatedAt),
          typeName: item.itemType?.name ?? "item",
          typeColor: item.itemType?.color ?? "#6b7280",
          tags: item.itemTags.flatMap((tagLink) =>
            tagLink.tag?.name ? [tagLink.tag.name] : [],
          ),
        },
      ];
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isFavorite: row.isFavorite,
    updatedAt: toIsoTimestamp(row.updatedAt),
    borderColor: summary.borderColor,
    types: summary.types,
    items,
  };
}

export async function getSidebarCollections(
  userId: string,
): Promise<SidebarCollections> {
  const [favoriteRows, recentRows] = await Promise.all([
    db.orm.public.Collection.where({ userId, isFavorite: true })
      .orderBy((collection) => collection.updatedAt.desc())
      .select("id", "name")
      .all(),
    db.orm.public.Collection.where({ userId, isFavorite: false })
      .orderBy((collection) => collection.updatedAt.desc())
      .limit(SIDEBAR_RECENT_LIMIT)
      .include("itemCollections", (links) =>
        links.include("item", (item) =>
          item
            .select("id")
            .include("itemType", (itemType) => itemType.select("name", "color"))
        )
      )
      .all(),
  ]);

  return {
    favorites: favoriteRows.map((row) => ({ id: row.id, name: row.name })),
    recent: recentRows.map((row) => ({
      id: row.id,
      name: row.name,
      accentColor: summarizeCollectionTypes(
        row.itemCollections.flatMap((link) => {
          const itemType = link.item?.itemType;
          if (!itemType) return [];
          return [{ name: itemType.name, color: itemType.color }];
        })
      ).borderColor,
    })),
  };
}

export async function getCollectionStats(
  userId: string,
): Promise<CollectionStats> {
  const [{ total }, { total: favorites }] = await Promise.all([
    db.orm.public.Collection.where({ userId }).aggregate((agg) => ({
      total: agg.count(),
    })),
    db.orm.public.Collection.where({
      userId,
      isFavorite: true,
    }).aggregate((agg) => ({
      total: agg.count(),
    })),
  ]);

  return { total, favorites };
}

export async function createCollection(
  userId: string,
  data: CreateCollectionData,
): Promise<DashboardCollection> {
  const created = await db.orm.public.Collection.create({
    name: data.name,
    description: data.description,
    userId,
  });

  return {
    id: created.id,
    name: created.name,
    description: created.description,
    isFavorite: created.isFavorite,
    updatedAt: toIsoTimestamp(created.updatedAt),
    itemCount: 0,
    borderColor: null,
    types: [],
  };
}
