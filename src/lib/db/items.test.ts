import { beforeEach, describe, expect, it, vi } from "vitest";

const userFirst = vi.hoisted(() => vi.fn());
const itemFirst = vi.hoisted(() => vi.fn());
const itemWhere = vi.hoisted(() => vi.fn());
const itemUpdate = vi.hoisted(() => vi.fn());
const deleteItemTags = vi.hoisted(() => vi.fn());
const tagWhere = vi.hoisted(() => vi.fn());
const tagFirst = vi.hoisted(() => vi.fn());
const tagCreate = vi.hoisted(() => vi.fn());
const linkTag = vi.hoisted(() => vi.fn());

vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  };
});

vi.mock("@/prisma/db", () => ({
  db: {
    orm: {
      public: {
        User: {
          where: () => ({
            select: () => ({
              first: userFirst,
            }),
          }),
        },
        Item: {
          where: (where: { id: string; userId: string }) => {
            itemWhere(where);
            const query = {
              include() {
                return query;
              },
              first: itemFirst,
              update: itemUpdate,
            };
            return query;
          },
        },
        Tag: {
          where: (where: { name: string }) => {
            tagWhere(where);
            return {
              select: () => ({
                first: tagFirst,
              }),
            };
          },
          create: tagCreate,
        },
        ItemTag: {
          where: () => ({
            deleteAll: deleteItemTags,
          }),
          create: linkTag,
        },
      },
    },
  },
}));

import { getItemById, updateItem } from "./items";

describe("getItemById", () => {
  beforeEach(() => {
    userFirst.mockReset();
    itemFirst.mockReset();
    itemWhere.mockReset();
    itemUpdate.mockReset();
    deleteItemTags.mockReset();
    tagWhere.mockReset();
    tagFirst.mockReset();
    tagCreate.mockReset();
    linkTag.mockReset();
  });

  it("returns null when the demo user does not exist", async () => {
    userFirst.mockResolvedValue(null);

    await expect(getItemById("item-1")).resolves.toBeNull();
    expect(itemWhere).not.toHaveBeenCalled();
  });

  it("returns null when that user has no matching item", async () => {
    userFirst.mockResolvedValue({ id: "user-1" });
    itemFirst.mockResolvedValue(null);

    await expect(getItemById("item-1")).resolves.toBeNull();
    expect(itemWhere).toHaveBeenCalledWith({ id: "item-1", userId: "user-1" });
  });

  it("maps the item, drops empty relations, and normalizes timestamps", async () => {
    userFirst.mockResolvedValue({ id: "user-1" });
    itemFirst.mockResolvedValue({
      id: "item-1",
      title: "Typed debounce utility",
      description: "Generic debounce with cancel support.",
      content: "export function debounce() {}",
      contentType: "FILE",
      url: "https://example.com",
      fileUrl: "https://cdn.example.com/debounce.ts",
      fileName: "debounce.ts",
      fileSize: 128,
      language: "typescript",
      isFavorite: true,
      isPinned: false,
      createdAt: "2026-11-01 12:00:00.000",
      updatedAt: "2026-11-02T12:00:00.000Z",
      itemType: { name: "snippet", color: "#3b82f6" },
      itemTags: [{ tag: { name: "utils" } }, { tag: null }, { tag: { name: "" } }],
      itemCollections: [
        { collection: { id: "collection-1", name: "React Patterns" } },
        { collection: null },
      ],
    });

    await expect(getItemById("item-1")).resolves.toEqual({
      id: "item-1",
      title: "Typed debounce utility",
      description: "Generic debounce with cancel support.",
      content: "export function debounce() {}",
      contentType: "FILE",
      url: "https://example.com",
      fileUrl: "https://cdn.example.com/debounce.ts",
      fileName: "debounce.ts",
      fileSize: 128,
      language: "typescript",
      isFavorite: true,
      isPinned: false,
      createdAt: "2026-11-01T12:00:00.000Z",
      updatedAt: "2026-11-02T12:00:00.000Z",
      typeName: "snippet",
      typeColor: "#3b82f6",
      tags: ["utils"],
      collections: [{ id: "collection-1", name: "React Patterns" }],
    });
  });

  it("uses text content and a neutral type when those fields are missing", async () => {
    userFirst.mockResolvedValue({ id: "user-1" });
    itemFirst.mockResolvedValue({
      id: "item-2",
      title: "Untitled note",
      description: null,
      content: null,
      contentType: "NOTE",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: null,
      isFavorite: false,
      isPinned: true,
      createdAt: "2026-11-03T08:00:00+00:00",
      updatedAt: "2026-11-03T08:00:00+00:00",
      itemType: null,
      itemTags: [],
      itemCollections: [],
    });

    await expect(getItemById("item-2")).resolves.toMatchObject({
      contentType: "TEXT",
      typeName: "item",
      typeColor: "#6b7280",
      createdAt: "2026-11-03T08:00:00+00:00",
      tags: [],
      collections: [],
    });
  });
});

const savedFields = {
  title: "Hello",
  description: null,
  content: "code",
  url: null,
  language: "typescript",
  tags: ["utils", "typescript"],
};

describe("updateItem", () => {
  beforeEach(() => {
    itemWhere.mockReset();
    itemUpdate.mockReset();
    deleteItemTags.mockReset();
    tagWhere.mockReset();
    tagFirst.mockReset();
    tagCreate.mockReset();
    linkTag.mockReset();
    itemFirst.mockReset();
  });

  it("does not replace tags when the user does not own the item", async () => {
    itemUpdate.mockResolvedValue(null);

    await expect(updateItem("user-1", "item-1", savedFields)).resolves.toBeNull();
    expect(itemWhere).toHaveBeenCalledWith({ id: "item-1", userId: "user-1" });
    expect(deleteItemTags).not.toHaveBeenCalled();
    expect(linkTag).not.toHaveBeenCalled();
  });

  it("replaces tags by reusing an existing name and creating a missing one", async () => {
    itemUpdate.mockResolvedValue({ id: "item-1" });
    tagFirst.mockResolvedValueOnce({ id: "tag-utils" }).mockResolvedValueOnce(null);
    tagCreate.mockResolvedValue({ id: "tag-ts", name: "typescript" });
    itemFirst.mockResolvedValue({
      id: "item-1",
      title: "Hello",
      description: null,
      content: "code",
      contentType: "TEXT",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: "typescript",
      isFavorite: false,
      isPinned: false,
      createdAt: "2026-11-01T12:00:00.000Z",
      updatedAt: "2026-11-06T12:00:00.000Z",
      itemType: { name: "snippet", color: "#3b82f6" },
      itemTags: [{ tag: { name: "utils" } }, { tag: { name: "typescript" } }],
      itemCollections: [],
    });

    await expect(updateItem("user-1", "item-1", savedFields)).resolves.toMatchObject({
      title: "Hello",
      tags: ["utils", "typescript"],
    });
    expect(itemUpdate).toHaveBeenCalledWith({
      title: "Hello",
      description: null,
      content: "code",
      url: null,
      language: "typescript",
    });
    expect(deleteItemTags).toHaveBeenCalledOnce();
    expect(tagWhere).toHaveBeenNthCalledWith(1, { name: "utils" });
    expect(tagWhere).toHaveBeenNthCalledWith(2, { name: "typescript" });
    expect(tagCreate).toHaveBeenCalledTimes(1);
    expect(tagCreate).toHaveBeenCalledWith({ name: "typescript" });
    expect(linkTag).toHaveBeenNthCalledWith(1, { a: "item-1", b: "tag-utils" });
    expect(linkTag).toHaveBeenNthCalledWith(2, { a: "item-1", b: "tag-ts" });
  });
});
