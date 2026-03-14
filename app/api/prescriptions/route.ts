import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { readRequestBody, wantsJson } from "@/lib/http";
import { listPrescriptionsPage } from "@/lib/query-repositories";
import { createPrescription, logAuditAction } from "@/lib/repositories";
import { prescriptionFiltersSchema, prescriptionSchema } from "@/lib/schemas";

function errorResponse(request: Request, redirectTo: string, message: string, status = 400) {
  return wantsJson(request)
    ? NextResponse.json({ error: message }, { status })
    : NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent(message)}`, request.url), { status: 303 });
}

export async function GET(request: Request) {
  const session = await getSessionUser();

  if (!session || !["admin", "doctor", "patient"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = prescriptionFiltersSchema.safeParse({
    ...searchParams,
    patientId: session.role === "patient" ? session.patientId ?? undefined : searchParams.patientId,
    providerId: session.role === "doctor" ? session.providerId ?? undefined : searchParams.providerId
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const prescriptions = await listPrescriptionsPage(session.clinicId, parsed.data);
  return NextResponse.json(prescriptions);
}

export async function POST(request: Request) {
  const session = await getSessionUser();

  if (!session || session.role !== "doctor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await readRequestBody(request);
  const redirectTo = typeof (data as Record<string, unknown>).redirectTo === "string"
    ? (data as Record<string, string>).redirectTo
    : "/prescriptions";

  const parsed = prescriptionSchema.safeParse({
    ...data,
    clinicId: session.clinicId,
    providerId: session.providerId ?? (data as Record<string, unknown>).providerId
  });

  if (!parsed.success) {
    return errorResponse(request, redirectTo, "Invalid prescription payload");
  }

  try {
    const prescription = await createPrescription(parsed.data);
    await logAuditAction(session.id, `Issued prescription ${prescription.drugName}`);

    return wantsJson(request)
      ? NextResponse.json({ data: prescription }, { status: 201 })
      : NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
  } catch (error) {
    return errorResponse(request, redirectTo, error instanceof Error ? error.message : "Unable to create prescription.", 500);
  }
}

