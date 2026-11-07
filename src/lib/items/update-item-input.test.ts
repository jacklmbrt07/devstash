import { describe, expect, it } from "vitest";

import { updateItemSchema } from "./update-item-input";

const validInput = {
  title: "  Typed debounce  ",
  description: "   ",
  content: null,
  url: "",
  language: " typescript ",
  tags: [" utils ", "utils", "typescript"],
};

describe("updateItemSchema", () => {
  it("trims fields, clears blanks, and drops duplicate tags", () => {
    expect(updateItemSchema.parse(validInput)).toEqual({
      title: "Typed debounce",
      description: null,
      content: null,
      url: null,
      language: "typescript",
      tags: ["utils", "typescript"],
      collectionIds: [],
    });
  });

  it("keeps unique collection ids", () => {
    const parsed = updateItemSchema.parse({
      ...validInput,
      collectionIds: ["col-1", "col-2", "col-1"],
    });

    expect(parsed.collectionIds).toEqual(["col-1", "col-2"]);
  });

  it("keeps a valid URL", () => {
    const parsed = updateItemSchema.parse({
      ...validInput,
      url: " https://lucide.dev/icons/ ",
    });

    expect(parsed.url).toBe("https://lucide.dev/icons/");
  });

  it("rejects an empty title", () => {
    const result = updateItemSchema.safeParse({ ...validInput, title: "  " });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Title is required");
    }
  });

  it("rejects an invalid URL and an empty tag", () => {
    const url = updateItemSchema.safeParse({
      ...validInput,
      url: "not a url",
    });
    const tags = updateItemSchema.safeParse({
      ...validInput,
      tags: ["utils", "  "],
    });

    expect(url.success).toBe(false);
    expect(tags.success).toBe(false);
    if (!url.success) {
      expect(url.error.issues[0]?.message).toBe("Enter a valid URL");
    }
    if (!tags.success) {
      expect(tags.error.issues[0]?.message).toBe("Tags can't be empty");
    }
  });

  it("rejects non-http URL protocols", () => {
    const result = updateItemSchema.safeParse({
      ...validInput,
      url: "javascript:alert(1)",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter a valid URL");
    }
  });
});
