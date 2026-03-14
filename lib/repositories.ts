import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase";
import type {
  Appointment,
  AuditLog,
  LabResult,
  Patient,
  Prescription,
  Provider,
  Role,
  User
} from "@/lib/types";
import { titleCase } from "@/lib/utils";

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
};

type PatientRow = {
  id: string;
  auth_user_id: string | null;
  clinic_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: Patient["gender"];
  guardian_name: string | null;
  phone: string;
  email: string;
  insurance_id: string;
  allergies: string[] | null;
  medications: string[] | null;
  diagnoses: string[] | null;
  past_medical_history: string | null;
  created_at: string;
};

type ProviderRow = {
  id: string;
  user_id: string;
  clinic_id: string;
  full_name: string;
  specialty: string;
  license_number: string;
};

type AppointmentRow = {
  id: string;
  patient_id: string;
  provider_id: string;
  clinic_id: string;
  appointment_time: string;
  duration_minutes: number;
  status: Appointment["status"];
  reason: string;
  notes: string;
};

type PrescriptionRow = {
  id: string;
  patient_id: string;
  provider_id: string;
  clinic_id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  issued_at: string;
};

type LabResultRow = {
  id: string;
  patient_id: string;
  clinic_id: string;
  test_name: string;
  result: string;
  flag: LabResult["flag"];
  collected_at: string;
};

type UserRow = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  clinic_id: string;
  created_at: string;
};

type AuditLogRow = {
  id: string;
  user_id: string;
  action: string;
  timestamp: string;
};

function isBootstrapError(error: SupabaseErrorLike | null | undefined) {
  return error?.code === "PGRST205" || error?.code === "42P01" || error?.message?.includes("Could not find the table") || false;
}

function formatRepositoryError(action: string, error: SupabaseErrorLike | null | undefined) {
  if (isBootstrapError(error)) {
    return new Error(`Supabase schema is not initialized for ${action}. Run supabase/migrations/0001_initial_schema.sql in the project's SQL editor first.`);
  }

  return new Error(error?.message ?? `Failed to ${action}.`);
}

function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    clinicId: row.clinic_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dob: row.dob,
    gender: row.gender,
    guardianName: row.guardian_name ?? "",
    phone: row.phone,
    email: row.email,
    insuranceId: row.insurance_id,
    allergies: row.allergies ?? [],
    medications: row.medications ?? [],
    diagnoses: row.diagnoses ?? [],
    pastMedicalHistory: row.past_medical_history ?? "",
    createdAt: row.created_at
  };
}

function mapProvider(row: ProviderRow): Provider {
  return {
    id: row.id,
    userId: row.user_id,
    clinicId: row.clinic_id,
    fullName: row.full_name,
    specialty: row.specialty,
    licenseNumber: row.license_number
  };
}

function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    providerId: row.provider_id,
    clinicId: row.clinic_id,
    appointmentTime: row.appointment_time,
    durationMinutes: row.duration_minutes,
    status: row.status,
    reason: row.reason,
    notes: row.notes
  };
}

function mapPrescription(row: PrescriptionRow): Prescription {
  return {
    id: row.id,
    patientId: row.patient_id,
    providerId: row.provider_id,
    clinicId: row.clinic_id,
    drugName: row.drug_name,
    dosage: row.dosage,
    frequency: row.frequency,
    duration: row.duration,
    issuedAt: row.issued_at
  };
}

function mapLabResult(row: LabResultRow): LabResult {
  return {
    id: row.id,
    patientId: row.patient_id,
    clinicId: row.clinic_id,
    testName: row.test_name,
    result: row.result,
    flag: row.flag,
    collectedAt: row.collected_at
  };
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    clinicId: row.clinic_id,
    createdAt: row.created_at
  };
}

function mapAuditLog(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    timestamp: row.timestamp
  };
}

export async function ensureClinic(clinicId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("clinics")
    .upsert({ id: clinicId, name: titleCase(clinicId) }, { onConflict: "id", ignoreDuplicates: false });

  if (error) {
    throw formatRepositoryError("ensure clinic", error);
  }
}

export async function insertUserRecord(input: {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  clinicId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("users").upsert(
    {
      id: input.id,
      email: input.email,
      full_name: input.fullName,
      role: input.role,
      clinic_id: input.clinicId
    },
    { onConflict: "id" }
  );

  if (error) {
    throw formatRepositoryError("create application user", error);
  }
}

export async function createProviderProfile(input: {
  userId: string;
  clinicId: string;
  fullName: string;
  specialty: string;
  licenseNumber: string;
}) {
  const supabase = createSupabaseAdminClient();
  const id = randomUUID();
  const { error } = await supabase.from("providers").insert({
    id,
    user_id: input.userId,
    clinic_id: input.clinicId,
    full_name: input.fullName,
    specialty: input.specialty,
    license_number: input.licenseNumber
  });

  if (error) {
    throw formatRepositoryError("create provider profile", error);
  }

  return id;
}

export async function createPatientProfile(input: Omit<Patient, "id" | "createdAt">) {
  const supabase = createSupabaseAdminClient();
  const id = randomUUID();
  const { error } = await supabase.from("patients").insert({
    id,
    auth_user_id: input.authUserId ?? null,
    clinic_id: input.clinicId,
    first_name: input.firstName,
    last_name: input.lastName,
    dob: input.dob,
    gender: input.gender,
    guardian_name: input.guardianName,
    phone: input.phone,
    email: input.email,
    insurance_id: input.insuranceId,
    allergies: input.allergies,
    medications: input.medications,
    diagnoses: input.diagnoses,
    past_medical_history: input.pastMedicalHistory
  });

  if (error) {
    throw formatRepositoryError("create patient profile", error);
  }

  return id;
}

export async function listUsers(clinicId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, clinic_id, created_at")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isBootstrapError(error)) {
      return [];
    }

    throw formatRepositoryError("list users", error);
  }

  return (data ?? []).map((row) => mapUser(row as UserRow));
}

export async function listPatients(clinicId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at")
    .eq("clinic_id", clinicId)
    .order("last_name", { ascending: true });

  if (error) {
    if (isBootstrapError(error)) {
      return [];
    }

    throw formatRepositoryError("list patients", error);
  }

  return (data ?? []).map((row) => mapPatient(row as PatientRow));
}

export async function getPatient(id: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at")
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error) {
    if (isBootstrapError(error)) {
      return null;
    }

    throw formatRepositoryError("get patient", error);
  }

  return data ? mapPatient(data as PatientRow) : null;
}

export async function createPatient(input: Omit<Patient, "id" | "createdAt">) {
  const id = await createPatientProfile(input);
  const patient = await getPatient(id, input.clinicId);

  if (!patient) {
    throw new Error("Patient record was created but could not be reloaded.");
  }

  return patient;
}

export async function updatePatient(id: string, clinicId: string, changes: Partial<Patient>) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .update({
      first_name: changes.firstName,
      last_name: changes.lastName,
      dob: changes.dob,
      gender: changes.gender,
      guardian_name: changes.guardianName,
      phone: changes.phone,
      email: changes.email,
      insurance_id: changes.insuranceId,
      allergies: changes.allergies,
      medications: changes.medications,
      diagnoses: changes.diagnoses,
      past_medical_history: changes.pastMedicalHistory,
      auth_user_id: changes.authUserId
    })
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at")
    .maybeSingle();

  if (error) {
    throw formatRepositoryError("update patient", error);
  }

  return data ? mapPatient(data as PatientRow) : null;
}

export async function updatePatientMedicalHistory(id: string, clinicId: string, pastMedicalHistory: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .update({
      past_medical_history: pastMedicalHistory
    })
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at")
    .maybeSingle();

  if (error) {
    throw formatRepositoryError("update patient medical history", error);
  }

  return data ? mapPatient(data as PatientRow) : null;
}

export async function listProviders(clinicId: string): Promise<Provider[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("providers")
    .select("id, user_id, clinic_id, full_name, specialty, license_number")
    .eq("clinic_id", clinicId)
    .order("full_name", { ascending: true });

  if (error) {
    if (isBootstrapError(error)) {
      return [];
    }

    throw formatRepositoryError("list providers", error);
  }

  return (data ?? []).map((row) => mapProvider(row as ProviderRow));
}

export async function listAppointments(clinicId: string, filters?: { patientId?: string; providerId?: string }) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("appointments")
    .select("id, patient_id, provider_id, clinic_id, appointment_time, duration_minutes, status, reason, notes")
    .eq("clinic_id", clinicId)
    .order("appointment_time", { ascending: true });

  if (filters?.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  if (filters?.providerId) {
    query = query.eq("provider_id", filters.providerId);
  }

  const { data, error } = await query;

  if (error) {
    if (isBootstrapError(error)) {
      return [];
    }

    throw formatRepositoryError("list appointments", error);
  }

  return (data ?? []).map((row) => mapAppointment(row as AppointmentRow));
}

export async function createAppointment(input: Omit<Appointment, "id">) {
  const supabase = createSupabaseAdminClient();
  const existing = await listAppointments(input.clinicId, { providerId: input.providerId });
  const overlapping = existing.some((appointment) => {
    if (appointment.status === "cancelled") {
      return false;
    }

    const start = new Date(appointment.appointmentTime).getTime();
    const end = start + appointment.durationMinutes * 60 * 1000;
    const nextStart = new Date(input.appointmentTime).getTime();
    const nextEnd = nextStart + input.durationMinutes * 60 * 1000;

    return nextStart < end && nextEnd > start;
  });

  if (overlapping) {
    throw new Error("Provider already has an appointment in the requested time slot.");
  }

  const id = randomUUID();
  const { data, error } = await supabase.from("appointments").insert({
    id,
    patient_id: input.patientId,
    provider_id: input.providerId,
    clinic_id: input.clinicId,
    appointment_time: input.appointmentTime,
    duration_minutes: input.durationMinutes,
    status: input.status,
    reason: input.reason,
    notes: input.notes
  }).select("id, patient_id, provider_id, clinic_id, appointment_time, duration_minutes, status, reason, notes").maybeSingle();

  if (error) {
    throw formatRepositoryError("create appointment", error);
  }

  return mapAppointment(data as AppointmentRow);
}

export async function updateAppointment(id: string, clinicId: string, changes: Partial<Appointment>) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({
      patient_id: changes.patientId,
      provider_id: changes.providerId,
      appointment_time: changes.appointmentTime,
      duration_minutes: changes.durationMinutes,
      status: changes.status,
      reason: changes.reason,
      notes: changes.notes
    })
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .select("id, patient_id, provider_id, clinic_id, appointment_time, duration_minutes, status, reason, notes")
    .maybeSingle();

  if (error) {
    throw formatRepositoryError("update appointment", error);
  }

  return data ? mapAppointment(data as AppointmentRow) : null;
}

export async function deleteAppointment(id: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("appointments").delete().eq("id", id).eq("clinic_id", clinicId);

  if (error) {
    throw formatRepositoryError("delete appointment", error);
  }

  return true;
}

export async function listPrescriptions(clinicId: string, filters?: { patientId?: string; providerId?: string }) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("prescriptions")
    .select("id, patient_id, provider_id, clinic_id, drug_name, dosage, frequency, duration, issued_at")
    .eq("clinic_id", clinicId)
    .order("issued_at", { ascending: false });

  if (filters?.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  if (filters?.providerId) {
    query = query.eq("provider_id", filters.providerId);
  }

  const { data, error } = await query;

  if (error) {
    if (isBootstrapError(error)) {
      return [];
    }

    throw formatRepositoryError("list prescriptions", error);
  }

  return (data ?? []).map((row) => mapPrescription(row as PrescriptionRow));
}

export async function getPrescription(id: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("prescriptions")
    .select("id, patient_id, provider_id, clinic_id, drug_name, dosage, frequency, duration, issued_at")
    .eq("id", id)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error) {
    if (isBootstrapError(error)) {
      return null;
    }

    throw formatRepositoryError("get prescription", error);
  }

  return data ? mapPrescription(data as PrescriptionRow) : null;
}

export async function createPrescription(input: Omit<Prescription, "id" | "issuedAt">) {
  const supabase = createSupabaseAdminClient();
  const id = randomUUID();
  const { data, error } = await supabase.from("prescriptions").insert({
    id,
    patient_id: input.patientId,
    provider_id: input.providerId,
    clinic_id: input.clinicId,
    drug_name: input.drugName,
    dosage: input.dosage,
    frequency: input.frequency,
    duration: input.duration
  }).select("id, patient_id, provider_id, clinic_id, drug_name, dosage, frequency, duration, issued_at").maybeSingle();

  if (error) {
    throw formatRepositoryError("create prescription", error);
  }

  return mapPrescription(data as PrescriptionRow);
}

export async function listLabResults(clinicId: string, filters?: { patientId?: string }): Promise<LabResult[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("lab_results")
    .select("id, patient_id, clinic_id, test_name, result, flag, collected_at")
    .eq("clinic_id", clinicId)
    .order("collected_at", { ascending: false });

  if (filters?.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  const { data, error } = await query;

  if (error) {
    if (isBootstrapError(error)) {
      return [];
    }

    throw formatRepositoryError("list lab results", error);
  }

  return (data ?? []).map((row) => mapLabResult(row as LabResultRow));
}

export async function listAuditLogs(clinicId: string, limit = 20) {
  const users = await listUsers(clinicId);
  if (users.length === 0) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, user_id, action, timestamp")
    .in("user_id", users.map((user) => user.id))
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    if (isBootstrapError(error)) {
      return [];
    }

    throw formatRepositoryError("list audit logs", error);
  }

  return (data ?? []).map((row) => mapAuditLog(row as AuditLogRow));
}

export async function logAuditAction(userId: string, action: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("audit_logs").insert({
    id: randomUUID(),
    user_id: userId,
    action,
    timestamp: new Date().toISOString()
  });

  if (error && !isBootstrapError(error)) {
    throw formatRepositoryError("write audit log", error);
  }
}

export async function getPatientSummary(clinicId: string, patientId: string) {
  const [patient, appointments, prescriptions, labs] = await Promise.all([
    getPatient(patientId, clinicId),
    listAppointments(clinicId, { patientId }),
    listPrescriptions(clinicId, { patientId }),
    listLabResults(clinicId, { patientId })
  ]);

  if (!patient) {
    return null;
  }

  return {
    patient,
    appointments,
    prescriptions,
    labs
  };
}






