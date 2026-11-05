import { NextResponse } from "next/server";

import { requestPasswordResetEmail } from "@/lib/auth/password-reset";
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = readEmail(body.email);
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON" },
      { status: 400 },
    );
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 400 },
    );
  }

  const limit = await checkRateLimit("forgotPassword", clientIp(request.headers));
  if (!limit.success) return rateLimitResponse(limit);

  try {
    await requestPasswordResetEmail({
      email,
      origin: new URL(request.url).origin,
    });
  } catch (error) {
    console.error("Password reset request failed:", error);
  }

  return NextResponse.json({ success: true });
}
