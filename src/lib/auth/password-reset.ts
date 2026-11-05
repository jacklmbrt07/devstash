import { randomBytes } from "node:crypto";

import { hash } from "bcryptjs";

import { sendPasswordResetEmail } from "@/lib/email/resend";
import { db } from "@/prisma/db";

import {
  deleteVerificationToken,
  deleteVerificationTokensForIdentifier,
  emailFromPasswordResetIdentifier,
  isPasswordResetIdentifier,
  parseTimestamp,
  passwordResetIdentifier,
  toTimestamp,
} from "@/lib/auth/verification-token";

const TOKEN_TTL_MS = 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

export type PasswordResetTokenStatus = "valid" | "expired" | "invalid";

export async function createPasswordResetToken(
  email: string,
): Promise<{ token: string; expires: Date }> {
  const identifier = passwordResetIdentifier(email);
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await deleteVerificationTokensForIdentifier(identifier);
  await db.orm.public.VerificationToken.create({
    identifier,
    token,
    expires: toTimestamp(expires),
  });

  return { token, expires };
}

export async function requestPasswordResetEmail(options: {
  email: string;
  origin: string;
}): Promise<void> {
  const user = await db.orm.public.User.where({
    email: options.email,
  }).first();
  if (!user?.password) return;

  const { token } = await createPasswordResetToken(options.email);
  const resetUrl = new URL("/reset-password", options.origin);
  resetUrl.searchParams.set("token", token);

  const emailed = await sendPasswordResetEmail({
    to: options.email,
    name: user.name?.trim() || "there",
    resetUrl: resetUrl.toString(),
  });

  if (!emailed.ok) {
    console.error("Password reset email failed:", emailed.error);
    await deleteVerificationToken(passwordResetIdentifier(options.email), token);
  }
}

async function findResetRecord(token: string) {
  if (!token) return null;

  const record = await db.orm.public.VerificationToken.where({
    token,
  }).first();
  if (!record || !isPasswordResetIdentifier(record.identifier)) return null;

  const email = emailFromPasswordResetIdentifier(record.identifier);
  if (!email) return null;

  return { record, email };
}

export async function readPasswordResetToken(
  token: string,
): Promise<PasswordResetTokenStatus> {
  const found = await findResetRecord(token);
  if (!found) return "invalid";

  const expires = parseTimestamp(found.record.expires);
  if (Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
    await deleteVerificationToken(found.record.identifier, found.record.token);
    return "expired";
  }

  const user = await db.orm.public.User.where({ email: found.email }).first();
  if (!user?.password) {
    await deleteVerificationToken(found.record.identifier, found.record.token);
    return "invalid";
  }

  return "valid";
}

export async function resetPasswordWithToken(
  token: string,
  password: string,
): Promise<{ ok: true } | { ok: false; status: "expired" | "invalid" }> {
  const found = await findResetRecord(token);
  if (!found) return { ok: false, status: "invalid" };

  const expires = parseTimestamp(found.record.expires);
  if (Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
    await deleteVerificationToken(found.record.identifier, found.record.token);
    return { ok: false, status: "expired" };
  }

  const user = await db.orm.public.User.where({ email: found.email }).first();
  if (!user?.password) {
    await deleteVerificationToken(found.record.identifier, found.record.token);
    return { ok: false, status: "invalid" };
  }

  const passwordHash = await hash(password, BCRYPT_ROUNDS);
  await db.orm.public.User.where({ id: user.id }).update({
    password: passwordHash,
  });
  await deleteVerificationToken(found.record.identifier, found.record.token);

  return { ok: true };
}
