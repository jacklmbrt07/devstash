import { describe, expect, it } from "vitest";

import { isMarkdownItemType } from "./markdown-editor";

describe("isMarkdownItemType", () => {
  it("returns true for note and prompt", () => {
    expect(isMarkdownItemType("note")).toBe(true);
    expect(isMarkdownItemType("prompt")).toBe(true);
  });

  it("returns false for non-markdown types", () => {
    expect(isMarkdownItemType("snippet")).toBe(false);
    expect(isMarkdownItemType("command")).toBe(false);
    expect(isMarkdownItemType("link")).toBe(false);
    expect(isMarkdownItemType("")).toBe(false);
  });
});
