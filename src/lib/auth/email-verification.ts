import { randomBytes } from "node:crypto";

import { isEmailVerificationEnabled } from "@/lib/auth/email-verification-config";
import {
  deleteVerificationToken,
  deleteVerificationTokensForIdentifier,
  isPasswordResetIdentifier,
  parseTimestamp,
  toTimestamp,
} from "@/lib/auth/verification-token";
import { sendVerificationEmail } from "@/lib/email/resend";
import { db } from "@/prisma/db";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function emailVerifiedNow(): string {
  return toTimestamp(new Date());
}

export type VerifyEmailResult =
  | { status: "success" }
  | { status: "already_verified" }
  | { status: "expired" }
  | { status: "invalid" };

export async function createEmailVerificationToken(
  email: string,
): Promise<{ token: string; expires: Date }> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await db.orm.public.VerificationToken.create({
    identifier: email,
    token,
    expires: toTimestamp(expires),
  });

  return { token, expires };
}

export async function verifyEmailToken(
  token: string,
): Promise<VerifyEmailResult> {
  if (!token) return { status: "invalid" };

  const record = await db.orm.public.VerificationToken.where({
    token,
  }).first();
  if (!record || isPasswordResetIdentifier(record.identifier)) {
    return { status: "invalid" };
  }

  const expires = parseTimestamp(record.expires);
  if (Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
    await deleteVerificationToken(record.identifier, record.token);
    return { status: "expired" };
  }

  const user = await db.orm.public.User.where({
    email: record.identifier,
  }).first();
  if (!user) {
    await deleteVerificationToken(record.identifier, record.token);
    return { status: "invalid" };
  }

  if (user.emailVerified) {
    await deleteVerificationToken(record.identifier, record.token);
    return { status: "already_verified" };
  }

  await db.orm.public.User.where({ id: user.id }).update({
    emailVerified: toTimestamp(new Date()),
  });
  await deleteVerificationToken(record.identifier, record.token);

  return { status: "success" };
}

export async function resendEmailVerification(options: {
  email: string;
  origin: string;
}): Promise<void> {
  if (!isEmailVerificationEnabled()) return;

  const user = await db.orm.public.User.where({
    email: options.email,
  }).first();
  if (!user || user.emailVerified) return;

  await deleteVerificationTokensForIdentifier(options.email);
  const { token } = await createEmailVerificationToken(options.email);
  const verifyUrl = new URL("/verify-email", options.origin);
  verifyUrl.searchParams.set("token", token);

  const emailed = await sendVerificationEmail({
    to: options.email,
    name: user.name?.trim() || "there",
    verifyUrl: verifyUrl.toString(),
  });
  if (emailed.ok) return;

  console.error("Resend verification email failed:", emailed.error);
  await deleteVerificationToken(options.email, token);
}

export async function deleteUserAndVerificationToken(options: {
  userId: string;
  email: string;
  token: string;
}) {
  await deleteVerificationToken(options.email, options.token);
  await db.orm.public.User.where({ id: options.userId }).delete();
}
