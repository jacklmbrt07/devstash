"use server";

import { auth } from "@/auth";
import {
  deleteItem as removeItem,
  updateItem as saveItem,
  type ItemDetail,
} from "@/lib/db/items";
import { updateItemSchema } from "@/lib/items/update-item-input";

export interface UpdateItemResult {
  success: boolean;
  data: ItemDetail | null;
  error: string | null;
}

export interface DeleteItemResult {
  success: boolean;
  data: { id: string } | null;
  error: string | null;
}

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      data: null,
      error: "Sign in to delete this item",
    };
  }

  if (typeof itemId !== "string" || itemId.trim() === "") {
    return { success: false, data: null, error: "Item not found" };
  }

  try {
    const deleted = await removeItem(userId, itemId);
    if (!deleted) {
      return { success: false, data: null, error: "Item not found" };
    }
    return { success: true, data: deleted, error: null };
  } catch (error) {
    console.error("Item delete failed:", error);
    return { success: false, data: null, error: "Couldn't delete this item" };
  }
}

export async function updateItem(
  itemId: string,
  data: unknown,
): Promise<UpdateItemResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      data: null,
      error: "Sign in to edit this item",
    };
  }

  if (typeof itemId !== "string" || itemId.trim() === "") {
    return { success: false, data: null, error: "Item not found" };
  }

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Check the item fields and try again",
    };
  }

  try {
    const item = await saveItem(userId, itemId, parsed.data);
    if (!item) {
      return { success: false, data: null, error: "Item not found" };
    }
    return { success: true, data: item, error: null };
  } catch (error) {
    console.error("Item update failed:", error);
    return { success: false, data: null, error: "Couldn't save this item" };
  }
}
