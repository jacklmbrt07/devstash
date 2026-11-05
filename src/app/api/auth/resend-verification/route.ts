import { NextResponse } from "next/server";

import { resendEmailVerification } from "@/lib/auth/email-verification";
import {
  checkRateLimit,
  clientIp,
  rateLimitKey,
  rateLimitResponse,
} from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
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

  const limit = await checkRateLimit(
    "resendVerification",
    rateLimitKey(clientIp(request.headers), email),
  );
  if (!limit.success) return rateLimitResponse(limit);

  try {
    await resendEmailVerification({
      email,
      origin: new URL(request.url).origin,
    });
  } catch (error) {
    console.error("Verification resend failed:", error);
  }

  return NextResponse.json({ success: true });
}
