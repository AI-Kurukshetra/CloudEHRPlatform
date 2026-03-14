import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { createImmunizationRecord, deleteImmunizationRecord, listImmunizationsWithDetails, updateImmunizationRecord } from "@/lib/immunization-repositories";
import { immunizationFiltersSchema, immunizationSchema } from "@/lib/schemas";
import { logAuditAction } from "@/lib/repositories";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor", "staff", "patient"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = immunizationFiltersSchema.safeParse({
    ...searchParams,
    patientId: session.role === "patient" ? session.patientId ?? undefined : searchParams.patientId,
    providerId: session.role === "doctor" ? session.providerId ?? undefined : searchParams.providerId
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const data = await listImmunizationsWithDetails(session.clinicId, parsed.data);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = immunizationSchema.safeParse({ ...payload, clinicId: session.clinicId, providerId: session.providerId ?? payload.providerId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid immunization payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = await createImmunizationRecord({ ...parsed.data, nextDueDate: parsed.data.nextDueDate ?? null });
  await logAuditAction(session.id, `Recorded immunization ${data.vaccineName}`);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const immunizationId = typeof payload.id === "string" ? payload.id : "";
  const parsed = immunizationSchema.safeParse({ ...payload, clinicId: session.clinicId, providerId: session.providerId ?? payload.providerId });
  if (!immunizationId || !parsed.success) {
    return NextResponse.json({ error: "Invalid immunization payload" }, { status: 400 });
  }

  const data = await updateImmunizationRecord(immunizationId, session.clinicId, { ...parsed.data, nextDueDate: parsed.data.nextDueDate ?? null });
  await logAuditAction(session.id, `Updated immunization ${immunizationId}`);
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const immunizationId = new URL(request.url).searchParams.get("id");
  if (!immunizationId) {
    return NextResponse.json({ error: "Immunization id is required" }, { status: 400 });
  }

  await deleteImmunizationRecord(immunizationId, session.clinicId);
  await logAuditAction(session.id, `Deleted immunization ${immunizationId}`);
  return NextResponse.json({ ok: true });
}