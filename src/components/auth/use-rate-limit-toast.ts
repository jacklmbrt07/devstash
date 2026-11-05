"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { isRateLimitError } from "@/lib/rate-limit-message";

export function useRateLimitToast(message: string | null | undefined) {
  useEffect(() => {
    if (!isRateLimitError(message)) return;
    toast.error(message, { id: "auth-rate-limit" });
  }, [message]);
}
