export interface SessionUser {
  name: string | null;
  email: string | null;
  image: string | null;
}

export function toSessionUser(user?: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}): SessionUser {
  return {
    name: user?.name ?? null,
    email: user?.email ?? null,
    image: user?.image ?? null,
  };
}

export function getInitials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] ?? "";
  return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
}

export function displayName(user: SessionUser): string {
  return user.name?.trim() || user.email || "Account";
}
