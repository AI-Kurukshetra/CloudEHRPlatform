import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { clinicalNoteSchema } from "@/lib/schemas";
import { logAuditAction } from "@/lib/repositories";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor", "staff", "patient"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encounterId = new URL(request.url).searchParams.get("encounterId");
  if (!encounterId) {
    return NextResponse.json({ error: "Encounter id is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("clinical_notes").select("id, encounter_id, subjective, objective, assessment, plan, created_at, updated_at").eq("encounter_id", encounterId).maybeSingle();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = clinicalNoteSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.encounterId) {
    return NextResponse.json({ error: "Invalid clinical note payload" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("clinical_notes").upsert({
    id: randomUUID(),
    encounter_id: parsed.data.encounterId,
    subjective: parsed.data.subjective,
    objective: parsed.data.objective,
    assessment: parsed.data.assessment,
    plan: parsed.data.plan,
    updated_at: new Date().toISOString()
  }, { onConflict: "encounter_id" }).select("id, encounter_id, subjective, objective, assessment, plan, created_at, updated_at").maybeSingle();
  await logAuditAction(session.id, `Saved clinical note for encounter ${parsed.data.encounterId}`);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encounterId = new URL(request.url).searchParams.get("encounterId");
  if (!encounterId) {
    return NextResponse.json({ error: "Encounter id is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  await supabase.from("clinical_notes").delete().eq("encounter_id", encounterId);
  await logAuditAction(session.id, `Deleted clinical note for encounter ${encounterId}`);
  return NextResponse.json({ ok: true });
}