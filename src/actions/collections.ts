"use server";

import { auth } from "@/auth";
import {
  createCollection as insertCollection,
  type DashboardCollection,
} from "@/lib/db/collections";
import { createCollectionSchema } from "@/lib/collections/create-collection-input";

export interface CreateCollectionResult {
  success: boolean;
  data: DashboardCollection | null;
  error: string | null;
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
