import { beforeEach, describe, expect, it, vi } from "vitest";

const userFirst = vi.hoisted(() => vi.fn());
const typeFirst = vi.hoisted(() => vi.fn());
const itemAggregate = vi.hoisted(() => vi.fn());
const itemAll = vi.hoisted(() => vi.fn());
const itemLimit = vi.hoisted(() => vi.fn());
const itemOffset = vi.hoisted(() => vi.fn());
const itemWhereArgs = vi.hoisted(() => vi.fn());

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
        ItemType: {
          where: () => ({
            select: () => ({
              first: typeFirst,
            }),
          }),
        },
        Item: {
          where: (where: unknown) => {
            itemWhereArgs(where);
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

import { getItemsByType } from "./items";

describe("getItemsByType pagination", () => {
  beforeEach(() => {
    userFirst.mockReset();
    typeFirst.mockReset();
    itemAggregate.mockReset();
    itemAll.mockReset();
    itemLimit.mockReset();
    itemOffset.mockReset();
    itemWhereArgs.mockReset();
  });

  it("returns an empty page when the demo user is missing", async () => {
    userFirst.mockResolvedValue(null);

    await expect(getItemsByType("snippet", 2, 21)).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 21,
      totalPages: 1,
    });
    expect(typeFirst).not.toHaveBeenCalled();
  });

  it("returns an empty page when the item type is unknown", async () => {
    userFirst.mockResolvedValue({ id: "user-1" });
    typeFirst.mockResolvedValue(null);

    await expect(getItemsByType("snippet", 1, 21)).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 21,
      totalPages: 1,
    });
    expect(itemAggregate).not.toHaveBeenCalled();
  });

  it("fetches only the requested page with limit and offset", async () => {
    userFirst.mockResolvedValue({ id: "user-1" });
    typeFirst.mockResolvedValue({ id: "type-snippet" });
    itemAggregate.mockResolvedValue({ total: 45 });
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
        itemTags: [],
      },
    ]);

    await expect(getItemsByType("snippet", 2, 21)).resolves.toMatchObject({
      total: 45,
      page: 2,
      pageSize: 21,
      totalPages: 3,
      items: [{ id: "item-22", title: "Page two item", typeName: "snippet" }],
    });

    expect(itemWhereArgs).toHaveBeenCalledWith({
      userId: "user-1",
      itemTypeId: "type-snippet",
    });
    expect(itemLimit).toHaveBeenCalledWith(21);
    expect(itemOffset).toHaveBeenCalledWith(21);
  });
});
