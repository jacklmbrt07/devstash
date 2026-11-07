import {
  getSidebarCollections,
  type SidebarCollections,
} from "@/lib/db/collections";
import { getSidebarItemTypes, type SidebarItemType } from "@/lib/db/items";
import { getSearchIndex, type SearchIndex } from "@/lib/db/search";

export interface DashboardShellData {
  itemTypes: SidebarItemType[];
  collections: SidebarCollections;
  searchIndex: SearchIndex;
}

/** Prefetch chrome data shared by every authenticated dashboard page. */
export async function getDashboardShellData(
  userId: string,
): Promise<DashboardShellData> {
  const [itemTypes, collections, searchIndex] = await Promise.all([
    getSidebarItemTypes(),
    getSidebarCollections(userId),
    getSearchIndex(userId),
  ]);

  return { itemTypes, collections, searchIndex };
}
