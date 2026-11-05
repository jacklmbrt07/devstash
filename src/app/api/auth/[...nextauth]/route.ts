import type { NextRequest } from "next/server";

import { handlers } from "@/auth";
import {
  checkRateLimit,
  clientIp,
  rateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";

function isCredentialsCallback(request: Request): boolean {
  return new URL(request.url).pathname.endsWith("/callback/credentials");
}

async function credentialsEmail(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.clone().json()) as { email?: unknown };
      return typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    }

    const form = await request.clone().formData();
    const value = form.get("email");
    return typeof value === "string" ? value.trim().toLowerCase() : "";
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  if (isCredentialsCallback(request)) {
    const email = await credentialsEmail(request);
    const result = await checkRateLimit(
      "login",
      rateLimitKey(clientIp(request.headers), email),
    );
    if (!result.success) return rateLimitResponse(result);
  }

  return handlers.POST(request);
}

export const GET = handlers.GET;
