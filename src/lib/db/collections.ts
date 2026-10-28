import { connection } from "next/server";
import { cache } from "react";

import { db } from "@/prisma/db";

/** Stand-in until authentication selects the signed-in user. */
const DEMO_USER_EMAIL = "demo@devstash.io";

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

const getDemoUserId = cache(async (): Promise<string | null> => {
  await connection();

  const user = await db.orm.public.User.where({ email: DEMO_USER_EMAIL })
    .select("id")
    .first();

  return user?.id ?? null;
});

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

export async function getRecentCollections(): Promise<DashboardCollection[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const rows = await db.orm.public.Collection.where({ userId })
    .orderBy((collection) => collection.updatedAt.desc())
    .limit(RECENT_COLLECTION_LIMIT)
    .include("itemCollections", (links) =>
      links.include("item", (item) =>
        item
          .select("id")
          .include("itemType", (itemType) => itemType.select("name", "color"))
      )
    )
    .all();

  return rows.map((row) => {
    const types = row.itemCollections.flatMap((link) => {
      const itemType = link.item?.itemType;
      if (!itemType) return [];
      return [{ name: itemType.name, color: itemType.color }];
    });
    const summary = summarizeCollectionTypes(types);

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
  });
}

export async function getCollectionStats(): Promise<CollectionStats> {
  const userId = await getDemoUserId();
  if (!userId) return { total: 0, favorites: 0 };

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
