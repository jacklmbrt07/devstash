"use server";

import { auth } from "@/auth";
import {
  createCollection as insertCollection,
  deleteCollection as removeCollection,
  getCollectionOptions,
  updateCollection as saveCollection,
  type CollectionOption,
  type DashboardCollection,
} from "@/lib/db/collections";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/collections/create-collection-input";

export interface CreateCollectionResult {
  success: boolean;
  data: DashboardCollection | null;
  error: string | null;
}

export interface UpdateCollectionResult {
  success: boolean;
  data: DashboardCollection | null;
  error: string | null;
}

export interface DeleteCollectionResult {
  success: boolean;
  data: { id: string } | null;
  error: string | null;
}

export interface ListCollectionOptionsResult {
  success: boolean;
  data: CollectionOption[];
  error: string | null;
}

export async function listCollectionOptions(): Promise<ListCollectionOptionsResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      data: [],
      error: "Sign in to load collections",
    };
  }

  try {
    const options = await getCollectionOptions(userId);
    return { success: true, data: options, error: null };
  } catch (error) {
    console.error("Collection options failed:", error);
    return {
      success: false,
      data: [],
      error: "Couldn't load collections",
    };
  }
}

export async function createCollection(
  data: unknown,
): Promise<CreateCollectionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      data: null,
      error: "Sign in to create a collection",
    };
  }

  const parsed = createCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error:
        parsed.error.issues[0]?.message ??
        "Check the collection fields and try again",
    };
  }

  try {
    const collection = await insertCollection(userId, parsed.data);
    return { success: true, data: collection, error: null };
  } catch (error) {
    console.error("Collection create failed:", error);
    return {
      success: false,
      data: null,
      error: "Couldn't create this collection",
    };
  }
}

export async function updateCollection(
  collectionId: string,
  data: unknown,
): Promise<UpdateCollectionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      data: null,
      error: "Sign in to edit this collection",
    };
  }

  if (typeof collectionId !== "string" || collectionId.trim() === "") {
    return { success: false, data: null, error: "Collection not found" };
  }

  const parsed = updateCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error:
        parsed.error.issues[0]?.message ??
        "Check the collection fields and try again",
    };
  }

  try {
    const collection = await saveCollection(userId, collectionId, parsed.data);
    if (!collection) {
      return { success: false, data: null, error: "Collection not found" };
    }
    return { success: true, data: collection, error: null };
  } catch (error) {
    console.error("Collection update failed:", error);
    return {
      success: false,
      data: null,
      error: "Couldn't update this collection",
    };
  }
}

export async function deleteCollection(
  collectionId: string,
): Promise<DeleteCollectionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      data: null,
      error: "Sign in to delete this collection",
    };
  }

  if (typeof collectionId !== "string" || collectionId.trim() === "") {
    return { success: false, data: null, error: "Collection not found" };
  }

  try {
    const deleted = await removeCollection(userId, collectionId);
    if (!deleted) {
      return { success: false, data: null, error: "Collection not found" };
    }
    return { success: true, data: deleted, error: null };
  } catch (error) {
    console.error("Collection delete failed:", error);
    return {
      success: false,
      data: null,
      error: "Couldn't delete this collection",
    };
  }
}
