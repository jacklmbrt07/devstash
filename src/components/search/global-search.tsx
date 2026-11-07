"use client";

import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";

import { useItemDrawer } from "@/components/items/item-drawer";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { ITEM_TYPE_ICONS } from "@/lib/constants/item-types";
import type { SearchIndex } from "@/lib/db/search";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchIndex: SearchIndex;
}

export function GlobalSearch({
  open,
  onOpenChange,
  searchIndex,
}: GlobalSearchProps) {
  const router = useRouter();
  const { openItem } = useItemDrawer();

  function selectItem(id: string) {
    onOpenChange(false);
    openItem(id);
  }

  function selectCollection(id: string) {
    onOpenChange(false);
    router.push(`/collections/${id}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search items and collections"
    >
      <Command>
        <CommandInput placeholder="Search items and collections…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchIndex.items.length > 0 ? (
            <CommandGroup heading="Items">
              {searchIndex.items.map((item) => {
                const Icon = ITEM_TYPE_ICONS[item.typeName] ?? Folder;
                return (
                  <CommandItem
                    key={item.id}
                    value={`item ${item.title} ${item.typeName} ${item.contentPreview ?? ""}`}
                    onSelect={() => selectItem(item.id)}
                  >
                    <Icon
                      className="size-4 shrink-0"
                      style={{ color: item.typeColor }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    {item.contentPreview ? (
                      <span className="hidden max-w-[40%] truncate text-xs text-muted-foreground sm:inline">
                        {item.contentPreview}
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ) : null}
          {searchIndex.items.length > 0 && searchIndex.collections.length > 0 ? (
            <CommandSeparator />
          ) : null}
          {searchIndex.collections.length > 0 ? (
            <CommandGroup heading="Collections">
              {searchIndex.collections.map((collection) => (
                <CommandItem
                  key={collection.id}
                  value={`collection ${collection.name}`}
                  onSelect={() => selectCollection(collection.id)}
                >
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {collection.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {collection.itemCount}{" "}
                    {collection.itemCount === 1 ? "item" : "items"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
