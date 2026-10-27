import {
  Code,
  File,
  Image,
  Link,
  type LucideIcon,
  Sparkles,
  StickyNote,
  Terminal,
} from "lucide-react";

export const ITEM_TYPE_ICONS: Record<string, LucideIcon> = {
  snippet: Code,
  prompt: Sparkles,
  command: Terminal,
  note: StickyNote,
  file: File,
  image: Image,
  link: Link,
};

export const ITEM_TYPE_COLORS: Record<string, string> = {
  snippet: "#3b82f6",
  prompt: "#8b5cf6",
  command: "#f97316",
  note: "#fde047",
  file: "#6b7280",
  image: "#ec4899",
  link: "#10b981",
};

export const PRO_ITEM_TYPES = new Set(["file", "image"]);

export function getItemTypeHref(name: string): string {
  return `/items/${name}s`;
}

export function getItemTypeLabel(name: string): string {
  const plural = `${name}s`;
  return plural.charAt(0).toUpperCase() + plural.slice(1);
}
