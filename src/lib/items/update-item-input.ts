import { z } from "zod";

function blankToNull(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const nullableText = z.preprocess(blankToNull, z.string().nullable());

const nullableUrl = z.preprocess(
  blankToNull,
  z.union([z.url("Enter a valid URL"), z.null()]),
);

function uniqueTags(tags: string[]): string[] {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    if (seen.has(tag)) return false;
    seen.add(tag);
    return true;
  });
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
});

export type UpdateItemData = z.infer<typeof updateItemSchema>;
