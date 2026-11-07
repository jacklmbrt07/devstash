import { describe, expect, it } from "vitest";

import { contentPreview } from "./content-preview";

describe("contentPreview", () => {
  it("returns null for empty values", () => {
    expect(contentPreview(null)).toBeNull();
    expect(contentPreview(undefined)).toBeNull();
    expect(contentPreview("")).toBeNull();
    expect(contentPreview("   \n\t  ")).toBeNull();
  });

  it("collapses whitespace", () => {
    expect(contentPreview("hello\n  world")).toBe("hello world");
  });

  it("truncates long text with an ellipsis", () => {
    const long = "a".repeat(100);
    expect(contentPreview(long, 20)).toBe(`${"a".repeat(19)}…`);
  });

  it("keeps text that fits the max length", () => {
    expect(contentPreview("short")).toBe("short");
    expect(contentPreview("abcdefghij", 10)).toBe("abcdefghij");
  });

  it("uses the default max of 80 characters", () => {
    const long = "x".repeat(81);
    expect(contentPreview(long)).toBe(`${"x".repeat(79)}…`);
  });
});
