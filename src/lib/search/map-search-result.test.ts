import { describe, expect, it } from "vitest";

import {
  mapSearchCollection,
  mapSearchItem,
  searchPreviewSource,
} from "./map-search-result";

const baseItem = {
  id: "item-1",
  title: "Debounce helper",
  content: null as string | null,
  description: null as string | null,
  url: null as string | null,
  fileName: null as string | null,
  itemType: { name: "snippet", color: "#3b82f6" },
};

describe("searchPreviewSource", () => {
  it("prefers content over other fields", () => {
    expect(
      searchPreviewSource({
        content: "code",
        description: "desc",
        fileName: "file.ts",
        url: "https://example.com",
      }),
    ).toBe("code");
  });

  it("falls back through description, file name, then url", () => {
    expect(
      searchPreviewSource({
        content: null,
        description: "desc",
        fileName: "file.ts",
        url: "https://example.com",
      }),
    ).toBe("desc");
    expect(
      searchPreviewSource({
        content: null,
        description: null,
        fileName: "file.ts",
        url: "https://example.com",
      }),
    ).toBe("file.ts");
    expect(
      searchPreviewSource({
        content: null,
        description: null,
        fileName: null,
        url: "https://example.com",
      }),
    ).toBe("https://example.com");
  });

  it("returns null when every field is empty", () => {
    expect(
      searchPreviewSource({
        content: null,
        description: null,
        fileName: null,
        url: null,
      }),
    ).toBeNull();
  });
});

describe("mapSearchItem", () => {
  it("maps type metadata and preview from content", () => {
    expect(
      mapSearchItem({
        ...baseItem,
        content: "export function debounce() {}",
      }),
    ).toEqual({
      id: "item-1",
      title: "Debounce helper",
      typeName: "snippet",
      typeColor: "#3b82f6",
      contentPreview: "export function debounce() {}",
    });
  });

  it("uses defaults when item type is missing", () => {
    expect(
      mapSearchItem({
        ...baseItem,
        itemType: null,
        description: "A short note",
      }),
    ).toEqual({
      id: "item-1",
      title: "Debounce helper",
      typeName: "item",
      typeColor: "#6b7280",
      contentPreview: "A short note",
    });
  });
});

describe("mapSearchCollection", () => {
  it("counts linked items", () => {
    expect(
      mapSearchCollection({
        id: "col-1",
        name: "React Patterns",
        itemCollections: [{ itemId: "a" }, { itemId: "b" }, { itemId: "c" }],
      }),
    ).toEqual({
      id: "col-1",
      name: "React Patterns",
      itemCount: 3,
    });
  });

  it("reports zero when a collection is empty", () => {
    expect(
      mapSearchCollection({
        id: "col-2",
        name: "Empty",
        itemCollections: [],
      }),
    ).toEqual({
      id: "col-2",
      name: "Empty",
      itemCount: 0,
    });
  });
});
