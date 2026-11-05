import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";
import { registrationSuccessMessage } from "@/lib/auth/email-verification-config";
import { EMAIL_NOT_VERIFIED_MESSAGE } from "@/lib/auth/errors";

function callbackPath(raw: string | undefined, host: string | null): string {
  if (!raw) return "/dashboard";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const url = new URL(raw);
    if (host && url.host === host) return `${url.pathname}${url.search}`;
  } catch {
    return "/dashboard";
  }
  return "/dashboard";
}

async function SignInContent({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    code?: string;
    error?: string;
    registered?: string;
    reset?: string;
  }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;
  const host = (await headers()).get("host");
  const initialError =
    params.error === "CredentialsSignin"
      ? params.code === "email_not_verified"
        ? EMAIL_NOT_VERIFIED_MESSAGE
        : "Invalid email or password"
      : undefined;

  return (
    <AuthCard
      title="Sign in"
      description="Use your email or GitHub account."
    >
      <SignInForm
        redirectTo={callbackPath(params.callbackUrl, host)}
        registrationMessage={
          params.registered === "1" ? registrationSuccessMessage() : undefined
        }
        resetMessage={
          params.reset === "1"
            ? "Your password was updated. You can sign in now."
            : undefined
        }
        initialError={initialError}
      />
    </AuthCard>
  );
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    code?: string;
    error?: string;
    registered?: string;
    reset?: string;
  }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">Loading sign in…</p>
      }
    >
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}
