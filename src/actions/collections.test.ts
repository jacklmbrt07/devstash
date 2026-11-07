import { afterEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => vi.fn());
const insertCollection = vi.hoisted(() => vi.fn());
const loadCollectionOptions = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  auth,
}));

vi.mock("@/lib/db/collections", () => ({
  createCollection: insertCollection,
  getCollectionOptions: loadCollectionOptions,
}));

import { createCollection, listCollectionOptions } from "./collections";

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
