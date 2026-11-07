import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  buildObjectKey,
  validateUploadFile,
  type UploadKind,
} from "@/lib/items/file-upload";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { publicUrlForKey, uploadObject } from "@/lib/r2";

function isUploadKind(value: FormDataEntryValue | null): value is UploadKind {
  return value === "image" || value === "file";
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkRateLimit("upload", userId);
  if (!limit.success) return rateLimitResponse(limit);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const kindValue = formData.get("kind");
  if (!isUploadKind(kindValue)) {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }

  const fileValue = formData.get("file");
  if (!(fileValue instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload" }, { status: 400 });
  }

  const validation = validateUploadFile({
    kind: kindValue,
    fileName: fileValue.name,
    mimeType: fileValue.type,
    size: fileValue.size,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const key = buildObjectKey(userId, fileValue.name);
    const body = Buffer.from(await fileValue.arrayBuffer());
    await uploadObject({
      key,
      body,
      contentType: validation.contentType,
    });

    return NextResponse.json({
      fileUrl: publicUrlForKey(key),
      fileName: fileValue.name,
      fileSize: fileValue.size,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Couldn't upload this file" }, { status: 500 });
  }
}
