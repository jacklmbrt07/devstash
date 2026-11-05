import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isRateLimitError,
  rateLimitMessage,
  retryAfterSeconds,
} from "./rate-limit-message";

const NOW = new Date("2026-11-04T12:00:00.000Z");

describe("retryAfterSeconds", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("rounds a future reset up to whole seconds", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    expect(retryAfterSeconds(Date.now() + 1_500)).toBe(2);
  });

  it("falls back to 60 seconds when the reset is missing or already past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    expect(retryAfterSeconds(Date.now())).toBe(60);
    expect(retryAfterSeconds(Number.NaN)).toBe(60);
  });
});

describe("rateLimitMessage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses a singular minute when under a minute remains", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    expect(rateLimitMessage(Date.now() + 30_000)).toBe(
      "Too many attempts. Please try again in 1 minute.",
    );
  });

  it("rounds up to whole minutes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    expect(rateLimitMessage(Date.now() + 61_000)).toBe(
      "Too many attempts. Please try again in 2 minutes.",
    );
  });
});

describe("isRateLimitError", () => {
  it("matches the rate-limit copy", () => {
    expect(
      isRateLimitError("Too many attempts. Please try again in 1 minute."),
    ).toBe(true);
  });

  it("rejects other messages", () => {
    expect(isRateLimitError("Invalid email or password")).toBe(false);
    expect(isRateLimitError(null)).toBe(false);
  });
});
