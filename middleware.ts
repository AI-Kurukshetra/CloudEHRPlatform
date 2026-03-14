import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { canAccessPath, extractRoleFromMetadata } from "@/lib/auth";
import { createSupabaseMiddlewareClient } from "@/lib/supabase";

const protectedPrefixes = [
  "/dashboard",
  "/patients",
  "/appointments",
  "/prescriptions",
  "/labs",
  "/reports",
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
    "/patients/:path*",
    "/appointments/:path*",
    "/prescriptions/:path*",
    "/labs/:path*",
    "/reports/:path*",
    "/admin/:path*"
  ]
};
