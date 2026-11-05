import { connection } from "next/server";

import { db } from "@/prisma/db";

const ITEM_TYPE_ORDER = [
  "snippet",
  "prompt",
  "note",
  "command",
  "link",
  "file",
  "image",
] as const;

export interface ProfileItemTypeCount {
  name: string;
  color: string;
  count: number;
}

export interface Profile {
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  canChangePassword: boolean;
  itemCount: number;
  collectionCount: number;
  itemTypes: ProfileItemTypeCount[];
}

function typeRank(name: string): number {
  const index = ITEM_TYPE_ORDER.indexOf(
    name as (typeof ITEM_TYPE_ORDER)[number],
  );
  return index === -1 ? ITEM_TYPE_ORDER.length : index;
}

function toIsoTimestamp(value: string): string {
  if (value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value)) return value;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return `${normalized}Z`;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  await connection();

  const [user, types, itemCounts, itemStats, collectionStats] =
    await Promise.all([
      db.orm.public.User.where({ id: userId })
        .select("name", "email", "image", "password", "createdAt")
        .first(),
      db.orm.public.ItemType.where({ isSystem: true })
        .select("id", "name", "color")
        .all(),
      db.orm.public.Item.where({ userId })
        .groupBy("itemTypeId")
        .aggregate((agg) => ({ total: agg.count() })),
      db.orm.public.Item.where({ userId }).aggregate((agg) => ({
        total: agg.count(),
      })),
      db.orm.public.Collection.where({ userId }).aggregate((agg) => ({
        total: agg.count(),
      })),
    ]);

  if (!user) return null;

  const countByTypeId = new Map(
    itemCounts.map((row) => [row.itemTypeId, row.total]),
  );

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: toIsoTimestamp(user.createdAt),
    canChangePassword: Boolean(user.password),
    itemCount: itemStats.total,
    collectionCount: collectionStats.total,
    itemTypes: types
      .map((type) => ({
        name: type.name,
        color: type.color,
        count: countByTypeId.get(type.id) ?? 0,
      }))
      .sort((a, b) => typeRank(a.name) - typeRank(b.name)),
  };
}
