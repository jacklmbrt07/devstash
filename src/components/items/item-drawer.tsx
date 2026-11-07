"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Copy, Download, Pencil, Pin, Star } from "lucide-react";
import { toast } from "sonner";

import { CodeEditor, isCodeItemType } from "@/components/items/code-editor";
import {
  MarkdownEditor,
  isMarkdownItemType,
} from "@/components/items/markdown-editor";
import { DeleteItemDialog } from "@/components/items/delete-item-dialog";
import { ItemDrawerEditor } from "@/components/items/item-drawer-editor";
import { RemoteImage } from "@/components/items/remote-image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import type { ItemDetail } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { formatFileSize } from "@/lib/items/file-upload";
import { safeExternalUrl } from "@/lib/items/safe-url";

interface ItemDrawerContextValue {
  openItem: (id: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function useItemDrawer(): ItemDrawerContextValue {
  const value = useContext(ItemDrawerContext);
  if (!value) {
    throw new Error("useItemDrawer must be used within ItemDrawer");
  }
  return value;
}

type DrawerState =
  | { status: "loading" }
  | { status: "ready"; item: ItemDetail }
  | { status: "error" };

function isItemDetail(value: unknown): value is ItemDetail {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ItemDetail>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.isFavorite === "boolean" &&
    typeof item.isPinned === "boolean" &&
    Array.isArray(item.tags) &&
    Array.isArray(item.collections)
  );
}

function singularTypeLabel(name: string): string {
  const label = getItemTypeLabel(name);
  return label.endsWith("s") ? label.slice(0, -1) : label;
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading item</span>
      <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
      <div className="h-7 w-2/3 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
    </div>
  );
}

function DetailSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </h3>
      {children}
    </section>
  );
}

async function copyItemText(item: ItemDetail) {
  const text = item.content?.trim() || item.url?.trim() || item.title;
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Couldn't copy");
  }
}

function ActionBar({
  item,
  onEdit,
  onDeleted,
}: {
  item: ItemDetail;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const canDownload = item.contentType === "FILE" && Boolean(item.fileUrl);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={item.isFavorite ? "Favorited" : "Favorite"}
          aria-pressed={item.isFavorite}
        >
          <Star
            className={
              item.isFavorite ? "fill-current text-[#fde047]" : undefined
            }
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={item.isPinned ? "Pinned" : "Pin"}
          aria-pressed={item.isPinned}
        >
          <Pin className={item.isPinned ? "text-foreground" : undefined} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Copy"
          onClick={() => {
            void copyItemText(item);
          }}
        >
          <Copy />
        </Button>
        {canDownload ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Download"
            onClick={() => {
              window.location.assign(`/api/download/${item.id}`);
            }}
          >
            <Download />
          </Button>
        ) : null}
        <DeleteItemDialog
          itemId={item.id}
          title={item.title}
          onDeleted={onDeleted}
        />
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={onEdit}>
        <Pencil data-icon="inline-start" />
        Edit
      </Button>
    </div>
  );
}

function ItemDrawerBody({
  item,
  onItemChange,
  onDeleted,
}: {
  item: ItemDetail;
  onItemChange: (item: ItemDetail) => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const Icon = ITEM_TYPE_ICONS[item.typeName];
  const typeLabel = singularTypeLabel(item.typeName);
  const externalUrl = safeExternalUrl(item.url);

  if (editing) {
    return (
      <ItemDrawerEditor
        item={item}
        onCancel={() => setEditing(false)}
        onSaved={(next) => {
          onItemChange(next);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 pr-12">
      <SheetHeader className="gap-3 p-0">
        <div className="flex items-center justify-between gap-3">
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
            style={{
              color: item.typeColor,
              backgroundColor: `${item.typeColor}22`,
            }}
          >
            {Icon ? <Icon className="size-3" aria-hidden /> : null}
            {typeLabel}
          </span>
          {item.language ? (
            <span className="text-xs text-muted-foreground">
              {item.language}
            </span>
          ) : null}
        </div>
        <SheetTitle className="text-xl font-semibold tracking-tight">
          {item.title}
        </SheetTitle>
        {item.description ? (
          <SheetDescription>{item.description}</SheetDescription>
        ) : (
          <SheetDescription className="sr-only">Item details</SheetDescription>
        )}
      </SheetHeader>

      <ActionBar
        item={item}
        onEdit={() => setEditing(true)}
        onDeleted={onDeleted}
      />

      {item.tags.length > 0 ? (
        <DetailSection label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </DetailSection>
      ) : null}

      {item.collections.length > 0 ? (
        <DetailSection label="Collections">
          <div className="flex flex-wrap gap-1.5">
            {item.collections.map((collection) => (
              <span
                key={collection.id}
                className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {collection.name}
              </span>
            ))}
          </div>
        </DetailSection>
      ) : null}

      {item.url ? (
        <DetailSection label="URL">
          {externalUrl ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm text-foreground underline-offset-4 hover:underline"
            >
              {item.url}
            </a>
          ) : (
            <span className="truncate text-sm text-muted-foreground">
              {item.url}
            </span>
          )}
        </DetailSection>
      ) : null}

      {item.contentType === "FILE" && item.typeName === "image" && item.fileUrl ? (
        <DetailSection label="Image">
          <div className="relative h-80 w-full overflow-hidden rounded-lg bg-muted/40">
            <RemoteImage
              src={item.fileUrl}
              alt={item.fileName ?? item.title}
              sizes="(max-width: 640px) 100vw, 28rem"
              className="object-contain"
            />
          </div>
          {item.fileName ? (
            <p className="text-sm text-muted-foreground">
              {item.fileName}
              {item.fileSize != null ? ` · ${formatFileSize(item.fileSize)}` : ""}
            </p>
          ) : null}
        </DetailSection>
      ) : null}

      {item.contentType === "FILE" && item.typeName !== "image" && item.fileName ? (
        <DetailSection label="File">
          <p className="text-sm">
            {item.fileName}
            {item.fileSize != null ? (
              <span className="text-muted-foreground">
                {" "}
                · {formatFileSize(item.fileSize)}
              </span>
            ) : null}
          </p>
        </DetailSection>
      ) : null}

      {item.content ? (
        <DetailSection label="Content">
          {isCodeItemType(item.typeName) ? (
            <CodeEditor
              value={item.content}
              language={item.language}
              readOnly
            />
          ) : isMarkdownItemType(item.typeName) ? (
            <MarkdownEditor value={item.content} readOnly />
          ) : (
            <pre className="max-h-80 overflow-auto rounded-lg bg-muted/60 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {item.content}
            </pre>
          )}
        </DetailSection>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Updated {formatRelativeTime(item.updatedAt, new Date())}
      </p>
    </div>
  );
}

export function ItemDrawer({ children }: { children: ReactNode }) {
  const [itemId, setItemId] = useState<string | null>(null);
  const [state, setState] = useState<DrawerState>({ status: "loading" });

  function openItem(id: string) {
    setItemId(id);
    setState({ status: "loading" });
  }

  useEffect(() => {
    if (!itemId) return;

    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch(`/api/items/${itemId}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          if (!controller.signal.aborted) setState({ status: "error" });
          return;
        }
        const body: unknown = await response.json();
        if (controller.signal.aborted) return;
        if (!isItemDetail(body)) {
          setState({ status: "error" });
          return;
        }
        setState({ status: "ready", item: body });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    })();

    return () => controller.abort();
  }, [itemId]);

  return (
    <ItemDrawerContext.Provider value={{ openItem }}>
      {children}
      <Sheet
        open={itemId !== null}
        onOpenChange={(open) => {
          if (!open) setItemId(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-y-auto data-[side=right]:sm:max-w-xl!"
        >
          {state.status === "loading" ? (
            <>
              <SheetHeader className="sr-only">
                <SheetTitle>Loading item</SheetTitle>
                <SheetDescription>Item details are loading</SheetDescription>
              </SheetHeader>
              <DrawerSkeleton />
            </>
          ) : null}
          {state.status === "error" ? (
            <SheetHeader className="p-4 pr-12">
              <SheetTitle>Couldn&apos;t load item</SheetTitle>
              <SheetDescription>
                Something went wrong opening this item. Close the drawer and try again.
              </SheetDescription>
            </SheetHeader>
          ) : null}
          {state.status === "ready" ? (
            <ItemDrawerBody
              key={state.item.id}
              item={state.item}
              onItemChange={(item) => setState({ status: "ready", item })}
              onDeleted={() => setItemId(null)}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </ItemDrawerContext.Provider>
  );
}
