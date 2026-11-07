import { describe, expect, it } from "vitest";

import { createItemSchema } from "./create-item-input";

const linkBase = {
  type: "link" as const,
  title: " Lucide icons ",
  description: "  ",
  tags: [" icons ", "icons", "ui"],
};

describe("createItemSchema link URLs", () => {
  it("accepts an http(s) URL and normalizes fields", () => {
    expect(
      createItemSchema.parse({
        ...linkBase,
        url: " https://lucide.dev/icons/ ",
      }),
    ).toEqual({
      type: "link",
      title: "Lucide icons",
      description: null,
      tags: ["icons", "ui"],
      url: "https://lucide.dev/icons/",
    });
  });

  it("rejects a missing URL", () => {
    const result = createItemSchema.safeParse({
      ...linkBase,
      url: "  ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("URL is required");
    }
  });

  it("rejects non-http URL protocols", () => {
    for (const url of ["javascript:alert(1)", "ftp://files.example.com"]) {
      const result = createItemSchema.safeParse({
        ...linkBase,
        url,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Enter a valid URL");
      }
    }
  });
});

describe("createItemSchema file URLs", () => {
  const fileBase = {
    type: "file" as const,
    title: "Notes",
    description: null,
    tags: [],
    fileName: "notes.pdf",
    fileSize: 2048,
  };

  it("accepts an https file URL", () => {
    const parsed = createItemSchema.parse({
      ...fileBase,
      fileUrl: "https://cdn.example.com/user/notes.pdf",
    });

    expect(parsed).toMatchObject({
      type: "file",
      fileUrl: "https://cdn.example.com/user/notes.pdf",
      fileName: "notes.pdf",
      fileSize: 2048,
    });
  });

  it("rejects a non-http file URL", () => {
    const result = createItemSchema.safeParse({
      ...fileBase,
      fileUrl: "javascript:alert(1)",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Upload a file first");
    }
  });
});
