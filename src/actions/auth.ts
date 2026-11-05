"use server";

import { headers } from "next/headers";
import { AuthError, CredentialsSignin } from "next-auth";

import { signIn, signOut } from "@/auth";
import { EMAIL_NOT_VERIFIED_MESSAGE } from "@/lib/auth/errors";
import { checkRateLimit, clientIp, rateLimitKey } from "@/lib/rate-limit";
import { rateLimitMessage } from "@/lib/rate-limit-message";

export interface AuthActionState {
  success: false;
  error: string;
}

function redirectTarget(value: FormDataEntryValue | null): string {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/dashboard";
}

function textValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function credentialsErrorMessage(error: CredentialsSignin): string {
  if (error.code === "email_not_verified") {
    return EMAIL_NOT_VERIFIED_MESSAGE;
  }
  return "Invalid email or password";
}

export async function signInWithCredentials(
  _previous: AuthActionState | null,
  formData: FormData,
): Promise<AuthActionState> {
  const email = textValue(formData.get("email")).toLowerCase();
  const password = formData.get("password");

  if (!email || typeof password !== "string" || password.length === 0) {
    return { success: false, error: "Email and password are required" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Enter a valid email address" };
  }

  const limit = await checkRateLimit(
    "login",
    rateLimitKey(clientIp(await headers()), email),
  );
  if (!limit.success) {
    return { success: false, error: rateLimitMessage(limit.reset) };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectTarget(formData.get("redirectTo")),
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return { success: false, error: credentialsErrorMessage(error) };
    }
    if (error instanceof AuthError) {
      const cause = error.cause;
      if (cause instanceof CredentialsSignin) {
        return { success: false, error: credentialsErrorMessage(cause) };
      }
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }

  return { success: false, error: "Could not sign in" };
}

export async function signInWithGitHub(formData: FormData) {
  await signIn("github", {
    redirectTo: redirectTarget(formData.get("redirectTo")),
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
