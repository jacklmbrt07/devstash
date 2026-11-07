import { beforeEach, describe, expect, it, vi } from "vitest";

const collectionFirst = vi.hoisted(() => vi.fn());
const itemAggregate = vi.hoisted(() => vi.fn());
const itemGroupAggregate = vi.hoisted(() => vi.fn());
const itemAll = vi.hoisted(() => vi.fn());
const itemLimit = vi.hoisted(() => vi.fn());
const itemOffset = vi.hoisted(() => vi.fn());
const systemTypesAll = vi.hoisted(() => vi.fn());

vi.mock("@/prisma/db", () => ({
  db: {
    orm: {
      public: {
        Collection: {
          where: () => ({
            select: () => ({
              first: collectionFirst,
            }),
          }),
        },
        ItemType: {
          where: () => ({
            select: () => ({
              all: systemTypesAll,
            }),
          }),
        },
        Item: {
          where: () => {
            const query = {
              orderBy() {
                return query;
              },
              limit(value: number) {
                itemLimit(value);
                return query;
              },
              offset(value: number) {
                itemOffset(value);
                return query;
              },
              include() {
                return query;
              },
              groupBy() {
                return {
                  aggregate: itemGroupAggregate,
                };
              },
              aggregate: itemAggregate,
              all: itemAll,
            };
            return query;
          },
        },
      },
    },
  },
}));

import { getCollectionById, getCollectionName } from "./collections";

describe("getCollectionName", () => {
  beforeEach(() => {
    collectionFirst.mockReset();
  });

  it("returns null when the collection is missing", async () => {
    collectionFirst.mockResolvedValue(null);
    await expect(getCollectionName("user-1", "col-1")).resolves.toBeNull();
  });

  it("returns the collection name", async () => {
    collectionFirst.mockResolvedValue({ name: "React Patterns" });
    await expect(getCollectionName("user-1", "col-1")).resolves.toBe(
      "React Patterns",
    );
  });
});

describe("getCollectionById pagination", () => {
  beforeEach(() => {
    collectionFirst.mockReset();
    itemAggregate.mockReset();
    itemGroupAggregate.mockReset();
    itemAll.mockReset();
    itemLimit.mockReset();
    itemOffset.mockReset();
    systemTypesAll.mockReset();
  });

  it("returns null when the collection is missing", async () => {
    collectionFirst.mockResolvedValue(null);

    await expect(
      getCollectionById("user-1", "col-1", 1, 21),
    ).resolves.toBeNull();
    expect(itemAggregate).not.toHaveBeenCalled();
  });

  it("fetches only the requested page of items with limit and offset", async () => {
    collectionFirst.mockResolvedValue({
      id: "col-1",
      name: "React Patterns",
      description: "Hooks and components",
      isFavorite: true,
      updatedAt: "2026-11-02T12:00:00.000Z",
    });
    itemAggregate.mockResolvedValue({ total: 45 });
    itemGroupAggregate.mockResolvedValue([
      { itemTypeId: "type-snippet", total: 30 },
      { itemTypeId: "type-note", total: 15 },
    ]);
    systemTypesAll.mockResolvedValue([
      { id: "type-snippet", name: "snippet", color: "#3b82f6" },
      { id: "type-note", name: "note", color: "#fde047" },
    ]);
    itemAll.mockResolvedValue([
      {
        id: "item-22",
        title: "Page two item",
        description: null,
        isFavorite: false,
        isPinned: false,
        fileUrl: null,
        fileName: null,
        fileSize: null,
        createdAt: "2026-11-01T12:00:00.000Z",
        updatedAt: "2026-11-02T12:00:00.000Z",
        itemType: { name: "snippet", color: "#3b82f6" },
        itemTags: [{ tag: { name: "react" } }],
      },
    ]);

    await expect(
      getCollectionById("user-1", "col-1", 2, 21),
    ).resolves.toMatchObject({
      id: "col-1",
      name: "React Patterns",
      itemTotal: 45,
      page: 2,
      pageSize: 21,
      totalPages: 3,
      borderColor: "#3b82f6",
      types: [
        { name: "snippet", color: "#3b82f6" },
        { name: "note", color: "#fde047" },
      ],
      items: [
        {
          id: "item-22",
          title: "Page two item",
          tags: ["react"],
          typeName: "snippet",
        },
      ],
    });

    expect(itemLimit).toHaveBeenCalledWith(21);
    expect(itemOffset).toHaveBeenCalledWith(21);
  });
});
