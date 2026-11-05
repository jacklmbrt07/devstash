export interface RateLimitCheck {
  success: boolean;
  remaining: number;
  reset: number;
}

const RATE_LIMIT_PREFIX = "Too many attempts.";

export function retryAfterSeconds(reset: number): number {
  if (!Number.isFinite(reset) || reset <= Date.now()) return 60;
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}

export function rateLimitMessage(reset: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds(reset) / 60));
  const unit = minutes === 1 ? "minute" : "minutes";
  return `${RATE_LIMIT_PREFIX} Please try again in ${minutes} ${unit}.`;
}

export function isRateLimitError(message: string | null | undefined): boolean {
  return typeof message === "string" && message.startsWith(RATE_LIMIT_PREFIX);
}
