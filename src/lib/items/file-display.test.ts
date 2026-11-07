import { describe, expect, it } from "vitest";

import { displayFileName, fileIconKind } from "./file-display";

describe("fileIconKind", () => {
  it("maps image extensions", () => {
    expect(fileIconKind("shot.png")).toBe("image");
    expect(fileIconKind("photo.JPEG")).toBe("image");
  });

  it("maps document and data extensions", () => {
    expect(fileIconKind("report.pdf")).toBe("pdf");
    expect(fileIconKind("data.json")).toBe("json");
    expect(fileIconKind("rows.csv")).toBe("spreadsheet");
    expect(fileIconKind("readme.md")).toBe("text");
    expect(fileIconKind("config.yaml")).toBe("code");
  });

  it("falls back to generic for unknown extensions", () => {
    expect(fileIconKind("archive.zip")).toBe("generic");
    expect(fileIconKind("noext")).toBe("generic");
  });
});

describe("displayFileName", () => {
  it("prefers the stored file name when present", () => {
    expect(displayFileName("notes.md", "My notes")).toBe("notes.md");
  });

  it("falls back to the item title", () => {
    expect(displayFileName(null, "Untitled")).toBe("Untitled");
    expect(displayFileName("   ", "Untitled")).toBe("Untitled");
  });
});
