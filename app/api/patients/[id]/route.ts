import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { patientSelfUpdateSchema, patientSchema } from "@/lib/schemas";
import { getPatient, updatePatient } from "@/lib/repositories";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();

  if (!session || !["admin", "doctor", "staff", "patient"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (session.role === "patient" && session.patientId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const patient = await getPatient(id, session.clinicId);

  if (!patient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: patient });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();

  if (!session || !["admin", "staff", "patient"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (session.role === "patient" && session.patientId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = session.role === "patient"
    ? patientSelfUpdateSchema.safeParse(payload)
    : patientSchema.partial().safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid patient payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updatePatient(id, session.clinicId, parsed.data);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}