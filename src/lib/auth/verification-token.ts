import { db } from "@/prisma/db";

export const PASSWORD_RESET_IDENTIFIER_PREFIX = "reset:";

export function isPasswordResetIdentifier(identifier: string): boolean {
  return identifier.startsWith(PASSWORD_RESET_IDENTIFIER_PREFIX);
}

export function passwordResetIdentifier(email: string): string {
  return `${PASSWORD_RESET_IDENTIFIER_PREFIX}${email}`;
}

export function emailFromPasswordResetIdentifier(
  identifier: string,
): string | null {
  if (!isPasswordResetIdentifier(identifier)) return null;
  const email = identifier.slice(PASSWORD_RESET_IDENTIFIER_PREFIX.length);
  return email.length > 0 ? email : null;
}

export function toTimestamp(date: Date): string {
  return date.toISOString().replace(/Z$/, "");
}

export function parseTimestamp(value: string): Date {
  const hasZone = value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value);
  const normalized = hasZone
    ? value
    : `${value.includes("T") ? value : value.replace(" ", "T")}Z`;
  return new Date(normalized);
}

export async function deleteVerificationToken(
  identifier: string,
  token: string,
) {
  await db.execute(
    db.raw
      .sql`DELETE FROM verification_tokens WHERE identifier = ${identifier} AND token = ${token}`
      .affectedCount()
      .build(),
  );
}

export async function deleteVerificationTokensForIdentifier(
  identifier: string,
) {
  await db.execute(
    db.raw
      .sql`DELETE FROM verification_tokens WHERE identifier = ${identifier}`
      .affectedCount()
      .build(),
  );
}
