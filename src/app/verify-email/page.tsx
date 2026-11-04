import Link from "next/link";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { buttonVariants } from "@/components/ui/button";
import {
  type VerifyEmailResult,
  verifyEmailToken,
} from "@/lib/auth/email-verification";
import { cn } from "cn";

function copyFor(result: VerifyEmailResult): {
  title: string;
  description: string;
} {
  switch (result.status) {
    case "success":
      return {
        title: "Email verified",
        description: "Your email is confirmed. You can sign in now.",
      };
    case "already_verified":
      return {
        title: "Already verified",
        description: "This email is already verified. You can sign in.",
      };
    case "expired":
      return {
        title: "Link expired",
        description:
          "This verification link has expired. Create a new account or contact support if you need help.",
      };
    case "invalid":
      return {
        title: "Link invalid",
        description:
          "This verification link is invalid or has already been used.",
      };
  }
}

async function VerifyEmailContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const result = token
    ? await verifyEmailToken(token)
    : ({ status: "invalid" } satisfies VerifyEmailResult);
  const copy = copyFor(result);
  const canSignIn =
    result.status === "success" || result.status === "already_verified";

  return (
    <AuthCard title={copy.title} description={copy.description}>
      <Link
        href={canSignIn ? "/sign-in" : "/register"}
        className={cn(buttonVariants(), "w-full")}
      >
        {canSignIn ? "Sign in" : "Back to register"}
      </Link>
    </AuthCard>
  );
}

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">
          Verifying email…
        </p>
      }
    >
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}
