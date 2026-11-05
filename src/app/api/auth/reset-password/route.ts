import { NextResponse } from "next/server";

import {
  resetPasswordError,
  resetPasswordWithToken,
} from "@/lib/auth/password-reset";
import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

interface ResetBody {
  token?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: ResetBody;
  try {
    body = (await request.json()) as ResetBody;
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON" },
      { status: 400 },
    );
  }

  const token = readText(body.token);
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!password || !confirmPassword) {
    return NextResponse.json(
      { error: "Password and confirm password are required" },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 },
    );
  }

  const limit = await checkRateLimit("resetPassword", clientIp(request.headers));
  if (!limit.success) return rateLimitResponse(limit);

  const result = await resetPasswordWithToken(token, password);
  if (!result.ok) {
    return NextResponse.json(
      { error: resetPasswordError(result.status) },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
