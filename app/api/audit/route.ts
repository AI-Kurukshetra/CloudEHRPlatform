import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { auditFiltersSchema, auditLogSchema } from "@/lib/schemas";
import { createAuditRecord, deleteAuditRecord, listAuditLogsDetailed, updateAuditRecord } from "@/lib/audit-repositories";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = auditFiltersSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const data = await listAuditLogsDetailed(session.clinicId, parsed.data);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = auditLogSchema.safeParse({ ...payload, userId: payload.userId ?? session.id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid audit payload" }, { status: 400 });
  }

  const data = await createAuditRecord({ ...parsed.data, clinicId: session.clinicId });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const auditId = typeof payload.id === "string" ? payload.id : "";
  const parsed = auditLogSchema.safeParse({ ...payload, userId: payload.userId ?? session.id });
  if (!auditId || !parsed.success) {
    return NextResponse.json({ error: "Invalid audit payload" }, { status: 400 });
  }

  const data = await updateAuditRecord(auditId, session.clinicId, parsed.data);
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auditId = new URL(request.url).searchParams.get("id");
  if (!auditId) {
    return NextResponse.json({ error: "Audit id is required" }, { status: 400 });
  }

  await deleteAuditRecord(auditId, session.clinicId);
  return NextResponse.json({ ok: true });
}