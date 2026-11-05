import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

async function ForgotPasswordContent() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email and we will send a reset link if an account exists."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">
          Loading password reset…
        </p>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
