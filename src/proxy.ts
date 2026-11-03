import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  if (req.auth) return NextResponse.next();

  const signInUrl = req.nextUrl.clone();
  signInUrl.pathname = "/api/auth/signin";
  signInUrl.search = "";
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
