import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { canAccessPath, extractRoleFromMetadata } from "@/lib/auth";
import { createSupabaseMiddlewareClient } from "@/lib/supabase";

const protectedPrefixes = [
  "/dashboard",
  "/portal",
  "/patients",
  "/appointments",
  "/encounters",
  "/prescriptions",
  "/labs",
  "/immunizations",
  "/billing",
  "/providers",
  "/reports",
  "/audit",
  "/admin"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const { supabase, response } = createSupabaseMiddlewareClient(request);
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const role = extractRoleFromMetadata(user.app_metadata as Record<string, unknown> | undefined);

  if (!role) {
    return NextResponse.redirect(new URL("/login?error=profile-incomplete", request.url));
  }

  if (!canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard?denied=1", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    "/patients/:path*",
    "/appointments/:path*",
    "/encounters/:path*",
    "/prescriptions/:path*",
    "/labs/:path*",
    "/immunizations/:path*",
    "/billing/:path*",
    "/providers/:path*",
    "/reports/:path*",
    "/audit/:path*",
    "/admin/:path*"
  ]
};