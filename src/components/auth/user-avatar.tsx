import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, type SessionUser } from "@/types/session-user";

interface UserAvatarProps {
  user: SessionUser;
  size?: "default" | "sm" | "lg";
}

export function UserAvatar({ user, size = "default" }: UserAvatarProps) {
  const initials = getInitials(user.name, user.email);

  return (
    <Avatar size={size}>
      {user.image ? <AvatarImage src={user.image} alt="" /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
