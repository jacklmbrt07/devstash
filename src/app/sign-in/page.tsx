import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

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
    error?: string;
    registered?: string;
  }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;
  const host = (await headers()).get("host");

  return (
    <AuthCard
      title="Sign in"
      description="Use your email or GitHub account."
    >
      <SignInForm
        redirectTo={callbackPath(params.callbackUrl, host)}
        registered={params.registered === "1"}
        initialError={
          params.error === "CredentialsSignin"
            ? "Invalid email or password"
            : undefined
        }
      />
    </AuthCard>
  );
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    registered?: string;
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
