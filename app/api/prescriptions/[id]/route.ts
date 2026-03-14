import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getPrescription } from "@/lib/repositories";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const prescription = await getPrescription(id, session.clinicId);

  if (!prescription) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.role === "patient" && prescription.patientId !== session.patientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (session.role === "doctor" && session.providerId && prescription.providerId !== session.providerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ data: prescription });
}
