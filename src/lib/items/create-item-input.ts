import { z } from "zod";

export const CREATABLE_ITEM_TYPES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
] as const;

export type CreatableItemType = (typeof CREATABLE_ITEM_TYPES)[number];

export const CREATABLE_ITEM_TYPE_LABELS: Record<CreatableItemType, string> = {
  snippet: "Snippet",
  prompt: "Prompt",
  command: "Command",
  note: "Note",
  file: "File",
  image: "Image",
  link: "Link",
};

function blankToNull(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const nullableText = z.preprocess(blankToNull, z.string().nullable());

function uniqueTags(tags: string[]): string[] {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    if (seen.has(tag)) return false;
    seen.add(tag);
    return true;
  });
}

const sharedFields = {
  title: z.string().trim().min(1, "Title is required"),
  description: nullableText,
  tags: z
    .array(z.string().trim().min(1, "Tags can't be empty"))
    .transform(uniqueTags),
};

const textItem = z.object({
  ...sharedFields,
  content: nullableText,
});

const codedItem = textItem.extend({
  language: nullableText,
});

const fileFields = {
  fileUrl: z.string().trim().min(1, "Upload a file first").pipe(z.url("Upload a file first")),
  fileName: z.string().trim().min(1, "Upload a file first"),
  fileSize: z.number().int().positive("Upload a file first"),
};

export const createItemSchema = z.discriminatedUnion("type", [
  codedItem.extend({ type: z.literal("snippet") }),
  codedItem.extend({ type: z.literal("command") }),
  textItem.extend({ type: z.literal("prompt") }),
  textItem.extend({ type: z.literal("note") }),
  z.object({
    ...sharedFields,
    type: z.literal("file"),
    ...fileFields,
  }),
  z.object({
    ...sharedFields,
    type: z.literal("image"),
    ...fileFields,
  }),
  z.object({
    ...sharedFields,
    type: z.literal("link"),
    url: z
      .string()
      .trim()
      .min(1, "URL is required")
      .pipe(z.url("Enter a valid URL")),
  }),
]);

export type CreateItemData = z.infer<typeof createItemSchema>;
