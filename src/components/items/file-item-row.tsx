"use client";

import {
  Download,
  File,
  FileCode,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { useItemDrawer } from "@/components/items/item-drawer";
import { Button } from "@/components/ui/button";
import type { DashboardItem } from "@/lib/db/items";
import { formatAbsoluteDate } from "@/lib/format-relative-time";
import {
  displayFileName,
  fileIconKind,
  type FileIconKind,
} from "@/lib/items/file-display";
import { formatFileSize } from "@/lib/items/file-upload";

const FILE_ICONS: Record<FileIconKind, LucideIcon> = {
  image: FileImage,
  pdf: File,
  json: FileJson,
  spreadsheet: FileSpreadsheet,
  text: FileText,
  code: FileCode,
  generic: File,
};

export function FileItemRow({ item }: { item: DashboardItem }) {
  const { openItem } = useItemDrawer();
  const name = displayFileName(item.fileName, item.title);
  const Icon = FILE_ICONS[fileIconKind(name)];
  const sizeLabel =
    item.fileSize != null ? formatFileSize(item.fileSize) : "—";
  const dateLabel = formatAbsoluteDate(item.createdAt);

  function openDrawer() {
    openItem(item.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openDrawer}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDrawer();
        }
      }}
      className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 sm:items-center"
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
        aria-hidden
      >
        <Icon className="size-4" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{name}</p>
        <p className="shrink-0 text-xs text-muted-foreground tabular-nums sm:w-24 sm:text-right">
          {sizeLabel}
        </p>
        <p className="shrink-0 text-xs text-muted-foreground sm:w-28 sm:text-right">
          {dateLabel}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Download ${name}`}
        className="shrink-0"
        onClick={(event) => {
          event.stopPropagation();
          window.location.assign(`/api/download/${item.id}`);
        }}
      >
        <Download />
      </Button>
    </div>
  );
}
