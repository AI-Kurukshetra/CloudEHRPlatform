import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase";
import type { LabComponentResult, LabOrder, LabOrderDetail, LabOrderListItem, LabReport, Patient, Provider } from "@/lib/types";

type LabOrderRow = {
  id: string;
  patient_id: string;
  provider_id: string;
  clinic_id: string;
  encounter_id: string | null;
  test_name: string;
  lab_name: string;
  status: LabOrder["status"];
  ordered_at: string;
};

type LabReportRow = {
  id: string;
  lab_order_id: string;
  report_number: string;
  report_date: string;
  result_summary: string;
  abnormal_flag: boolean;
  file_url: string | null;
};

type LabResultRow = {
  id: string;
  report_id: string;
  test_component: string;
  value: string;
  reference_range: string | null;
  unit: string | null;
  flag: LabComponentResult["flag"];
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

function mapOrder(row: LabOrderRow): LabOrder {
  return {
    id: row.id,
    patientId: row.patient_id,
    providerId: row.provider_id,
    clinicId: row.clinic_id,
    encounterId: row.encounter_id,
    testName: row.test_name,
    labName: row.lab_name,
    status: row.status,
    orderedAt: row.ordered_at
  };
}

function mapReport(row: LabReportRow): LabReport {
  return {
    id: row.id,
    labOrderId: row.lab_order_id,
    reportNumber: row.report_number,
    reportDate: row.report_date,
    resultSummary: row.result_summary,
    abnormalFlag: row.abnormal_flag,
    fileUrl: row.file_url ?? ""
  };
}

function mapResult(row: LabResultRow): LabComponentResult {
  return {
    id: row.id,
    reportId: row.report_id,
    testComponent: row.test_component,
    value: row.value,
    referenceRange: row.reference_range ?? "",
    unit: row.unit ?? "",
    flag: row.flag
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

export async function listLabOrdersWithDetails(clinicId: string, filters?: { patientId?: string; providerId?: string; status?: LabOrder["status"] }) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("lab_orders").select("id, patient_id, provider_id, clinic_id, encounter_id, test_name, lab_name, status, ordered_at").eq("clinic_id", clinicId).order("ordered_at", { ascending: false });
  if (filters?.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters?.providerId) query = query.eq("provider_id", filters.providerId);
  if (filters?.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const orders = (data ?? []).map((row) => mapOrder(row as LabOrderRow));
  if (orders.length === 0) return [];

  const patientIds = Array.from(new Set(orders.map((item) => item.patientId)));
  const providerIds = Array.from(new Set(orders.map((item) => item.providerId)));
  const orderIds = orders.map((item) => item.id);
  const [{ data: patientRows }, { data: providerRows }, { data: reportRows }] = await Promise.all([
    supabase.from("patients").select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at").in("id", patientIds),
    supabase.from("providers").select("id, user_id, clinic_id, full_name, specialty, license_number, created_at").in("id", providerIds),
    supabase.from("lab_reports").select("lab_order_id").in("lab_order_id", orderIds)
  ]);

  const patientMap = new Map((patientRows ?? []).map((row) => [row.id as string, mapPatient(row as PatientRow)]));
  const providerMap = new Map((providerRows ?? []).map((row) => [row.id as string, mapProvider(row as ProviderRow)]));
  const reportCountMap = new Map<string, number>();
  (reportRows ?? []).forEach((row) => reportCountMap.set(row.lab_order_id as string, (reportCountMap.get(row.lab_order_id as string) ?? 0) + 1));

  return orders.map((order) => ({
    ...order,
    patientName: `${patientMap.get(order.patientId)?.firstName ?? "Unknown"} ${patientMap.get(order.patientId)?.lastName ?? "patient"}`.trim(),
    providerName: providerMap.get(order.providerId)?.fullName ?? "Unknown provider",
    reportCount: reportCountMap.get(order.id) ?? 0
  })) satisfies LabOrderListItem[];
}

export async function getLabWorkflow(labOrderId: string, clinicId: string): Promise<LabOrderDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data: orderRow, error } = await supabase.from("lab_orders").select("id, patient_id, provider_id, clinic_id, encounter_id, test_name, lab_name, status, ordered_at").eq("id", labOrderId).eq("clinic_id", clinicId).maybeSingle();
  if (error || !orderRow) return null;

  const order = mapOrder(orderRow as LabOrderRow);
  const [{ data: patientRow }, { data: providerRow }, { data: reportRow }] = await Promise.all([
    supabase.from("patients").select("id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, medications, diagnoses, past_medical_history, created_at").eq("id", order.patientId).maybeSingle(),
    supabase.from("providers").select("id, user_id, clinic_id, full_name, specialty, license_number, created_at").eq("id", order.providerId).maybeSingle(),
    supabase.from("lab_reports").select("id, lab_order_id, report_number, report_date, result_summary, abnormal_flag, file_url").eq("lab_order_id", labOrderId).maybeSingle()
  ]);

  if (!patientRow) return null;

  let results: LabComponentResult[] = [];
  if (reportRow) {
    const { data: resultRows } = await supabase.from("lab_results").select("id, report_id, test_component, value, reference_range, unit, flag").eq("report_id", (reportRow as LabReportRow).id).order("test_component", { ascending: true });
    results = (resultRows ?? []).map((row) => mapResult(row as LabResultRow));
  }

  return {
    order,
    patient: mapPatient(patientRow as PatientRow),
    provider: providerRow ? mapProvider(providerRow as ProviderRow) : null,
    report: reportRow ? mapReport(reportRow as LabReportRow) : null,
    results
  };
}

async function replaceResults(reportId: string, context: { patientId: string; clinicId: string; testName: string; reportDate: string }, results: Array<Omit<LabComponentResult, "id" | "reportId">>) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("lab_results").delete().eq("report_id", reportId);
  if (results.length === 0) return;
  await supabase.from("lab_results").insert(results.map((item) => ({
    id: randomUUID(),
    report_id: reportId,
    patient_id: context.patientId,
    clinic_id: context.clinicId,
    test_name: context.testName,
    result: item.value,
    test_component: item.testComponent,
    value: item.value,
    reference_range: item.referenceRange,
    unit: item.unit,
    flag: item.flag,
    collected_at: context.reportDate
  })));
}

export async function createLabWorkflow(input: {
  clinicId: string;
  patientId: string;
  providerId: string;
  encounterId?: string | null;
  testName: string;
  labName: string;
  status: LabOrder["status"];
  report?: Omit<LabReport, "id" | "labOrderId">;
  results: Array<Omit<LabComponentResult, "id" | "reportId">>;
}) {
  const supabase = createSupabaseAdminClient();
  const labOrderId = randomUUID();
  await supabase.from("lab_orders").insert({
    id: labOrderId,
    patient_id: input.patientId,
    provider_id: input.providerId,
    clinic_id: input.clinicId,
    encounter_id: input.encounterId ?? null,
    test_name: input.testName,
    lab_name: input.labName,
    status: input.status
  });

  if (input.report) {
    const reportId = randomUUID();
    await supabase.from("lab_reports").upsert({
      id: reportId,
      lab_order_id: labOrderId,
      report_number: input.report.reportNumber,
      report_date: input.report.reportDate,
      result_summary: input.report.resultSummary,
      abnormal_flag: input.report.abnormalFlag,
      file_url: input.report.fileUrl
    }, { onConflict: "lab_order_id" });
    await replaceResults(reportId, { patientId: input.patientId, clinicId: input.clinicId, testName: input.testName, reportDate: input.report.reportDate }, input.results);
  }

  return getLabWorkflow(labOrderId, input.clinicId);
}

export async function updateLabWorkflow(labOrderId: string, clinicId: string, input: {
  patientId: string;
  providerId: string;
  encounterId?: string | null;
  testName: string;
  labName: string;
  status: LabOrder["status"];
  report?: Omit<LabReport, "id" | "labOrderId">;
  results: Array<Omit<LabComponentResult, "id" | "reportId">>;
}) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("lab_orders").update({
    patient_id: input.patientId,
    provider_id: input.providerId,
    encounter_id: input.encounterId ?? null,
    test_name: input.testName,
    lab_name: input.labName,
    status: input.status
  }).eq("id", labOrderId).eq("clinic_id", clinicId);

  if (input.report) {
    const { data: existingReport } = await supabase.from("lab_reports").select("id").eq("lab_order_id", labOrderId).maybeSingle();
    const reportId = (existingReport?.id as string | undefined) ?? randomUUID();
    await supabase.from("lab_reports").upsert({
      id: reportId,
      lab_order_id: labOrderId,
      report_number: input.report.reportNumber,
      report_date: input.report.reportDate,
      result_summary: input.report.resultSummary,
      abnormal_flag: input.report.abnormalFlag,
      file_url: input.report.fileUrl
    }, { onConflict: "lab_order_id" });
    await replaceResults(reportId, { patientId: input.patientId, clinicId, testName: input.testName, reportDate: input.report.reportDate }, input.results);
  }

  return getLabWorkflow(labOrderId, clinicId);
}

export async function deleteLabWorkflow(labOrderId: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("lab_orders").delete().eq("id", labOrderId).eq("clinic_id", clinicId);
  return true;
}