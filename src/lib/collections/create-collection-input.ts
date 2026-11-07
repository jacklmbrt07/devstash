import { z } from "zod";

function blankToNull(value: unknown): unknown {
  if (value == null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const nullableText = z.preprocess(blankToNull, z.string().nullable());

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: nullableText,
});

export const updateCollectionSchema = createCollectionSchema;

export type CreateCollectionData = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionData = z.infer<typeof updateCollectionSchema>;
