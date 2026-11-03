"use client";

import { useActionState } from "react";
import Link from "next/link";

import { signInWithCredentials, signInWithGitHub } from "@/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";

interface SignInFormProps {
  redirectTo: string;
  registered: boolean;
  initialError?: string;
}

export function SignInForm({
  redirectTo,
  registered,
  initialError,
}: SignInFormProps) {
  const [state, formAction, pending] = useActionState(
    signInWithCredentials,
    null,
  );
  const error = state?.error ?? initialError;

  return (
    <div className="flex flex-col gap-4">
      {registered ? (
        <p className="text-sm text-muted-foreground" role="status">
          Account created. Sign in to continue.
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <form action={formAction} className="flex flex-col gap-3" noValidate>
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
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
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
