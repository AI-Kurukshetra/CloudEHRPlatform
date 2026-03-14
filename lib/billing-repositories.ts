import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase";
import type { BillingClaim, BillingClaimDetail, BillingClaimListItem, BillingItem, BillingPayment, EncounterDiagnosis, EncounterProcedure, Patient, Provider } from "@/lib/types";

type ClaimRow = {
  id: string;
  patient_id: string;
  encounter_id: string;
  provider_id: string;
  clinic_id: string;
  claim_number: string;
  status: BillingClaim["status"];
  total_amount: number | string;
  submitted_at: string | null;
  created_at: string;
};

type ItemRow = {
  id: string;
  claim_id: string;
  cpt_code: string;
  description: string;
  amount: number | string;
};

type PaymentRow = {
  id: string;
  claim_id: string;
  payment_method: BillingPayment["paymentMethod"];
  amount: number | string;
  payment_date: string;
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

const asNumber = (value: number | string) => typeof value === "number" ? value : Number(value);

function mapClaim(row: ClaimRow): BillingClaim {
  return {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id,
    providerId: row.provider_id,
    clinicId: row.clinic_id,
    claimNumber: row.claim_number,
    status: row.status,
    totalAmount: asNumber(row.total_amount),
    submittedAt: row.submitted_at,
    createdAt: row.created_at
  };
}

function mapItem(row: ItemRow): BillingItem {
  return {
    id: row.id,
    claimId: row.claim_id,
    cptCode: row.cpt_code,
    description: row.description,
    amount: asNumber(row.amount)
  };
}

function mapPayment(row: PaymentRow): BillingPayment {
  return {
    id: row.id,
    claimId: row.claim_id,
    paymentMethod: row.payment_method,
    amount: asNumber(row.amount),
    paymentDate: row.payment_date
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

async function getEncounterCoding(encounterId: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: diagnosisRows }, { data: procedureRows }] = await Promise.all([
    supabase.from("diagnoses").select("id, encounter_id, icd10_code, diagnosis_name, notes").eq("encounter_id", encounterId).order("diagnosis_name", { ascending: true }),
    supabase.from("procedures").select("id, encounter_id, cpt_code, procedure_name, notes").eq("encounter_id", encounterId).order("procedure_name", { ascending: true })
  ]);

  return {
    diagnoses: (diagnosisRows ?? []).map((row) => mapDiagnosis(row as DiagnosisRow)),
    procedures: (procedureRows ?? []).map((row) => mapProcedure(row as ProcedureRow))
  };
}

function buildDefaultItems(procedures: EncounterProcedure[]) {
  if (procedures.length > 0) {
    return procedures.map((item) => ({
      cptCode: item.cptCode,
      description: item.procedureName,
      amount: 125
    }));
  }

  return [{ cptCode: "99213", description: "Office visit", amount: 150 }];
}

export async function listBillingClaimsWithDetails(clinicId: string, filters?: { patientId?: string; providerId?: string; status?: BillingClaim["status"] }) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("billing_claims").select("id, patient_id, encounter_id, provider_id, clinic_id, claim_number, status, total_amount, submitted_at, created_at").eq("clinic_id", clinicId).order("created_at", { ascending: false });
  if (filters?.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters?.providerId) query = query.eq("provider_id", filters.providerId);
  if (filters?.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const claims = (data ?? []).map((row) => mapClaim(row as ClaimRow));
  if (claims.length === 0) return [];

  const patientIds = Array.from(new Set(claims.map((item) => item.patientId)));
  const providerIds = Array.from(new Set(claims.map((item) => item.providerId)));
  const claimIds = claims.map((item) => item.id);
  const [{ data: patientRows }, { data: providerRows }, { data: itemRows }, { data: paymentRows }] = await Promise.all([
    supabase.from("patients").select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at").in("id", patientIds),
    supabase.from("providers").select("id, user_id, clinic_id, full_name, specialty, license_number, created_at").in("id", providerIds),
    supabase.from("billing_items").select("claim_id, amount").in("claim_id", claimIds),
    supabase.from("payments").select("claim_id, amount").in("claim_id", claimIds)
  ]);

  const patientMap = new Map((patientRows ?? []).map((row) => [row.id as string, mapPatient(row as PatientRow)]));
  const providerMap = new Map((providerRows ?? []).map((row) => [row.id as string, mapProvider(row as ProviderRow)]));
  const itemCountMap = new Map<string, number>();
  (itemRows ?? []).forEach((row) => itemCountMap.set(row.claim_id as string, (itemCountMap.get(row.claim_id as string) ?? 0) + 1));
  const paidMap = new Map<string, number>();
  (paymentRows ?? []).forEach((row) => paidMap.set(row.claim_id as string, (paidMap.get(row.claim_id as string) ?? 0) + asNumber(row.amount as number | string)));

  return claims.map((claim) => ({
    ...claim,
    patientName: `${patientMap.get(claim.patientId)?.firstName ?? "Unknown"} ${patientMap.get(claim.patientId)?.lastName ?? "patient"}`.trim(),
    providerName: providerMap.get(claim.providerId)?.fullName ?? "Unknown provider",
    itemCount: itemCountMap.get(claim.id) ?? 0,
    paidAmount: paidMap.get(claim.id) ?? 0,
    balance: Math.max(0, claim.totalAmount - (paidMap.get(claim.id) ?? 0))
  })) satisfies BillingClaimListItem[];
}

export async function createBillingClaimFromEncounter(input: {
  clinicId: string;
  patientId: string;
  providerId: string;
  encounterId: string;
  claimNumber?: string;
  status: BillingClaim["status"];
  submittedAt?: string | null;
  items?: Array<Omit<BillingItem, "id" | "claimId">>;
}) {
  const coding = await getEncounterCoding(input.encounterId);
  const items = input.items && input.items.length > 0 ? input.items : buildDefaultItems(coding.procedures);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const supabase = createSupabaseAdminClient();
  const claimId = randomUUID();

  await supabase.from("billing_claims").insert({
    id: claimId,
    patient_id: input.patientId,
    encounter_id: input.encounterId,
    provider_id: input.providerId,
    clinic_id: input.clinicId,
    claim_number: input.claimNumber ?? `CLM-${claimId.slice(0, 8).toUpperCase()}`,
    status: input.status,
    total_amount: totalAmount,
    submitted_at: input.submittedAt ?? null
  });

  await supabase.from("billing_items").insert(items.map((item) => ({
    id: randomUUID(),
    claim_id: claimId,
    cpt_code: item.cptCode,
    description: item.description,
    amount: item.amount
  })));

  return getBillingClaimDetail(claimId, input.clinicId);
}

export async function getBillingClaimDetail(claimId: string, clinicId: string): Promise<BillingClaimDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data: claimRow, error } = await supabase.from("billing_claims").select("id, patient_id, encounter_id, provider_id, clinic_id, claim_number, status, total_amount, submitted_at, created_at").eq("id", claimId).eq("clinic_id", clinicId).maybeSingle();
  if (error || !claimRow) return null;

  const claim = mapClaim(claimRow as ClaimRow);
  const coding = await getEncounterCoding(claim.encounterId);
  const [{ data: patientRow }, { data: providerRow }, { data: itemRows }, { data: paymentRows }] = await Promise.all([
    supabase.from("patients").select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at").eq("id", claim.patientId).maybeSingle(),
    supabase.from("providers").select("id, user_id, clinic_id, full_name, specialty, license_number, created_at").eq("id", claim.providerId).maybeSingle(),
    supabase.from("billing_items").select("id, claim_id, cpt_code, description, amount").eq("claim_id", claimId),
    supabase.from("payments").select("id, claim_id, payment_method, amount, payment_date").eq("claim_id", claimId).order("payment_date", { ascending: false })
  ]);

  if (!patientRow) return null;

  return {
    claim,
    patient: mapPatient(patientRow as PatientRow),
    provider: providerRow ? mapProvider(providerRow as ProviderRow) : null,
    encounter: null,
    diagnoses: coding.diagnoses,
    procedures: coding.procedures,
    items: (itemRows ?? []).map((row) => mapItem(row as ItemRow)),
    payments: (paymentRows ?? []).map((row) => mapPayment(row as PaymentRow))
  };
}

export async function updateBillingClaimRecord(claimId: string, clinicId: string, input: {
  status: BillingClaim["status"];
  claimNumber: string;
  submittedAt?: string | null;
  items: Array<Omit<BillingItem, "id" | "claimId">>;
}) {
  const supabase = createSupabaseAdminClient();
  const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0);
  await supabase.from("billing_claims").update({
    status: input.status,
    claim_number: input.claimNumber,
    submitted_at: input.submittedAt ?? null,
    total_amount: totalAmount
  }).eq("id", claimId).eq("clinic_id", clinicId);

  await supabase.from("billing_items").delete().eq("claim_id", claimId);
  if (input.items.length > 0) {
    await supabase.from("billing_items").insert(input.items.map((item) => ({
      id: randomUUID(),
      claim_id: claimId,
      cpt_code: item.cptCode,
      description: item.description,
      amount: item.amount
    })));
  }

  return getBillingClaimDetail(claimId, clinicId);
}

export async function deleteBillingClaimRecord(claimId: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("billing_claims").delete().eq("id", claimId).eq("clinic_id", clinicId);
  return true;
}

export async function createClaimPayment(input: Omit<BillingPayment, "id">) {
  const supabase = createSupabaseAdminClient();
  const paymentId = randomUUID();
  await supabase.from("payments").insert({
    id: paymentId,
    claim_id: input.claimId,
    payment_method: input.paymentMethod,
    amount: input.amount,
    payment_date: input.paymentDate
  });
  return {
    id: paymentId,
    ...input
  } satisfies BillingPayment;
}

export async function deleteClaimPayment(paymentId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("payments").delete().eq("id", paymentId);
  return true;
}