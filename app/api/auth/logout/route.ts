import { NextResponse } from "next/server";

import { createSupabaseRouteHandlerClient } from "@/lib/supabase";
import { wantsJson } from "@/lib/http";

export async function POST(request: Request) {
  const supabase = await createSupabaseRouteHandlerClient();
  await supabase.auth.signOut();

  return wantsJson(request)
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
