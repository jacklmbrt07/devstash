import { afterEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const insertCollection = vi.hoisted(() => vi.fn());
const saveCollection = vi.hoisted(() => vi.fn());
const removeCollection = vi.hoisted(() => vi.fn());
const loadCollectionOptions = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  auth,
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: insertCollection,
  updateCollection: saveCollection,
  deleteCollection: removeCollection,
  getCollectionOptions: loadCollectionOptions,
}));

import {
  createCollection,
  deleteCollection,
  listCollectionOptions,
  updateCollection,
} from "./collections";

const collection = {
  id: "col-1",
  name: "React Patterns",
  description: "Hooks and components",
  isFavorite: false,
  updatedAt: "2026-11-07T12:00:00.000Z",
  itemCount: 0,
  borderColor: null,
  types: [],
};

const payload = {
  name: "  React Patterns ",
  description: "Hooks and components",
};

describe("createCollection", () => {
  afterEach(() => {
    auth.mockReset();
    insertCollection.mockReset();
    saveCollection.mockReset();
    removeCollection.mockReset();
    loadCollectionOptions.mockReset();
    vi.restoreAllMocks();
  });

  it("requires a signed-in user before creating", async () => {
    auth.mockResolvedValue(null);

    await expect(createCollection(payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Sign in to create a collection",
    });
    expect(insertCollection).not.toHaveBeenCalled();
  });

  it("rejects a session without a user id", async () => {
    auth.mockResolvedValue({ user: { email: "demo@devstash.io" } });

    await expect(createCollection(payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Sign in to create a collection",
    });
    expect(insertCollection).not.toHaveBeenCalled();
  });

  it("returns the Zod message and does not write when the payload is invalid", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    await expect(createCollection({ ...payload, name: " " })).resolves.toEqual({
      success: false,
      data: null,
      error: "Name is required",
    });
    expect(insertCollection).not.toHaveBeenCalled();
  });

  it("creates for the signed-in user and returns the collection", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    insertCollection.mockResolvedValue(collection);

    await expect(createCollection(payload)).resolves.toEqual({
      success: true,
      data: collection,
      error: null,
    });
    expect(insertCollection).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: "Hooks and components",
    });
  });

  it("returns a generic error when the database write fails", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    insertCollection.mockRejectedValue(new Error("db down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(createCollection(payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Couldn't create this collection",
    });
    expect(consoleError).toHaveBeenCalled();
  });
});

describe("updateCollection", () => {
  afterEach(() => {
    auth.mockReset();
    saveCollection.mockReset();
    vi.restoreAllMocks();
  });

  it("requires a signed-in user before updating", async () => {
    auth.mockResolvedValue(null);

    await expect(updateCollection("col-1", payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Sign in to edit this collection",
    });
    expect(saveCollection).not.toHaveBeenCalled();
  });

  it("rejects a blank collection id", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    await expect(updateCollection("  ", payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Collection not found",
    });
    expect(saveCollection).not.toHaveBeenCalled();
  });

  it("returns the Zod message and does not write when the payload is invalid", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    await expect(
      updateCollection("col-1", { ...payload, name: " " }),
    ).resolves.toEqual({
      success: false,
      data: null,
      error: "Name is required",
    });
    expect(saveCollection).not.toHaveBeenCalled();
  });

  it("updates for the signed-in user and returns the collection", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    saveCollection.mockResolvedValue(collection);

    await expect(updateCollection("col-1", payload)).resolves.toEqual({
      success: true,
      data: collection,
      error: null,
    });
    expect(saveCollection).toHaveBeenCalledWith("user-1", "col-1", {
      name: "React Patterns",
      description: "Hooks and components",
    });
  });

  it("returns not found when the collection is missing", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    saveCollection.mockResolvedValue(null);

    await expect(updateCollection("missing", payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Collection not found",
    });
  });

  it("returns a generic error when the database write fails", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    saveCollection.mockRejectedValue(new Error("db down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(updateCollection("col-1", payload)).resolves.toEqual({
      success: false,
      data: null,
      error: "Couldn't update this collection",
    });
    expect(consoleError).toHaveBeenCalled();
  });
});

describe("deleteCollection", () => {
  afterEach(() => {
    auth.mockReset();
    removeCollection.mockReset();
    vi.restoreAllMocks();
  });

  it("requires a signed-in user before deleting", async () => {
    auth.mockResolvedValue(null);

    await expect(deleteCollection("col-1")).resolves.toEqual({
      success: false,
      data: null,
      error: "Sign in to delete this collection",
    });
    expect(removeCollection).not.toHaveBeenCalled();
  });

  it("rejects a blank collection id", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });

    await expect(deleteCollection("")).resolves.toEqual({
      success: false,
      data: null,
      error: "Collection not found",
    });
    expect(removeCollection).not.toHaveBeenCalled();
  });

  it("deletes for the signed-in user and returns the id", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    removeCollection.mockResolvedValue({ id: "col-1" });

    await expect(deleteCollection("col-1")).resolves.toEqual({
      success: true,
      data: { id: "col-1" },
      error: null,
    });
    expect(removeCollection).toHaveBeenCalledWith("user-1", "col-1");
  });

  it("returns not found when the collection is missing", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    removeCollection.mockResolvedValue(null);

    await expect(deleteCollection("missing")).resolves.toEqual({
      success: false,
      data: null,
      error: "Collection not found",
    });
  });

  it("returns a generic error when the database write fails", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    removeCollection.mockRejectedValue(new Error("db down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(deleteCollection("col-1")).resolves.toEqual({
      success: false,
      data: null,
      error: "Couldn't delete this collection",
    });
    expect(consoleError).toHaveBeenCalled();
  });
});

describe("listCollectionOptions", () => {
  afterEach(() => {
    auth.mockReset();
    loadCollectionOptions.mockReset();
    vi.restoreAllMocks();
  });

  it("requires a signed-in user", async () => {
    auth.mockResolvedValue(null);

    await expect(listCollectionOptions()).resolves.toEqual({
      success: false,
      data: [],
      error: "Sign in to load collections",
    });
    expect(loadCollectionOptions).not.toHaveBeenCalled();
  });

  it("returns collection options for the signed-in user", async () => {
    auth.mockResolvedValue({ user: { id: "user-1" } });
    loadCollectionOptions.mockResolvedValue([
      { id: "col-1", name: "React Patterns" },
    ]);

    await expect(listCollectionOptions()).resolves.toEqual({
      success: true,
      data: [{ id: "col-1", name: "React Patterns" }],
      error: null,
    });
    expect(loadCollectionOptions).toHaveBeenCalledWith("user-1");
  });
});
