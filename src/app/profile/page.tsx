import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProfileView } from "@/components/profile/profile-view";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { getProfile } from "@/lib/db/profile";
import { toSessionUser } from "@/types/session-user";

export const metadata: Metadata = {
  title: "Profile · DevStash",
};

async function ProfileContent() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [profile, itemTypes, collections] = await Promise.all([
    getProfile(session.user.id),
    getSidebarItemTypes(),
    getSidebarCollections(session.user.id),
  ]);

  if (!profile) redirect("/sign-in");

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={collections}
      user={toSessionUser(session.user)}
    >
      <ProfileView profile={profile} />
    </DashboardShell>
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
