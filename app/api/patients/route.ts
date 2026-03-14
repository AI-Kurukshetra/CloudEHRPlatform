import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { readRequestBody, wantsJson } from "@/lib/http";
import { listPatientsPage } from "@/lib/query-repositories";
import { createPatient, logAuditAction } from "@/lib/repositories";
import { patientFiltersSchema, patientSchema } from "@/lib/schemas";

function csvToArray(value: FormDataEntryValue | undefined) {
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function errorResponse(request: Request, redirectTo: string, message: string, status = 400) {
  return wantsJson(request)
    ? NextResponse.json({ error: message }, { status })
    : NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent(message)}`, request.url), { status: 303 });
}

export async function GET(request: Request) {
  const session = await getSessionUser();

  if (!session || !["admin", "doctor", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = patientFiltersSchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const patients = await listPatientsPage(session.clinicId, parsed.data);
  return NextResponse.json(patients);
}

export async function POST(request: Request) {
  const session = await getSessionUser();

  if (!session || !["admin", "staff"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await readRequestBody(request);
  const redirectTo = typeof (data as Record<string, unknown>).redirectTo === "string"
    ? (data as Record<string, string>).redirectTo
    : "/patients";

  const parsed = patientSchema.safeParse({
    ...data,
    clinicId: session.clinicId,
    guardianName: typeof (data as Record<string, unknown>).guardianName === "string" ? (data as Record<string, string>).guardianName : "",
    pastMedicalHistory: typeof (data as Record<string, unknown>).pastMedicalHistory === "string" ? (data as Record<string, string>).pastMedicalHistory : "",
    allergies: csvToArray((data as Record<string, FormDataEntryValue>).allergies),
    medications: csvToArray((data as Record<string, FormDataEntryValue>).medications),
    diagnoses: csvToArray((data as Record<string, FormDataEntryValue>).diagnoses)
  });

  if (!parsed.success) {
    return errorResponse(request, redirectTo, "Invalid patient payload");
  }

  try {
    const patient = await createPatient({
      ...parsed.data,
      guardianName: parsed.data.guardianName ?? "",
      pastMedicalHistory: parsed.data.pastMedicalHistory ?? ""
    });
    await logAuditAction(session.id, `Created patient ${patient.firstName} ${patient.lastName}`);

    return wantsJson(request)
      ? NextResponse.json({ data: patient }, { status: 201 })
      : NextResponse.redirect(new URL(`/patients/${patient.id}`, request.url), { status: 303 });
  } catch (error) {
    return errorResponse(request, redirectTo, error instanceof Error ? error.message : "Unable to create patient.", 500);
  }
}

