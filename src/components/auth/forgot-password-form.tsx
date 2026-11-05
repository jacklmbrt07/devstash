"use client";

import { useActionState } from "react";
import Link from "next/link";

import { requestPasswordReset } from "@/actions/password-reset";
import { AuthField } from "@/components/auth/auth-field";
import { useRateLimitToast } from "@/components/auth/use-rate-limit-toast";
import { Button } from "@/components/ui/button";

const CONFIRMATION =
  "If an account with that email exists, we sent a link to reset your password.";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    null,
  );
  useRateLimitToast(state?.error);

  if (state?.status === "sent") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{CONFIRMATION}</p>
        <Link
          href="/sign-in"
          className="text-center text-sm text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <form action={formAction} className="flex flex-col gap-3" noValidate>
        <AuthField
          id="forgot-password-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          invalid={Boolean(state?.error)}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/sign-in"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
