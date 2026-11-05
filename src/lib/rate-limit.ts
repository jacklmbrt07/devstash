import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

import {
  type RateLimitCheck,
  rateLimitMessage,
  retryAfterSeconds,
} from "@/lib/rate-limit-message";

export type AuthRateLimit =
  | "login"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "resendVerification";

const LIMITS = {
  login: { tokens: 5, window: "15 m" },
  register: { tokens: 3, window: "1 h" },
  forgotPassword: { tokens: 3, window: "1 h" },
  resetPassword: { tokens: 5, window: "15 m" },
  resendVerification: { tokens: 3, window: "15 m" },
} as const satisfies Record<
  AuthRateLimit,
  { tokens: number; window: "15 m" | "1 h" }
>;

const limiters = new Map<AuthRateLimit, Ratelimit>();
let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  redis = url && token ? Redis.fromEnv() : null;
  return redis;
}

function getLimiter(name: AuthRateLimit): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  const existing = limiters.get(name);
  if (existing) return existing;

  const config = LIMITS[name];
  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(config.tokens, config.window),
    prefix: `devstash:auth:${name}`,
    timeout: 1000,
  });
  limiters.set(name, limiter);
  return limiter;
}

export function clientIp(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const ip = parts.at(-1);
    if (ip) return ip;
  }

  const realIp = headerList.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

export function rateLimitKey(ip: string, identifier?: string): string {
  const normalized = identifier?.trim().toLowerCase();
  return normalized ? `${ip}:${normalized}` : ip;
}

export async function checkRateLimit(
  name: AuthRateLimit,
  identifier: string,
): Promise<RateLimitCheck> {
  const allowance = LIMITS[name].tokens;
  const limiter = getLimiter(name);
  if (!limiter) {
    return { success: true, remaining: allowance, reset: Date.now() };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error(`Rate limit failed open for ${name}:`, error);
    return { success: true, remaining: allowance, reset: Date.now() };
  }
}

export function rateLimitResponse(result: RateLimitCheck): NextResponse {
  return NextResponse.json(
    { error: rateLimitMessage(result.reset) },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds(result.reset)) },
    },
  );
}
