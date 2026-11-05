"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { signInWithCredentials, signInWithGitHub } from "@/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { useRateLimitToast } from "@/components/auth/use-rate-limit-toast";
import { Button } from "@/components/ui/button";
import { EMAIL_NOT_VERIFIED_MESSAGE } from "@/lib/auth/errors";
import { isRateLimitError } from "@/lib/rate-limit-message";

interface SignInFormProps {
  redirectTo: string;
  registrationMessage?: string;
  resetMessage?: string;
  initialError?: string;
}

export function SignInForm({
  redirectTo,
  registrationMessage,
  resetMessage,
  initialError,
}: SignInFormProps) {
  const [state, formAction, pending] = useActionState(
    signInWithCredentials,
    null,
  );
  const [resending, setResending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const error = state?.error ?? initialError;
  useRateLimitToast(error);

  useEffect(() => {
    if (!registrationMessage) return;
    toast.success(registrationMessage, {
      id: "registration-success",
    });
  }, [registrationMessage]);

  useEffect(() => {
    if (!resetMessage) return;
    toast.success(resetMessage, {
      id: "password-reset-success",
    });
  }, [resetMessage]);

  async function resendVerification() {
    const emailInput = formRef.current?.elements.namedItem("email");
    const email =
      emailInput instanceof HTMLInputElement
        ? emailInput.value.trim().toLowerCase()
        : "";
    if (!email) return;

    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await response.json()) as { error?: string };
      if (response.status === 429 || isRateLimitError(body.error)) {
        toast.error(
          body.error ?? "Too many attempts. Please try again in 15 minutes.",
          { id: "auth-rate-limit" },
        );
        return;
      }
      if (!response.ok) {
        toast.error(body.error ?? "Could not resend the verification email");
        return;
      }
      toast.success("If an unverified account exists, we sent another email.", {
        id: "resend-verification",
      });
    } catch {
      toast.error("Could not resend the verification email");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3"
        noValidate
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <AuthField
          id="sign-in-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          invalid={Boolean(error)}
        />
        <AuthField
          id="sign-in-password"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(error)}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        {error === EMAIL_NOT_VERIFIED_MESSAGE ? (
          <Button
            type="button"
            variant="outline"
            disabled={resending}
            className="w-full"
            onClick={resendVerification}
          >
            {resending ? "Sending…" : "Resend verification email"}
          </Button>
        ) : null}
      </form>

      <form action={signInWithGitHub}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Button type="submit" variant="outline" className="w-full">
          Sign in with GitHub
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/register" className="text-foreground underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
