import {
  mapSearchCollection,
  mapSearchItem,
  type MappedSearchCollection,
  type MappedSearchItem,
} from "@/lib/search/map-search-result";
import { db } from "@/prisma/db";

export type SearchItem = MappedSearchItem;
export type SearchCollection = MappedSearchCollection;

export interface SearchIndex {
  items: SearchItem[];
  collections: SearchCollection[];
}

export async function getSearchItems(userId: string): Promise<SearchItem[]> {
  const rows = await db.orm.public.Item.where({ userId })
    .orderBy((item) => item.updatedAt.desc())
    .select("id", "title", "content", "description", "url", "fileName")
    .include("itemType", (itemType) => itemType.select("name", "color"))
    .all();

  return rows.map(mapSearchItem);
}

export async function getSearchCollections(
  userId: string,
): Promise<SearchCollection[]> {
  const rows = await db.orm.public.Collection.where({ userId })
    .orderBy((collection) => collection.updatedAt.desc())
    .select("id", "name")
    .include("itemCollections", (links) => links.select("itemId"))
    .all();

  return rows.map(mapSearchCollection);
}

export async function getSearchIndex(userId: string): Promise<SearchIndex> {
  const [items, collections] = await Promise.all([
    getSearchItems(userId),
    getSearchCollections(userId),
  ]);
  return { items, collections };
}
