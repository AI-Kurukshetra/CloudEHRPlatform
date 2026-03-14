import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { readRequestBody, wantsJson } from "@/lib/http";
import { listAppointmentsPage } from "@/lib/query-repositories";
import { createAppointment, logAuditAction } from "@/lib/repositories";
import { appointmentFiltersSchema, appointmentSchema } from "@/lib/schemas";

function normalizeAppointmentTime(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return value;
  }

  return value.includes("T") && !value.endsWith("Z") ? new Date(value).toISOString() : value;
}

function errorResponse(request: Request, redirectTo: string, message: string, status = 400) {
  return wantsJson(request)
    ? NextResponse.json({ error: message }, { status })
    : NextResponse.redirect(new URL(`${redirectTo}?error=${encodeURIComponent(message)}`, request.url), { status: 303 });
}

export async function GET(request: Request) {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = appointmentFiltersSchema.safeParse({
    ...searchParams,
    patientId: session.role === "patient" ? session.patientId ?? undefined : searchParams.patientId,
    providerId: session.role === "doctor" ? session.providerId ?? undefined : searchParams.providerId
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const appointments = await listAppointmentsPage(session.clinicId, parsed.data);
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await readRequestBody(request);
  const redirectTo = typeof (data as Record<string, unknown>).redirectTo === "string"
    ? (data as Record<string, string>).redirectTo
    : "/appointments";

  const parsed = appointmentSchema.safeParse({
    ...data,
    patientId: session.role === "patient" ? session.patientId : (data as Record<string, unknown>).patientId,
    clinicId: session.clinicId,
    appointmentTime: normalizeAppointmentTime((data as Record<string, unknown>).appointmentTime),
    durationMinutes: Number((data as Record<string, unknown>).durationMinutes)
  });

  if (!parsed.success) {
    return errorResponse(request, redirectTo, "Invalid appointment payload");
  }

  if (session.role === "patient" && !session.patientId) {
    return errorResponse(request, redirectTo, "This patient account is not linked to a patient chart yet.", 400);
  }

  try {
    const appointment = await createAppointment(parsed.data);
    await logAuditAction(session.id, `Created appointment ${appointment.id}`);

    return wantsJson(request)
      ? NextResponse.json({ data: appointment }, { status: 201 })
      : NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
  } catch (error) {
    return errorResponse(request, redirectTo, error instanceof Error ? error.message : "Unable to create appointment.", 500);
  }
}

