import { afterEach, describe, expect, it, vi } from "vitest";

const checkRateLimit = vi.hoisted(() => vi.fn());
const clientIp = vi.hoisted(() => vi.fn());
const headers = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  headers,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/password-reset", () => ({
  requestPasswordResetEmail: vi.fn(),
  resetPasswordError: vi.fn(),
  resetPasswordWithToken: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit,
  clientIp,
}));

import { requestPasswordReset } from "./password-reset";

describe("requestPasswordReset", () => {
  afterEach(() => {
    vi.useRealTimers();
    checkRateLimit.mockReset();
    clientIp.mockReset();
    headers.mockReset();
  });

  it("rejects an invalid email before checking the rate limit", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");

    await expect(requestPasswordReset(null, formData)).resolves.toEqual({
      status: "error",
      error: "Enter a valid email address",
    });
    expect(checkRateLimit).not.toHaveBeenCalled();
  });

  it("returns the rate-limit message when the limiter blocks the request", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-04T12:00:00.000Z"));
    headers.mockResolvedValue(new Headers());
    clientIp.mockReturnValue("203.0.113.10");
    checkRateLimit.mockResolvedValue({
      success: false,
      remaining: 0,
      reset: Date.now() + 60_000,
    });

    const formData = new FormData();
    formData.set("email", "ada@example.com");

    await expect(requestPasswordReset(null, formData)).resolves.toEqual({
      status: "error",
      error: "Too many attempts. Please try again in 1 minute.",
    });
    expect(checkRateLimit).toHaveBeenCalledWith(
      "forgotPassword",
      "203.0.113.10",
    );
  });
});
