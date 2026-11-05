import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { buttonVariants } from "@/components/ui/button";
import {
  type PasswordResetTokenStatus,
  readPasswordResetToken,
} from "@/lib/auth/password-reset";
import { cn } from "cn";

function copyFor(status: PasswordResetTokenStatus): {
  title: string;
  description: string;
} {
  switch (status) {
    case "valid":
      return {
        title: "Choose a new password",
        description: "Enter a new password for your account.",
      };
    case "expired":
      return {
        title: "Link expired",
        description: "This reset link has expired. Request a new one.",
      };
    case "invalid":
      return {
        title: "Link invalid",
        description: "This reset link is invalid or has already been used.",
      };
  }
}

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const status = await readPasswordResetToken(token);
  const copy = copyFor(status);

  return (
    <AuthCard title={copy.title} description={copy.description}>
      {status === "valid" ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Link
          href="/forgot-password"
          className={cn(buttonVariants(), "w-full")}
        >
          Request a new link
        </Link>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">
          Loading password reset…
        </p>
      }
    >
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}
