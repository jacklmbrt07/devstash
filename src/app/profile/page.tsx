import { Suspense } from "react";
import Link from "next/link";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/auth/user-avatar";
import { toSessionUser } from "@/types/session-user";

async function ProfileContent() {
  const session = await auth();
  const user = toSessionUser(session?.user);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {user.name || "Profile"}
          </h1>
          {user.email ? (
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          ) : null}
        </div>
      </div>
      <Link
        href="/dashboard"
        className="text-sm text-foreground underline-offset-4 hover:underline"
      >
        Back to dashboard
      </Link>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-muted-foreground">Loading profile…</p>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
