import Link from "next/link";

import { UserAvatar } from "@/components/auth/user-avatar";
import type { SessionUser } from "@/types/session-user";

interface UserMenuProps {
  user: SessionUser;
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <Link
      href="/profile"
      aria-label="Go to profile"
      title="Profile"
      className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <UserAvatar user={user} size="sm" />
    </Link>
  );
}
