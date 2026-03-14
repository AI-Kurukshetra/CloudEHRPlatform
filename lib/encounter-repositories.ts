import { randomUUID } from "node:crypto";

import { getClinicalDecisionSupport } from "@/lib/decision-support";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { ClinicalNote, Encounter, EncounterDetail, EncounterDiagnosis, EncounterListItem, EncounterProcedure, Patient, Provider } from "@/lib/types";

type EncounterRow = {
  id: string;
  patient_id: string;
  provider_id: string;
  clinic_id: string;
  appointment_id: string | null;
  visit_reason: string;
  status: Encounter["status"];
  created_at: string;
};

type ClinicalNoteRow = {
  id: string;
  encounter_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  created_at: string;
  updated_at: string | null;
};

type DiagnosisRow = {
  id: string;
  encounter_id: string;
  icd10_code: string;
  diagnosis_name: string;
  notes: string | null;
};

type ProcedureRow = {
  id: string;
  encounter_id: string;
  cpt_code: string;
  procedure_name: string;
  notes: string | null;
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

function isMissingTableError(message: string) {
  return (
    message.includes("Could not find the table 'public.encounters'") ||
    message.includes("relation \"public.encounters\" does not exist") ||
    message.includes("relation \"encounters\" does not exist")
  );
}

function mapEncounter(row: EncounterRow): Encounter {
  return {
    id: row.id,
    patientId: row.patient_id,
    providerId: row.provider_id,
    clinicId: row.clinic_id,
    appointmentId: row.appointment_id,
    visitReason: row.visit_reason,
    status: row.status,
    createdAt: row.created_at
  };
}

function mapClinicalNote(row: ClinicalNoteRow): ClinicalNote {
  return {
    id: row.id,
    encounterId: row.encounter_id,
    subjective: row.subjective ?? "",
    objective: row.objective ?? "",
    assessment: row.assessment ?? "",
    plan: row.plan ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined
  };
}

function mapDiagnosis(row: DiagnosisRow): EncounterDiagnosis {
  return {
    id: row.id,
    encounterId: row.encounter_id,
    icd10Code: row.icd10_code,
    diagnosisName: row.diagnosis_name,
    notes: row.notes ?? ""
  };
}

function mapProcedure(row: ProcedureRow): EncounterProcedure {
  return {
    id: row.id,
    encounterId: row.encounter_id,
    cptCode: row.cpt_code,
    procedureName: row.procedure_name,
    notes: row.notes ?? ""
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

export async function listEncountersWithDetails(clinicId: string, filters?: { patientId?: string; providerId?: string; status?: Encounter["status"] }) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("encounters")
    .select("id, patient_id, provider_id, clinic_id, appointment_id, visit_reason, status, created_at")
    .eq("clinic_id", clinicId)
    .order("created_at", { ascending: false });

  if (filters?.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters?.providerId) query = query.eq("provider_id", filters.providerId);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) {
    if (isMissingTableError(error.message)) {
      console.warn(
        "[encounters] Missing table public.encounters. Apply supabase/migrations/0003_must_have_features.sql to enable encounter workflows."
      );
      return [];
    }
    throw new Error(error.message);
  }

  const encounters = (data ?? []).map((row) => mapEncounter(row as EncounterRow));
  if (encounters.length === 0) return [];

  const patientIds = Array.from(new Set(encounters.map((item) => item.patientId)));
  const providerIds = Array.from(new Set(encounters.map((item) => item.providerId)));
  const [{ data: patientRows }, { data: providerRows }] = await Promise.all([
    supabase.from("patients").select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at").in("id", patientIds),
    supabase.from("providers").select("id, user_id, clinic_id, full_name, specialty, license_number, created_at").in("id", providerIds)
  ]);

  const patientMap = new Map((patientRows ?? []).map((row) => [row.id as string, mapPatient(row as PatientRow)]));
  const providerMap = new Map((providerRows ?? []).map((row) => [row.id as string, mapProvider(row as ProviderRow)]));

  return encounters.map((encounter) => ({
    ...encounter,
    patientName: `${patientMap.get(encounter.patientId)?.firstName ?? "Unknown"} ${patientMap.get(encounter.patientId)?.lastName ?? "patient"}`.trim(),
    providerName: providerMap.get(encounter.providerId)?.fullName ?? "Unknown provider"
  })) satisfies EncounterListItem[];
}

export async function getEncounterDetailById(encounterId: string, clinicId: string): Promise<EncounterDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data: encounterRow, error } = await supabase
    .from("encounters")
    .select("id, patient_id, provider_id, clinic_id, appointment_id, visit_reason, status, created_at")
    .eq("id", encounterId)
    .eq("clinic_id", clinicId)
    .maybeSingle();

  if (error || !encounterRow) {
    return null;
  }

  const encounter = mapEncounter(encounterRow as EncounterRow);
  const [{ data: patientRow }, { data: providerRow }, { data: noteRow }, { data: diagnosisRows }, { data: procedureRows }, { data: immunizationRows }] = await Promise.all([
    supabase.from("patients").select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at").eq("id", encounter.patientId).maybeSingle(),
    supabase.from("providers").select("id, user_id, clinic_id, full_name, specialty, license_number, created_at").eq("id", encounter.providerId).maybeSingle(),
    supabase.from("clinical_notes").select("id, encounter_id, subjective, objective, assessment, plan, created_at, updated_at").eq("encounter_id", encounterId).maybeSingle(),
    supabase.from("diagnoses").select("id, encounter_id, icd10_code, diagnosis_name, notes").eq("encounter_id", encounterId).order("diagnosis_name", { ascending: true }),
    supabase.from("procedures").select("id, encounter_id, cpt_code, procedure_name, notes").eq("encounter_id", encounterId).order("procedure_name", { ascending: true }),
    supabase.from("immunizations").select("id, patient_id, clinic_id, vaccine_name, dose_number, date_administered, provider_id, lot_number, notes, next_due_date").eq("patient_id", encounter.patientId).order("date_administered", { ascending: false })
  ]);

  if (!patientRow) {
    return null;
  }

  const patient = mapPatient(patientRow as PatientRow);
  const diagnoses = (diagnosisRows ?? []).map((row) => mapDiagnosis(row as DiagnosisRow));

  return {
    encounter,
    patient,
    provider: providerRow ? mapProvider(providerRow as ProviderRow) : null,
    note: noteRow ? mapClinicalNote(noteRow as ClinicalNoteRow) : null,
    diagnoses,
    procedures: (procedureRows ?? []).map((row) => mapProcedure(row as ProcedureRow)),
    alerts: getClinicalDecisionSupport({
      patient,
      diagnoses,
      immunizations: (immunizationRows ?? []).map((row) => ({
        id: row.id as string,
        patientId: row.patient_id as string,
        clinicId: row.clinic_id as string,
        vaccineName: row.vaccine_name as string,
        doseNumber: row.dose_number as number,
        dateAdministered: row.date_administered as string,
        providerId: row.provider_id as string,
        lotNumber: row.lot_number as string,
        notes: (row.notes as string | null) ?? "",
        nextDueDate: (row.next_due_date as string | null) ?? null
      }))
    })
  };
}

async function replaceEncounterChildren(encounterId: string, diagnoses: Array<Omit<EncounterDiagnosis, "id" | "encounterId">>, procedures: Array<Omit<EncounterProcedure, "id" | "encounterId">>) {
  const supabase = createSupabaseAdminClient();
  await Promise.all([
    supabase.from("diagnoses").delete().eq("encounter_id", encounterId),
    supabase.from("procedures").delete().eq("encounter_id", encounterId)
  ]);

  if (diagnoses.length > 0) {
    await supabase.from("diagnoses").insert(diagnoses.map((item) => ({
      id: randomUUID(),
      encounter_id: encounterId,
      icd10_code: item.icd10Code,
      diagnosis_name: item.diagnosisName,
      notes: item.notes
    })));
  }

  if (procedures.length > 0) {
    await supabase.from("procedures").insert(procedures.map((item) => ({
      id: randomUUID(),
      encounter_id: encounterId,
      cpt_code: item.cptCode,
      procedure_name: item.procedureName,
      notes: item.notes
    })));
  }
}

export async function createEncounterBundle(input: {
  clinicId: string;
  patientId: string;
  providerId: string;
  appointmentId?: string | null;
  visitReason: string;
  status: Encounter["status"];
  note: Omit<ClinicalNote, "id" | "encounterId" | "createdAt" | "updatedAt">;
  diagnoses: Array<Omit<EncounterDiagnosis, "id" | "encounterId">>;
  procedures: Array<Omit<EncounterProcedure, "id" | "encounterId">>;
}) {
  const supabase = createSupabaseAdminClient();
  const encounterId = randomUUID();
  await supabase.from("encounters").insert({
    id: encounterId,
    patient_id: input.patientId,
    provider_id: input.providerId,
    clinic_id: input.clinicId,
    appointment_id: input.appointmentId ?? null,
    visit_reason: input.visitReason,
    status: input.status
  });

  await supabase.from("clinical_notes").upsert({
    id: randomUUID(),
    encounter_id: encounterId,
    subjective: input.note.subjective,
    objective: input.note.objective,
    assessment: input.note.assessment,
    plan: input.note.plan,
    updated_at: new Date().toISOString()
  }, { onConflict: "encounter_id" });

  await replaceEncounterChildren(encounterId, input.diagnoses, input.procedures);
  return getEncounterDetailById(encounterId, input.clinicId);
}

export async function updateEncounterBundle(encounterId: string, clinicId: string, input: {
  patientId: string;
  providerId: string;
  appointmentId?: string | null;
  visitReason: string;
  status: Encounter["status"];
  note: Omit<ClinicalNote, "id" | "encounterId" | "createdAt" | "updatedAt">;
  diagnoses: Array<Omit<EncounterDiagnosis, "id" | "encounterId">>;
  procedures: Array<Omit<EncounterProcedure, "id" | "encounterId">>;
}) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("encounters").update({
    patient_id: input.patientId,
    provider_id: input.providerId,
    appointment_id: input.appointmentId ?? null,
    visit_reason: input.visitReason,
    status: input.status
  }).eq("id", encounterId).eq("clinic_id", clinicId);

  await supabase.from("clinical_notes").upsert({
    id: randomUUID(),
    encounter_id: encounterId,
    subjective: input.note.subjective,
    objective: input.note.objective,
    assessment: input.note.assessment,
    plan: input.note.plan,
    updated_at: new Date().toISOString()
  }, { onConflict: "encounter_id" });

  await replaceEncounterChildren(encounterId, input.diagnoses, input.procedures);
  return getEncounterDetailById(encounterId, clinicId);
}

export async function deleteEncounterById(encounterId: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("encounters").delete().eq("id", encounterId).eq("clinic_id", clinicId);
  return true;
}