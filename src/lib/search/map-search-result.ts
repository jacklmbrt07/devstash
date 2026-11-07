import { contentPreview } from "@/lib/search/content-preview";

export interface SearchItemRow {
  id: string;
  title: string;
  content: string | null;
  description: string | null;
  url: string | null;
  fileName: string | null;
  itemType: { name: string; color: string } | null;
}

export interface SearchCollectionRow {
  id: string;
  name: string;
  itemCollections: unknown[];
}

export interface MappedSearchItem {
  id: string;
  title: string;
  typeName: string;
  typeColor: string;
  contentPreview: string | null;
}

export interface MappedSearchCollection {
  id: string;
  name: string;
  itemCount: number;
}

/** Prefer content, then description, file name, then URL for the preview. */
export function searchPreviewSource(row: {
  content: string | null;
  description: string | null;
  fileName: string | null;
  url: string | null;
}): string | null {
  return row.content ?? row.description ?? row.fileName ?? row.url;
}

export function mapSearchItem(row: SearchItemRow): MappedSearchItem {
  return {
    id: row.id,
    title: row.title,
    typeName: row.itemType?.name ?? "item",
    typeColor: row.itemType?.color ?? "#6b7280",
    contentPreview: contentPreview(searchPreviewSource(row)),
  };
}

export function mapSearchCollection(
  row: SearchCollectionRow,
): MappedSearchCollection {
  return {
    id: row.id,
    name: row.name,
    itemCount: row.itemCollections.length,
  };
}
