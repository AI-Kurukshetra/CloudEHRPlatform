import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { createEncounterBundle, deleteEncounterById, getEncounterDetailById, listEncountersWithDetails, updateEncounterBundle } from "@/lib/encounter-repositories";
import { encounterBundleSchema, encounterFiltersSchema } from "@/lib/schemas";
import { logAuditAction } from "@/lib/repositories";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor", "staff", "patient"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  if (searchParams.id) {
    const detail = await getEncounterDetailById(searchParams.id, session.clinicId);
    if (!detail) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (session.role === "patient" && detail.patient.authUserId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ data: detail });
  }

  const parsed = encounterFiltersSchema.safeParse({
    ...searchParams,
    patientId: session.role === "patient" ? session.patientId ?? undefined : searchParams.patientId,
    providerId: session.role === "doctor" ? session.providerId ?? undefined : searchParams.providerId
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const data = await listEncountersWithDetails(session.clinicId, parsed.data);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = encounterBundleSchema.safeParse({ ...payload, clinicId: session.clinicId, providerId: session.providerId ?? payload.providerId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid encounter payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = await createEncounterBundle(parsed.data);
  if (data) {
    await logAuditAction(session.id, `Created encounter ${data.encounter.id}`);
  }
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const encounterId = typeof payload.id === "string" ? payload.id : "";
  const parsed = encounterBundleSchema.safeParse({ ...payload, clinicId: session.clinicId, providerId: session.providerId ?? payload.providerId });
  if (!encounterId || !parsed.success) {
    return NextResponse.json({ error: "Invalid encounter payload" }, { status: 400 });
  }

  const data = await updateEncounterBundle(encounterId, session.clinicId, parsed.data);
  if (data) {
    await logAuditAction(session.id, `Updated encounter ${data.encounter.id}`);
  }
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encounterId = new URL(request.url).searchParams.get("id");
  if (!encounterId) {
    return NextResponse.json({ error: "Encounter id is required" }, { status: 400 });
  }

  await deleteEncounterById(encounterId, session.clinicId);
  await logAuditAction(session.id, `Deleted encounter ${encounterId}`);
  return NextResponse.json({ ok: true });
}