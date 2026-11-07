const DEFAULT_MAX = 80;

/** Collapse whitespace and truncate for search result previews. */
export function contentPreview(
  value: string | null | undefined,
  max = DEFAULT_MAX,
): string | null {
  if (!value) return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return null;
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(1, max - 1))}…`;
}
