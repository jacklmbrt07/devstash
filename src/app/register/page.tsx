import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

async function RegisterContent() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <AuthCard
      title="Create an account"
      description="Save snippets, prompts, and notes in one place."
    >
      <RegisterForm />
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">
          Loading registration…
        </p>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
