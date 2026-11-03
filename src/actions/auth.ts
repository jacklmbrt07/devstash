"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

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

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectTarget(formData.get("redirectTo")),
    });
  } catch (error) {
    if (error instanceof AuthError) {
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
