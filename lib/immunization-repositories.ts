import { randomUUID } from "node:crypto";

import { getImmunizationReminderStatus } from "@/lib/decision-support";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Immunization, ImmunizationListItem, Patient, Provider } from "@/lib/types";

type ImmunizationRow = {
  id: string;
  patient_id: string;
  clinic_id: string;
  vaccine_name: string;
  dose_number: number;
  date_administered: string;
  provider_id: string;
  lot_number: string;
  notes: string | null;
  next_due_date: string | null;
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
  created_at: string;
};

function mapImmunization(row: ImmunizationRow): Immunization {
  return {
    id: row.id,
    patientId: row.patient_id,
    clinicId: row.clinic_id,
    vaccineName: row.vaccine_name,
    doseNumber: row.dose_number,
    dateAdministered: row.date_administered,
    providerId: row.provider_id,
    lotNumber: row.lot_number,
    notes: row.notes ?? "",
    nextDueDate: row.next_due_date
  };
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
    licenseNumber: row.license_number,
    createdAt: row.created_at
  };
}

export async function listImmunizationsWithDetails(clinicId: string, filters?: { patientId?: string; providerId?: string }) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("immunizations").select("id, patient_id, clinic_id, vaccine_name, dose_number, date_administered, provider_id, lot_number, notes, next_due_date").eq("clinic_id", clinicId).order("date_administered", { ascending: false });
  if (filters?.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters?.providerId) query = query.eq("provider_id", filters.providerId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const immunizations = (data ?? []).map((row) => mapImmunization(row as ImmunizationRow));
  if (immunizations.length === 0) return [];

  const patientIds = Array.from(new Set(immunizations.map((item) => item.patientId)));
  const providerIds = Array.from(new Set(immunizations.map((item) => item.providerId)));
  const [{ data: patientRows }, { data: providerRows }] = await Promise.all([
    supabase.from("patients").select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at").in("id", patientIds),
    supabase.from("providers").select("id, user_id, clinic_id, full_name, specialty, license_number, created_at").in("id", providerIds)
  ]);

  const patientMap = new Map((patientRows ?? []).map((row) => [row.id as string, mapPatient(row as PatientRow)]));
  const providerMap = new Map((providerRows ?? []).map((row) => [row.id as string, mapProvider(row as ProviderRow)]));

  return immunizations.map((item) => ({
    ...item,
    patientName: `${patientMap.get(item.patientId)?.firstName ?? "Unknown"} ${patientMap.get(item.patientId)?.lastName ?? "patient"}`.trim(),
    providerName: providerMap.get(item.providerId)?.fullName ?? "Unknown provider",
    reminderStatus: getImmunizationReminderStatus(item.nextDueDate)
  })) satisfies ImmunizationListItem[];
}

export async function createImmunizationRecord(input: Omit<Immunization, "id">) {
  const supabase = createSupabaseAdminClient();
  const id = randomUUID();
  await supabase.from("immunizations").insert({
    id,
    patient_id: input.patientId,
    clinic_id: input.clinicId,
    vaccine_name: input.vaccineName,
    dose_number: input.doseNumber,
    date_administered: input.dateAdministered,
    provider_id: input.providerId,
    lot_number: input.lotNumber,
    notes: input.notes,
    next_due_date: input.nextDueDate
  });
  return { id, ...input } satisfies Immunization;
}

export async function updateImmunizationRecord(id: string, clinicId: string, input: Omit<Immunization, "id" | "clinicId">) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("immunizations").update({
    patient_id: input.patientId,
    vaccine_name: input.vaccineName,
    dose_number: input.doseNumber,
    date_administered: input.dateAdministered,
    provider_id: input.providerId,
    lot_number: input.lotNumber,
    notes: input.notes,
    next_due_date: input.nextDueDate
  }).eq("id", id).eq("clinic_id", clinicId);
  return { id, clinicId, ...input } satisfies Immunization;
}

export async function deleteImmunizationRecord(id: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("immunizations").delete().eq("id", id).eq("clinic_id", clinicId);
  return true;
}