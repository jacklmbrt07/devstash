"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

interface RemoteImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

function shouldSkipOptimization(src: string): boolean {
  return (
    src.startsWith("blob:") ||
    src.startsWith("data:") ||
    /\.svg(?:\?|$)/i.test(src)
  );
}

/**
 * Optimized remote image for R2 (and blob previews during upload).
 * Parent must be `position: relative` with an explicit size.
 */
export function RemoteImage({
  src,
  alt,
  className,
  sizes = "100vw",
}: RemoteImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={shouldSkipOptimization(src)}
      className={cn(className)}
    />
  );
}
