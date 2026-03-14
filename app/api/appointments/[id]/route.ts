import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { deleteAppointment, listAppointments, updateAppointment } from "@/lib/repositories";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();

  if (!session || !["admin", "doctor", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = await request.json();
  const updated = await updateAppointment(id, session.clinicId, payload);

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();

  if (!session || !["admin", "doctor", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteAppointment(id, session.clinicId);
  return NextResponse.json({ ok: true });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const filters = session.role === "patient"
    ? { patientId: session.patientId ?? undefined }
    : session.role === "doctor"
      ? { providerId: session.providerId ?? undefined }
      : undefined;
  const appointment = (await listAppointments(session.clinicId, filters)).find((item) => item.id === id) ?? null;

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: appointment });
}
