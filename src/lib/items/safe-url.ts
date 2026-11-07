import { z } from "zod";

/** Zod schema that accepts only http(s) URLs. */
export const httpUrlSchema = z.httpUrl("Enter a valid URL");

/**
 * Returns the URL when it uses http or https; otherwise null.
 * Use before rendering user-supplied values into `href`.
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}
