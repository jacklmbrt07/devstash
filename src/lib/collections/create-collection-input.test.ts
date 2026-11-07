import { describe, expect, it } from "vitest";

import {
  createCollectionSchema,
  updateCollectionSchema,
} from "./create-collection-input";

describe("createCollectionSchema", () => {
  it("requires a non-empty name", () => {
    const result = createCollectionSchema.safeParse({
      name: "  ",
      description: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Name is required");
    }
  });

  it("trims the name and blank description to null", () => {
    expect(
      createCollectionSchema.parse({
        name: "  React Patterns ",
        description: "   ",
      }),
    ).toEqual({
      name: "React Patterns",
      description: null,
    });
  });

  it("keeps a non-empty description", () => {
    expect(
      createCollectionSchema.parse({
        name: "AI Workflows",
        description: "Prompts and context",
      }),
    ).toEqual({
      name: "AI Workflows",
      description: "Prompts and context",
    });
  });

  it("accepts a null description", () => {
    expect(
      createCollectionSchema.parse({
        name: "Empty desc",
        description: null,
      }),
    ).toEqual({
      name: "Empty desc",
      description: null,
    });
  });
});

describe("updateCollectionSchema", () => {
  it("shares create validation for metadata edits", () => {
    expect(
      updateCollectionSchema.parse({
        name: "  Renamed ",
        description: "  ",
      }),
    ).toEqual({
      name: "Renamed",
      description: null,
    });
  });
});
