import type { NextConfig } from "next";

function r2RemotePattern(): URL | undefined {
  const raw = process.env.R2_PUBLIC_URL?.trim();
  if (!raw) return undefined;
  try {
    const base = new URL(raw.endsWith("/") ? raw : `${raw}/`);
    return new URL("**", base);
  } catch {
    return undefined;
  }
}

const r2Pattern = r2RemotePattern();

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: r2Pattern ? [r2Pattern] : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
