import { fileExtension } from "@/lib/items/file-upload";

export type FileIconKind =
  | "image"
  | "pdf"
  | "json"
  | "spreadsheet"
  | "text"
  | "code"
  | "generic";

export function fileIconKind(fileName: string): FileIconKind {
  const extension = fileExtension(fileName);

  switch (extension) {
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
    case ".webp":
    case ".svg":
      return "image";
    case ".pdf":
      return "pdf";
    case ".json":
      return "json";
    case ".csv":
      return "spreadsheet";
    case ".md":
    case ".txt":
      return "text";
    case ".yaml":
    case ".yml":
    case ".xml":
    case ".toml":
    case ".ini":
      return "code";
    default:
      return "generic";
  }
}

export function displayFileName(
  fileName: string | null,
  title: string,
): string {
  const trimmed = fileName?.trim();
  return trimmed ? trimmed : title;
}
