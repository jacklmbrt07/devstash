import { Folder, Layers } from "lucide-react";

import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { UserAvatar } from "@/components/auth/user-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getItemTypeLabel,
  ITEM_TYPE_ICONS,
} from "@/lib/constants/item-types";
import type { Profile } from "@/lib/db/profile";
import { formatAbsoluteDate } from "@/lib/format-relative-time";
import { displayName } from "@/types/session-user";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Layers;
}) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-1 text-2xl tabular-nums">{value}</CardTitle>
        </div>
        <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function ProfileView({ profile }: { profile: Profile }) {
  const user = {
    name: profile.name,
    email: profile.email,
    image: profile.image,
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <UserAvatar user={user} size="lg" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {displayName(user)}
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Account details for this sign-in.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="truncate text-sm font-medium">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Member since</dt>
              <dd className="text-sm font-medium">
                {formatAbsoluteDate(profile.createdAt)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Items"
          value={profile.itemCount}
          hint="Across all types"
          icon={Layers}
        />
        <StatCard
          label="Collections"
          value={profile.collectionCount}
          hint="Organized groups"
          icon={Folder}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items by type</CardTitle>
          <CardDescription>How your saved items are split.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1">
            {profile.itemTypes.map((type) => {
              const Icon = ITEM_TYPE_ICONS[type.name];
              return (
                <li
                  key={type.name}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <span
                    className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-4"
                    style={{ color: type.color }}
                  >
                    {Icon ? <Icon /> : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {getItemTypeLabel(type.name)}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {type.count}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {profile.canChangePassword
              ? "Update your password or delete this account."
              : "This account signs in with GitHub."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile.canChangePassword ? <ChangePasswordDialog /> : null}
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
