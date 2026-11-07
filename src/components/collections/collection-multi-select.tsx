"use client";

import type { CollectionOption } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

interface CollectionMultiSelectProps {
  options: CollectionOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

export function CollectionMultiSelect({
  options,
  value,
  onChange,
  disabled = false,
  loading = false,
  emptyMessage = "No collections yet",
}: CollectionMultiSelectProps) {
  const selected = new Set(value);

  function toggle(id: string) {
    if (disabled) return;
    if (selected.has(id)) {
      onChange(value.filter((current) => current !== id));
      return;
    }
    onChange([...value, id]);
  }

  if (loading) {
    return (
      <p className="text-sm font-normal text-muted-foreground">
        Loading collections…
      </p>
    );
  }

  if (options.length === 0) {
    return (
      <p className="text-sm font-normal text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div
      role="group"
      aria-label="Collections"
      className="max-h-40 overflow-y-auto rounded-lg border border-input dark:bg-input/30"
    >
      <ul className="divide-y divide-border">
        {options.map((option) => {
          const checked = selected.has(option.id);
          return (
            <li key={option.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-2.5 py-2 text-sm font-normal",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option.id)}
                  disabled={disabled}
                  className="size-4 rounded border border-input accent-primary"
                />
                <span className="truncate">{option.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
