import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { sanitizeRichText } from "@/lib/rich-text";
import { logAuditAction, updatePatientMedicalHistory } from "@/lib/repositories";
import { medicalHistorySchema } from "@/lib/schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();

  if (!session || !["admin", "doctor"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = medicalHistorySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid medical history payload." }, { status: 400 });
  }

  const { id } = await context.params;
  const updated = await updatePatientMedicalHistory(id, session.clinicId, sanitizeRichText(parsed.data.pastMedicalHistory));

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await logAuditAction(session.id, `Updated medical history for ${updated.firstName} ${updated.lastName}`);
  return NextResponse.json({ data: updated });
}

