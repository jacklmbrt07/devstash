import { afterEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const saveItem = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  auth,
}));

vi.mock("@/lib/db/items", () => ({
  updateItem: saveItem,
}));

import { updateItem } from "./items";

const item = {
  id: "item-1",
  title: "Hello",
  description: null,
  content: "code",
  contentType: "TEXT" as const,
  url: null,
  fileName: null,
  language: null,
  isFavorite: false,
  isPinned: false,
  createdAt: "2026-11-01T12:00:00.000Z",
  updatedAt: "2026-11-06T12:00:00.000Z",
  typeName: "snippet",
  typeColor: "#3b82f6",
  tags: ["a"],
  collections: [],
};

const payload = {
  title: "  Hello ",
  description: "",
  content: "code",
  url: null,
  language: "",
  tags: ["a", "a"],
};

describe("updateItem", () => {
  afterEach(() => {
    auth.mockReset();
    saveItem.mockReset();
    vi.restoreAllMocks();
  });

  it("requires a signed-in user before saving", async () => {
    auth.mockResolvedValue(null);

    await expect(updateItem("item-1", payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Sign in to edit this item",
    });
    expect(saveItem).not.toHaveBeenCalled();
  });

  it("rejects a blank item id", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    await expect(updateItem("  ", payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Item not found",
    });
    expect(saveItem).not.toHaveBeenCalled();
  });

  it("returns the Zod message and does not write when the payload is invalid", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    await expect(
      updateItem("item-1", { ...payload, title: " " }),
    ).resolves.toEqual({
      success: false,
      data: null,
      error: "Title is required",
    });
    expect(saveItem).not.toHaveBeenCalled();
  });

  it("saves for the signed-in user and returns the updated item", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    saveItem.mockResolvedValue(item);

    await expect(updateItem("item-1", payload)).resolves.toEqual({
      success: true,
      data: item,
      error: null,
    });
    expect(saveItem).toHaveBeenCalledWith("user-1", "item-1", {
      title: "Hello",
      description: null,
      content: "code",
      url: null,
      language: null,
      tags: ["a"],
    });
  });

  it("reports a missing item when the user does not own it", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    saveItem.mockResolvedValue(null);

    await expect(updateItem("item-1", payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Item not found",
    });
  });

  it("hides database failures behind a generic error", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    saveItem.mockRejectedValue(new Error("connection lost"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(updateItem("item-1", payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Couldn't save this item",
    });
  });
});
