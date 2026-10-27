const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatAbsoluteDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(isoDate: string, now: Date): string {
  const then = new Date(isoDate).getTime();
  const diff = Math.max(0, now.getTime() - then);

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes}m ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }
  if (diff < DAY * 2) return "Yesterday";
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }

  const weeks = Math.floor(diff / WEEK);
  if (weeks < 5) return `${weeks}w ago`;

  return formatAbsoluteDate(isoDate);
}
