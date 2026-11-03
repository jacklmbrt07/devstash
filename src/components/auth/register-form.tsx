"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";

interface RegisterResponse {
  success?: boolean;
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = readField(formData, "name");
    const email = readField(formData, "email").toLowerCase();
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!name || !email || typeof password !== "string" || typeof confirmPassword !== "string") {
      setError("Name, email, password, and confirm password are required");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      const body = (await response.json()) as RegisterResponse;
      if (!response.ok || !body.success) {
        setError(body.error ?? "Could not create the account");
        return;
      }
      router.push("/sign-in?registered=1");
    } catch {
      setError("Could not create the account");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        <AuthField
          id="register-name"
          label="Name"
          name="name"
          type="text"
          autoComplete="name"
          invalid={Boolean(error)}
        />
        <AuthField
          id="register-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          invalid={Boolean(error)}
        />
        <AuthField
          id="register-password"
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(error)}
        />
        <AuthField
          id="register-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(error)}
        />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
