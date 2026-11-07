import { z } from "zod";

import { httpUrlSchema } from "@/lib/items/safe-url";

function blankToNull(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const nullableText = z.preprocess(blankToNull, z.string().nullable());

const nullableUrl = z.preprocess(
  blankToNull,
  z.union([httpUrlSchema, z.null()]),
);

function uniqueTags(tags: string[]): string[] {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    if (seen.has(tag)) return false;
    seen.add(tag);
    return true;
  });
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: nullableText,
  content: nullableText,
  url: nullableUrl,
  language: nullableText,
  tags: z
    .array(z.string().trim().min(1, "Tags can't be empty"))
    .transform(uniqueTags),
  collectionIds: z
    .array(z.string().trim().min(1, "Collection id can't be empty"))
    .default([])
    .transform(uniqueIds),
});

export type UpdateItemData = z.infer<typeof updateItemSchema>;
