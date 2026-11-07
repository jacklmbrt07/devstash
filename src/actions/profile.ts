"use server";

import { compare, hash } from "bcryptjs";

import { auth, signOut } from "@/auth";
import { BCRYPT_ROUNDS } from "@/lib/auth/bcrypt";
import {
  deleteVerificationTokensForIdentifier,
  passwordResetIdentifier,
} from "@/lib/auth/verification-token";
import { db } from "@/prisma/db";

export interface ProfileActionState {
  success: boolean;
  error?: string;
}

function passwordValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

async function currentUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  return db.orm.public.User.where({ id: userId }).first();
}

export async function changePassword(
  _previous: ProfileActionState | null,
  formData: FormData,
): Promise<ProfileActionState> {
  const currentPassword = passwordValue(formData.get("currentPassword"));
  const password = passwordValue(formData.get("password"));
  const confirmPassword = passwordValue(formData.get("confirmPassword"));

  if (!currentPassword || !password || !confirmPassword) {
    return {
      success: false,
      error: "Current password, new password, and confirmation are required",
    };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  if (password === currentPassword) {
    return {
      success: false,
      error: "New password must be different from the current password",
    };
  }

  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Sign in to change your password" };
    }

    if (!user.password) {
      return {
        success: false,
        error: "Password changes are only available for email accounts",
      };
    }

    const valid = await compare(currentPassword, user.password);
    if (!valid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const passwordHash = await hash(password, BCRYPT_ROUNDS);
    await db.orm.public.User.where({ id: user.id }).update({
      password: passwordHash,
    });
  } catch (error) {
    console.error("Password change failed:", error);
    return { success: false, error: "Could not update the password" };
  }

  return { success: true };
}

export async function deleteAccount(
  _previous: ProfileActionState | null,
  _formData: FormData,
): Promise<ProfileActionState> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Sign in to delete your account" };
    }

    await deleteVerificationTokensForIdentifier(user.email);
    await deleteVerificationTokensForIdentifier(
      passwordResetIdentifier(user.email),
    );
    await db.orm.public.User.where({ id: user.id }).delete();
  } catch (error) {
    console.error("Account deletion failed:", error);
    return { success: false, error: "Could not delete the account" };
  }

  await signOut({ redirectTo: "/sign-in" });
  return { success: true };
}
