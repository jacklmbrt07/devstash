import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemForUser } from "@/lib/db/items";
import { getObject, objectKeyFromPublicUrl } from "@/lib/r2";

const ITEM_ID = /^[a-z0-9]+$/i;

function contentDisposition(fileName: string): string {
  const safe = fileName.replace(/"/g, "");
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename="${safe}"; filename*=UTF-8''${encoded}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ITEM_ID.test(id) || id.length > 64) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const item = await getItemForUser(userId, id);
    if (!item?.fileUrl || item.contentType !== "FILE") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const key = objectKeyFromPublicUrl(item.fileUrl);
    if (!key) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const object = await getObject(key);
    if (!object.body) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.contentType ?? "application/octet-stream",
    );
    headers.set(
      "Content-Disposition",
      contentDisposition(item.fileName ?? "download"),
    );
    if (object.contentLength != null) {
      headers.set("Content-Length", String(object.contentLength));
    }
    headers.set("Cache-Control", "private, no-store");

    return new NextResponse(object.body, { status: 200, headers });
  } catch (error) {
    console.error("Download failed:", error);
    return NextResponse.json({ error: "Couldn't download this file" }, { status: 500 });
  }
}
