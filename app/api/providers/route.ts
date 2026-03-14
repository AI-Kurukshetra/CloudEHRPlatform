import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { createProviderRecord, deleteProviderRecord, listProvidersWithFilters, updateProviderRecord } from "@/lib/provider-repositories";
import { providerFiltersSchema, providerSchema } from "@/lib/schemas";
import { logAuditAction } from "@/lib/repositories";

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session || !["admin", "doctor", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = providerFiltersSchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const data = await listProvidersWithFilters(session.clinicId, parsed.data.search);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = providerSchema.safeParse({ ...payload, clinicId: session.clinicId });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid provider payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = await createProviderRecord(parsed.data);
  await logAuditAction(session.id, `Created provider ${data.fullName}`);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const providerId = typeof payload.id === "string" ? payload.id : "";
  const parsed = providerSchema.safeParse({ ...payload, clinicId: session.clinicId });
  if (!providerId || !parsed.success) {
    return NextResponse.json({ error: "Invalid provider payload" }, { status: 400 });
  }

  const data = await updateProviderRecord(providerId, session.clinicId, parsed.data);
  await logAuditAction(session.id, `Updated provider ${providerId}`);
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = new URL(request.url).searchParams.get("id");
  if (!providerId) {
    return NextResponse.json({ error: "Provider id is required" }, { status: 400 });
  }

  await deleteProviderRecord(providerId, session.clinicId);
  await logAuditAction(session.id, `Deleted provider ${providerId}`);
  return NextResponse.json({ ok: true });
}