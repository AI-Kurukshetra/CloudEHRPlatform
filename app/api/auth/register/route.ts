import { NextResponse } from "next/server";

import { ensureClinic, insertUserRecord, createPatientProfile, createProviderProfile, logAuditAction } from "@/lib/repositories";
import { readRequestBody } from "@/lib/http";
import { registerSchema } from "@/lib/schemas";
import { createSupabaseAdminClient, createSupabaseRouteHandlerClient } from "@/lib/supabase";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Patient" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) ?? "Patient"
  };
}

export async function POST(request: Request) {
  const { data } = await readRequestBody(request);
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/register?error=invalid-registration-payload", request.url), { status: 303 });
  }

  try {
    await ensureClinic(parsed.data.clinicId);
  } catch (error) {
    const code = error instanceof Error ? error.message : "Unable to initialize clinic.";
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(code)}`, request.url), { status: 303 });
  }

  const admin = createSupabaseAdminClient();
  const createUserResult = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName
    },
    app_metadata: {
      role: parsed.data.role,
      clinic_id: parsed.data.clinicId
    }
  });

  if (createUserResult.error || !createUserResult.data.user) {
    return NextResponse.redirect(new URL("/register?error=auth-user-create-failed", request.url), { status: 303 });
  }

  const authUser = createUserResult.data.user;

  try {
    await insertUserRecord({
      id: authUser.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      role: parsed.data.role,
      clinicId: parsed.data.clinicId
    });

    let providerId: string | null = null;
    let patientId: string | null = null;

    if (parsed.data.role === "doctor") {
      providerId = await createProviderProfile({
        userId: authUser.id,
        clinicId: parsed.data.clinicId,
        fullName: parsed.data.fullName,
        specialty: parsed.data.specialty || "General Practice",
        licenseNumber: parsed.data.licenseNumber || "PENDING"
      });
    }

    if (parsed.data.role === "patient") {
      const name = splitFullName(parsed.data.fullName);
      patientId = await createPatientProfile({
        authUserId: authUser.id,
        clinicId: parsed.data.clinicId,
        firstName: name.firstName,
        lastName: name.lastName,
        dob: parsed.data.dob || "1990-01-01",
        gender: parsed.data.gender ?? "unknown",
        guardianName: "",
        phone: parsed.data.phone || "0000000000",
        email: parsed.data.email,
        insuranceId: parsed.data.insuranceId || "SELF-PAY",
        allergies: [],
        medications: [],
        diagnoses: [],
        pastMedicalHistory: ""
      });
    }

    if (providerId || patientId) {
      await admin.auth.admin.updateUserById(authUser.id, {
        app_metadata: {
          role: parsed.data.role,
          clinic_id: parsed.data.clinicId,
          provider_id: providerId,
          patient_id: patientId
        }
      });
    }

    await logAuditAction(authUser.id, `Registered ${parsed.data.role} account ${parsed.data.email}`);
  } catch (error) {
    await admin.auth.admin.deleteUser(authUser.id);
    const message = error instanceof Error ? error.message : "Unable to provision application records.";
    return NextResponse.redirect(new URL(`/register?error=${encodeURIComponent(message)}`, request.url), { status: 303 });
  }

  const supabase = await createSupabaseRouteHandlerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return NextResponse.redirect(new URL("/login?registered=1", request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
}


