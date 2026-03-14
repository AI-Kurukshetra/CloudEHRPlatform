import { NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase";
import { loginSchema } from "@/lib/schemas";
import { readRequestBody } from "@/lib/http";

export async function POST(request: Request) {
  const { data } = await readRequestBody(request);
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/login?error=invalid-login-payload", request.url), { status: 303 });
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return NextResponse.redirect(new URL("/login?error=invalid-credentials", request.url), { status: 303 });
  }

  const next = typeof (data as Record<string, unknown>).next === "string"
    ? (data as Record<string, string>).next || "/dashboard"
    : "/dashboard";

  return NextResponse.redirect(new URL(next, request.url), { status: 303 });
}
