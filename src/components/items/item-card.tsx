"use client";

import { useState, type MouseEvent } from "react";
import { Check, Copy, Pin, Star } from "lucide-react";
import { toast } from "sonner";

import { useItemDrawer } from "@/components/items/item-drawer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import type { DashboardItem } from "@/lib/db/items";
import { formatRelativeTime } from "@/lib/format-relative-time";

export function ItemCard({ item }: { item: DashboardItem }) {
  const { openItem } = useItemDrawer();
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const Icon = ITEM_TYPE_ICONS[item.typeName];
  const typeLabel = getItemTypeLabel(item.typeName);

  function openDrawer() {
    openItem(item.id);
  }

  async function copyItem(event: MouseEvent) {
    event.stopPropagation();
    if (copying) return;
    setCopying(true);
    try {
      const response = await fetch(`/api/items/${item.id}`);
      if (!response.ok) {
        throw new Error("Couldn't load item");
      }
      const data: unknown = await response.json();
      const detail = data as {
        content?: string | null;
        url?: string | null;
        title?: string;
      };
      const text =
        detail.content?.trim() ||
        detail.url?.trim() ||
        detail.title?.trim() ||
        item.title;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    } finally {
      setCopying(false);
    }
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
      className="block h-full w-full cursor-pointer rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card
        className="h-full border-l-[3px] transition-colors hover:bg-accent/40"
        style={{ borderLeftColor: item.typeColor }}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
                style={{ color: item.typeColor }}
                title={typeLabel}
              >
                {Icon ? (
                  <Icon className="size-4" aria-label={typeLabel} />
                ) : null}
              </span>
              <CardTitle className="truncate">{item.title}</CardTitle>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Copy"
                className="text-muted-foreground"
                disabled={copying}
                onClick={(event) => {
                  void copyItem(event);
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
              {item.isPinned ? (
                <Pin
                  className="size-3.5 text-muted-foreground"
                  aria-label="Pinned"
                />
              ) : null}
              {item.isFavorite ? (
                <Star
                  className="size-3.5 fill-current text-[#fde047]"
                  aria-label="Favorite"
                />
              ) : null}
            </div>
          </div>
          {item.description ? (
            <CardDescription className="line-clamp-2">
              {item.description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          {item.tags.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {typeLabel} · Updated {formatRelativeTime(item.updatedAt, new Date())}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
