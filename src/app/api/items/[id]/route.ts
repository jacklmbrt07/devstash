import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";

const ITEM_ID = /^[a-z0-9]+$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ITEM_ID.test(id) || id.length > 64) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const item = await getItemById(id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error("Item detail request failed:", error);
    return NextResponse.json({ error: "Couldn't load item" }, { status: 500 });
  }
}
