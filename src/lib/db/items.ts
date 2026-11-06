import { connection } from "next/server";
import { cache } from "react";

import type { UpdateItemData } from "@/lib/items/update-item-input";
import { db } from "@/prisma/db";

/** Stand-in until authentication selects the signed-in user. */
const DEMO_USER_EMAIL = "demo@devstash.io";

const RECENT_ITEM_LIMIT = 10;

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: string;
  typeName: string;
  typeColor: string;
  tags: string[];
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  contentType: "TEXT" | "FILE" | "URL";
  url: string | null;
  fileName: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  typeName: string;
  typeColor: string;
  tags: string[];
  collections: { id: string; name: string }[];
}

export interface ItemStats {
  total: number;
  favorites: number;
}

export interface SidebarItemType {
  id: string;
  name: string;
  color: string;
  count: number;
}

const SIDEBAR_TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
] as const;

const getDemoUserId = cache(async (): Promise<string | null> => {
  await connection();

  const user = await db.orm.public.User.where({ email: DEMO_USER_EMAIL })
    .select("id")
    .first();

  return user?.id ?? null;
});

function sidebarTypeRank(name: string): number {
  const index = SIDEBAR_TYPE_ORDER.indexOf(
    name as (typeof SIDEBAR_TYPE_ORDER)[number]
  );
  return index === -1 ? SIDEBAR_TYPE_ORDER.length : index;
}

function toIsoTimestamp(value: string): string {
  if (value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value)) return value;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return `${normalized}Z`;
}

interface ItemRow {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: string;
  itemType: { name: string; color: string } | null;
  itemTags: { tag: { name: string } | null }[];
}

function toDashboardItem(row: ItemRow): DashboardItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    isFavorite: row.isFavorite,
    isPinned: row.isPinned,
    updatedAt: toIsoTimestamp(row.updatedAt),
    typeName: row.itemType?.name ?? "item",
    typeColor: row.itemType?.color ?? "#6b7280",
    tags: row.itemTags.flatMap((link) => (link.tag?.name ? [link.tag.name] : [])),
  };
}

function itemQuery(userId: string, pinnedOnly: boolean) {
  const where = pinnedOnly ? { userId, isPinned: true } : { userId };

  return db.orm.public.Item.where(where)
    .orderBy((item) => item.updatedAt.desc())
    .include("itemType", (itemType) => itemType.select("name", "color"))
    .include("itemTags", (links) =>
      links.include("tag", (tag) => tag.select("name"))
    );
}

export async function getPinnedItems(): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const rows = await itemQuery(userId, true).all();
  return rows.map(toDashboardItem);
}

export async function getRecentItems(): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const rows = await itemQuery(userId, false).limit(RECENT_ITEM_LIMIT).all();
  return rows.map(toDashboardItem);
}

function readContentType(value: string): ItemDetail["contentType"] {
  if (value === "FILE" || value === "URL") return value;
  return "TEXT";
}

async function findItemDetail(
  userId: string,
  id: string,
): Promise<ItemDetail | null> {
  const row = await db.orm.public.Item.where({ id, userId })
    .include("itemType", (itemType) => itemType.select("name", "color"))
    .include("itemTags", (links) =>
      links.include("tag", (tag) => tag.select("name"))
    )
    .include("itemCollections", (links) =>
      links.include("collection", (collection) =>
        collection.select("id", "name")
      )
    )
    .first();

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content,
    contentType: readContentType(row.contentType),
    url: row.url,
    fileName: row.fileName,
    language: row.language,
    isFavorite: row.isFavorite,
    isPinned: row.isPinned,
    createdAt: toIsoTimestamp(row.createdAt),
    updatedAt: toIsoTimestamp(row.updatedAt),
    typeName: row.itemType?.name ?? "item",
    typeColor: row.itemType?.color ?? "#6b7280",
    tags: row.itemTags.flatMap((link) => (link.tag?.name ? [link.tag.name] : [])),
    collections: row.itemCollections.flatMap((link) =>
      link.collection
        ? [{ id: link.collection.id, name: link.collection.name }]
        : []
    ),
  };
}

export async function getItemById(id: string): Promise<ItemDetail | null> {
  const userId = await getDemoUserId();
  if (!userId) return null;
  return findItemDetail(userId, id);
}

async function findOrCreateTag(name: string): Promise<{ id: string }> {
  const existing = await db.orm.public.Tag.where({ name }).select("id").first();
  if (existing) return existing;

  const created = await db.orm.public.Tag.create({ name });
  return { id: created.id };
}

async function replaceItemTags(itemId: string, names: string[]) {
  await db.orm.public.ItemTag.where({ a: itemId }).deleteAll();

  for (const name of names) {
    const tag = await findOrCreateTag(name);
    await db.orm.public.ItemTag.create({ a: itemId, b: tag.id });
  }
}

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemData,
): Promise<ItemDetail | null> {
  const updated = await db.orm.public.Item.where({
    id: itemId,
    userId,
  }).update({
    title: data.title,
    description: data.description,
    content: data.content,
    url: data.url,
    language: data.language,
  });
  if (!updated) return null;

  await replaceItemTags(itemId, data.tags);
  return findItemDetail(userId, itemId);
}

export async function getItemsByType(typeName: string): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const itemType = await db.orm.public.ItemType.where({
    name: typeName,
    isSystem: true,
  })
    .select("id")
    .first();
  if (!itemType) return [];

  const rows = await db.orm.public.Item.where({
    userId,
    itemTypeId: itemType.id,
  })
    .orderBy((item) => item.updatedAt.desc())
    .include("itemType", (type) => type.select("name", "color"))
    .include("itemTags", (links) =>
      links.include("tag", (tag) => tag.select("name"))
    )
    .all();

  return rows.map(toDashboardItem);
}

export async function getSidebarItemTypes(): Promise<SidebarItemType[]> {
  const userId = await getDemoUserId();

  const types = await db.orm.public.ItemType.where({ isSystem: true })
    .select("id", "name", "color")
    .all();

  const counts = userId
    ? await db.orm.public.Item.where({ userId })
        .groupBy("itemTypeId")
        .aggregate((agg) => ({ total: agg.count() }))
    : [];

  const countByTypeId = new Map(
    counts.map((row) => [row.itemTypeId, row.total])
  );

  return types
    .map((type) => ({
      id: type.id,
      name: type.name,
      color: type.color,
      count: countByTypeId.get(type.id) ?? 0,
    }))
    .sort((a, b) => sidebarTypeRank(a.name) - sidebarTypeRank(b.name));
}

export async function getItemStats(): Promise<ItemStats> {
  const userId = await getDemoUserId();
  if (!userId) return { total: 0, favorites: 0 };

  const [{ total }, { total: favorites }] = await Promise.all([
    db.orm.public.Item.where({ userId }).aggregate((agg) => ({
      total: agg.count(),
    })),
    db.orm.public.Item.where({ userId, isFavorite: true }).aggregate((agg) => ({
      total: agg.count(),
    })),
  ]);

  return { total, favorites };
}
