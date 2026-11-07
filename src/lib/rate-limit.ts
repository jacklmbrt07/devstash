import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

import {
  type RateLimitCheck,
  rateLimitMessage,
  retryAfterSeconds,
} from "@/lib/rate-limit-message";

export type RateLimitName =
  | "login"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "resendVerification"
  | "upload";

const LIMITS = {
  login: { tokens: 5, window: "15 m" },
  register: { tokens: 3, window: "1 h" },
  forgotPassword: { tokens: 3, window: "1 h" },
  resetPassword: { tokens: 5, window: "15 m" },
  resendVerification: { tokens: 3, window: "15 m" },
  upload: { tokens: 30, window: "1 h" },
} as const satisfies Record<
  RateLimitName,
  { tokens: number; window: "15 m" | "1 h" }
>;

const limiters = new Map<RateLimitName, Ratelimit>();
let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  redis = url && token ? Redis.fromEnv() : null;
  return redis;
}

function getLimiter(name: RateLimitName): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;

  const existing = limiters.get(name);
  if (existing) return existing;

  const config = LIMITS[name];
  const prefix =
    name === "upload" ? "devstash:upload" : `devstash:auth:${name}`;
  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(config.tokens, config.window),
    prefix,
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
  name: RateLimitName,
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
