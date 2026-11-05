"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  requestPasswordResetEmail,
  resetPasswordError,
  resetPasswordWithToken,
} from "@/lib/auth/password-reset";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { rateLimitMessage } from "@/lib/rate-limit-message";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ForgotPasswordState {
  status: "sent" | "error";
  error?: string;
}

export interface ResetPasswordState {
  error: string;
}

function textValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function requestOrigin(headerList: Headers): string | null {
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return null;
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function requestPasswordReset(
  _previous: ForgotPasswordState | null,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = textValue(formData.get("email")).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", error: "Enter a valid email address" };
  }

  const limit = await checkRateLimit(
    "forgotPassword",
    clientIp(await headers()),
  );
  if (!limit.success) {
    return { status: "error", error: rateLimitMessage(limit.reset) };
  }

  try {
    const origin = requestOrigin(await headers());
    if (!origin) {
      console.error("Password reset request failed: missing host");
    } else {
      await requestPasswordResetEmail({ email, origin });
    }
  } catch (error) {
    console.error("Password reset request failed:", error);
  }

  return { status: "sent" };
}

export async function resetPassword(
  _previous: ResetPasswordState | null,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = textValue(formData.get("token"));
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (
    typeof password !== "string" ||
    password.length === 0 ||
    typeof confirmPassword !== "string" ||
    confirmPassword.length === 0
  ) {
    return { error: "Password and confirm password are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const limit = await checkRateLimit(
    "resetPassword",
    clientIp(await headers()),
  );
  if (!limit.success) {
    return { error: rateLimitMessage(limit.reset) };
  }

  const result = await resetPasswordWithToken(token, password);
  if (!result.ok) {
    return { error: resetPasswordError(result.status) };
  }

  redirect("/sign-in?reset=1");
}
