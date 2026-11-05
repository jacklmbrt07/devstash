"use client";

import { useActionState } from "react";
import Link from "next/link";

import { resetPassword } from "@/actions/password-reset";
import { AuthField } from "@/components/auth/auth-field";
import { useRateLimitToast } from "@/components/auth/use-rate-limit-toast";
import { Button } from "@/components/ui/button";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(resetPassword, null);
  useRateLimitToast(state?.error);

  return (
    <div className="flex flex-col gap-4">
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <form action={formAction} className="flex flex-col gap-3" noValidate>
        <input type="hidden" name="token" value={token} />
        <AuthField
          id="reset-password"
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(state?.error)}
        />
        <AuthField
          id="reset-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(state?.error)}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </p>
    </div>
  );
}
