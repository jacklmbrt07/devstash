import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import {
  createEmailVerificationToken,
  deleteUserAndVerificationToken,
} from "@/lib/auth/email-verification";
import { sendVerificationEmail } from "@/lib/email/resend";
import { db } from "@/prisma/db";

const BCRYPT_ROUNDS = 12;

interface RegisterBody {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}

interface RegisteredUser {
  id: string;
  name: string | null;
  email: string;
}

type RegistrationInput =
  | { ok: true; name: string; email: string; password: string }
  | { ok: false; error: string };

function readText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

function validateRegistration(body: RegisterBody): RegistrationInput {
  const name = readText(body.name);
  const email = readText(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!name || !email || !password || !confirmPassword) {
    return {
      ok: false,
      error: "Name, email, password, and confirmPassword are required",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address" };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match" };
  }

  return { ok: true, name, email, password };
}

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return errorResponse("Request body must be JSON", 400);
  }

  const input = validateRegistration(body);
  if (!input.ok) return errorResponse(input.error, 400);

  try {
    const existing = await db.orm.public.User.where({
      email: input.email,
    }).first();
    if (existing) {
      return errorResponse("An account with this email already exists", 409);
    }

    const passwordHash = await hash(input.password, BCRYPT_ROUNDS);
    const user = await db.orm.public.User.create({
      name: input.name,
      email: input.email,
      password: passwordHash,
    });

    const { token } = await createEmailVerificationToken(input.email);
    const verifyUrl = new URL("/verify-email", request.url);
    verifyUrl.searchParams.set("token", token);

    const emailed = await sendVerificationEmail({
      to: input.email,
      name: input.name,
      verifyUrl: verifyUrl.toString(),
    });

    if (!emailed.ok) {
      await deleteUserAndVerificationToken({
        userId: user.id,
        email: input.email,
        token,
      });
      return errorResponse(
        "Could not send the verification email. Try again in a moment.",
        502,
      );
    }

    const data: RegisteredUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Registration failed:", error);
    return errorResponse("Could not create the account", 500);
  }
}
