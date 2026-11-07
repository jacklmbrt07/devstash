export type UploadKind = "image" | "file";

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const FILE_MAX_BYTES = 10 * 1024 * 1024;

export const IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
] as const;

export const FILE_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".xml",
  ".csv",
  ".toml",
  ".ini",
] as const;

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

export const FILE_MIME_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
] as const;

const IMAGE_MIME_SET = new Set<string>(IMAGE_MIME_TYPES);
const FILE_MIME_SET = new Set<string>(FILE_MIME_TYPES);

const EXTENSION_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".yaml": "application/x-yaml",
  ".yml": "text/yaml",
  ".xml": "application/xml",
  ".csv": "text/csv",
  ".toml": "application/toml",
  ".ini": "text/plain",
};

export function fileExtension(fileName: string): string {
  const match = /\.[^.]+$/.exec(fileName.trim().toLowerCase());
  return match?.[0] ?? "";
}

export function acceptAttribute(kind: UploadKind): string {
  const extensions =
    kind === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  return [...extensions].join(",");
}

export function maxBytesForKind(kind: UploadKind): number {
  return kind === "image" ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;
}

export function isAllowedExtension(kind: UploadKind, fileName: string): boolean {
  const extension = fileExtension(fileName);
  const allowed =
    kind === "image" ? IMAGE_EXTENSIONS : FILE_EXTENSIONS;
  return (allowed as readonly string[]).includes(extension);
}

export function resolveContentType(
  kind: UploadKind,
  fileName: string,
  mimeType: string,
): string | null {
  const normalized = mimeType.trim().toLowerCase();
  const extension = fileExtension(fileName);
  const expected = EXTENSION_MIME[extension];

  if (!expected) return null;

  if (kind === "image") {
    if (IMAGE_MIME_SET.has(normalized) && normalized === expected) {
      return normalized;
    }
    // Some browsers omit or misreport SVG/JPEG types.
    if (IMAGE_MIME_SET.has(expected) && (normalized === "" || normalized === "application/octet-stream")) {
      return expected;
    }
    if (normalized === "image/jpg" && expected === "image/jpeg") {
      return "image/jpeg";
    }
    return IMAGE_MIME_SET.has(normalized) && expected.startsWith("image/")
      ? expected
      : null;
  }

  if (FILE_MIME_SET.has(normalized)) {
    if (normalized === expected) return normalized;
    if (
      (normalized === "text/yaml" || normalized === "application/x-yaml") &&
      (expected === "text/yaml" || expected === "application/x-yaml")
    ) {
      return normalized;
    }
    if (
      (normalized === "text/xml" || normalized === "application/xml") &&
      (expected === "text/xml" || expected === "application/xml")
    ) {
      return normalized;
    }
  }

  if (normalized === "" || normalized === "application/octet-stream") {
    return expected;
  }

  return null;
}

export function validateUploadFile(input: {
  kind: UploadKind;
  fileName: string;
  mimeType: string;
  size: number;
}): { ok: true; contentType: string } | { ok: false; error: string } {
  const { kind, fileName, mimeType, size } = input;

  if (!fileName.trim()) {
    return { ok: false, error: "Choose a file to upload" };
  }

  if (!isAllowedExtension(kind, fileName)) {
    return {
      ok: false,
      error:
        kind === "image"
          ? "Use a PNG, JPG, GIF, WebP, or SVG image"
          : "That file type isn't supported",
    };
  }

  const maxBytes = maxBytesForKind(kind);
  if (size <= 0) {
    return { ok: false, error: "The file is empty" };
  }
  if (size > maxBytes) {
    return {
      ok: false,
      error:
        kind === "image"
          ? "Images must be 5 MB or smaller"
          : "Files must be 10 MB or smaller",
    };
  }

  const contentType = resolveContentType(kind, fileName, mimeType);
  if (!contentType) {
    return { ok: false, error: "That file type isn't supported" };
  }

  return { ok: true, contentType };
}

export function sanitizeFileName(fileName: string): string {
  const base = fileName.trim().replace(/[/\\]/g, "_");
  const cleaned = base.replace(/[^\w.\- ()[\]]+/g, "_").replace(/_+/g, "_");
  return cleaned.slice(0, 120) || "upload";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildObjectKey(userId: string, fileName: string): string {
  return `${userId}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}
