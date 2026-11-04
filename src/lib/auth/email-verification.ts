import { randomBytes } from "node:crypto";

import { db } from "@/prisma/db";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type VerifyEmailResult =
  | { status: "success" }
  | { status: "already_verified" }
  | { status: "expired" }
  | { status: "invalid" };

function toTimestamp(date: Date): string {
  return date.toISOString().replace(/Z$/, "");
}

function parseTimestamp(value: string): Date {
  const hasZone = value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value);
  const normalized = hasZone
    ? value
    : `${value.includes("T") ? value : value.replace(" ", "T")}Z`;
  return new Date(normalized);
}

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
  if (!record) return { status: "invalid" };

  const expires = parseTimestamp(record.expires);
  if (Number.isNaN(expires.getTime()) || expires.getTime() <= Date.now()) {
    await db.orm.public.VerificationToken.where({
      identifier: record.identifier,
      token: record.token,
    }).delete();
    return { status: "expired" };
  }

  const user = await db.orm.public.User.where({
    email: record.identifier,
  }).first();
  if (!user) {
    await db.orm.public.VerificationToken.where({
      identifier: record.identifier,
      token: record.token,
    }).delete();
    return { status: "invalid" };
  }

  if (user.emailVerified) {
    await db.orm.public.VerificationToken.where({
      identifier: record.identifier,
      token: record.token,
    }).delete();
    return { status: "already_verified" };
  }

  await db.orm.public.User.where({ id: user.id }).update({
    emailVerified: toTimestamp(new Date()),
  });
  await db.orm.public.VerificationToken.where({
    identifier: record.identifier,
    token: record.token,
  }).delete();

  return { status: "success" };
}

export async function deleteUserAndVerificationToken(options: {
  userId: string;
  email: string;
  token: string;
}) {
  await db.orm.public.VerificationToken.where({
    identifier: options.email,
    token: options.token,
  }).delete();
  await db.orm.public.User.where({ id: options.userId }).delete();
}
