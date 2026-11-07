export function isMarkdownItemType(typeName: string): boolean {
  return typeName === "note" || typeName === "prompt";
}
