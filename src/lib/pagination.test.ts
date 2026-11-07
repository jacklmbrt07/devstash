import { describe, expect, it } from "vitest";

import {
  getPaginationState,
  pageHref,
  parsePageParam,
} from "./pagination";

describe("parsePageParam", () => {
  it("defaults to 1 for missing or invalid values", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("")).toBe(1);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-3")).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
  });

  it("parses a positive page number", () => {
    expect(parsePageParam("2")).toBe(2);
    expect(parsePageParam(["4", "9"])).toBe(4);
  });
});

describe("getPaginationState", () => {
  it("clamps the page into range and computes offsets", () => {
    expect(getPaginationState(1, 21, 45)).toEqual({
      page: 1,
      pageSize: 21,
      total: 45,
      totalPages: 3,
      offset: 0,
      hasPrev: false,
      hasNext: true,
    });

    expect(getPaginationState(99, 21, 45)).toMatchObject({
      page: 3,
      offset: 42,
      hasPrev: true,
      hasNext: false,
    });
  });

  it("treats an empty result as a single empty page", () => {
    expect(getPaginationState(1, 21, 0)).toMatchObject({
      page: 1,
      totalPages: 1,
      hasPrev: false,
      hasNext: false,
    });
  });
});

describe("pageHref", () => {
  it("omits the query on page 1", () => {
    expect(pageHref("/items/snippets", 1)).toBe("/items/snippets");
  });

  it("adds the page query for later pages", () => {
    expect(pageHref("/collections/abc", 3)).toBe("/collections/abc?page=3");
  });
});
