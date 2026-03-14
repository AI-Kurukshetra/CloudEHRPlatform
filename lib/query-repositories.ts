import { createSupabaseAdminClient } from "@/lib/supabase";
import type {
  Appointment,
  AppointmentListItem,
  LabResult,
  LabResultListItem,
  PaginatedResult,
  Patient,
  PatientSummaryCard,
  Prescription,
  PrescriptionListItem
} from "@/lib/types";

type SupabaseErrorLike = {
  code?: string;
  message?: string;
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
  diagnoses: string[] | null;
  past_medical_history: string | null;
  created_at: string;
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

export type PatientDirectoryFilters = {
  search?: string;
  dob?: string;
  gender?: Patient["gender"];
  allergy?: string;
  registrationDate?: string;
  page?: number;
  limit?: number;
};

export type AppointmentDirectoryFilters = {
  search?: string;
  status?: Appointment["status"];
  patientId?: string;
  providerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export type PrescriptionDirectoryFilters = {
  search?: string;
  patientId?: string;
  providerId?: string;
  page?: number;
  limit?: number;
};

export type LabDirectoryFilters = {
  search?: string;
  patientId?: string;
  flag?: LabResult["flag"];
  page?: number;
  limit?: number;
};

const patientColumns = "id, auth_user_id, clinic_id, first_name, last_name, dob, gender, guardian_name, phone, email, insurance_id, allergies, diagnoses, past_medical_history, created_at";
const appointmentColumns = "id, patient_id, provider_id, clinic_id, appointment_time, duration_minutes, status, reason, notes";
const prescriptionColumns = "id, patient_id, provider_id, clinic_id, drug_name, dosage, frequency, duration, issued_at";
const labColumns = "id, patient_id, clinic_id, test_name, result, flag, collected_at";

function isBootstrapError(error: SupabaseErrorLike | null | undefined) {
  return error?.code === "PGRST205" || error?.code === "42P01" || error?.message?.includes("Could not find the table") || false;
}

function formatRepositoryError(action: string, error: SupabaseErrorLike | null | undefined) {
  if (isBootstrapError(error)) {
    return new Error(`Supabase schema is not initialized for ${action}. Run the SQL files in supabase/migrations in order first.`);
  }

  return new Error(error?.message ?? `Failed to ${action}.`);
}

function getRange(page = 1, limit = 20) {
  const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(1, limit), 100) : 20;

  return {
    page: safePage,
    limit: safeLimit,
    from: (safePage - 1) * safeLimit,
    to: safePage * safeLimit - 1
  };
}

function buildPaginationMeta(page: number, limit: number, total: number) {
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}

function getDateRange(date: string) {
  const start = `${date}T00:00:00.000Z`;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end: end.toISOString() };
}

function mapPatientSummary(row: PatientRow): PatientSummaryCard {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    guardianName: row.guardian_name ?? "",
    dob: row.dob,
    gender: row.gender,
    phone: row.phone,
    allergies: row.allergies ?? [],
    diagnoses: row.diagnoses ?? [],
    insuranceId: row.insurance_id,
    createdAt: row.created_at
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

async function getPatientNameMap(clinicId: string, ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name")
    .eq("clinic_id", clinicId)
    .in("id", ids);

  if (error) {
    throw formatRepositoryError("load patient names", error);
  }

  return new Map((data ?? []).map((row) => [row.id as string, `${row.first_name as string} ${row.last_name as string}`.trim()]));
}

async function getProviderNameMap(clinicId: string, ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("providers")
    .select("id, full_name")
    .eq("clinic_id", clinicId)
    .in("id", ids);

  if (error) {
    throw formatRepositoryError("load provider names", error);
  }

  return new Map((data ?? []).map((row) => [row.id as string, row.full_name as string]));
}

export async function listPatientsPage(clinicId: string, filters: PatientDirectoryFilters = {}): Promise<PaginatedResult<PatientSummaryCard>> {
  const supabase = createSupabaseAdminClient();
  const { page, limit, from, to } = getRange(filters.page, filters.limit);
  let query = supabase
    .from("patients")
    .select(patientColumns, { count: "planned" })
    .eq("clinic_id", clinicId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (filters.search) {
    query = query.ilike("search_text", `%${filters.search.toLowerCase()}%`);
  }

  if (filters.dob) {
    query = query.eq("dob", filters.dob);
  }

  if (filters.gender) {
    query = query.eq("gender", filters.gender);
  }

  if (filters.allergy) {
    query = query.ilike("allergy_search_text", `%${filters.allergy.toLowerCase()}%`);
  }

  if (filters.registrationDate) {
    const range = getDateRange(filters.registrationDate);
    query = query.gte("created_at", range.start).lt("created_at", range.end);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (isBootstrapError(error)) {
      return { data: [], pagination: buildPaginationMeta(page, limit, 0) };
    }

    throw formatRepositoryError("list patients", error);
  }

  return {
    data: (data ?? []).map((row) => mapPatientSummary(row as PatientRow)),
    pagination: buildPaginationMeta(page, limit, count ?? 0)
  };
}

export async function searchPatientsForPicker(clinicId: string, search?: string, limit = 10) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("patients")
    .select(patientColumns)
    .eq("clinic_id", clinicId)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .limit(limit);

  if (search) {
    query = query.ilike("search_text", `%${search.toLowerCase()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw formatRepositoryError("search patients", error);
  }

  return (data ?? []).map((row) => mapPatientSummary(row as PatientRow));
}

export async function listAppointmentsPage(clinicId: string, filters: AppointmentDirectoryFilters = {}): Promise<PaginatedResult<AppointmentListItem>> {
  const supabase = createSupabaseAdminClient();
  const { page, limit, from, to } = getRange(filters.page, filters.limit);
  let query = supabase
    .from("appointments")
    .select(appointmentColumns, { count: "planned" })
    .eq("clinic_id", clinicId)
    .order("appointment_time", { ascending: true });

  if (filters.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  if (filters.providerId) {
    query = query.eq("provider_id", filters.providerId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    query = query.or(`reason.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
  }

  if (filters.dateFrom) {
    query = query.gte("appointment_time", `${filters.dateFrom}T00:00:00.000Z`);
  }

  if (filters.dateTo) {
    const range = getDateRange(filters.dateTo);
    query = query.lt("appointment_time", range.end);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (isBootstrapError(error)) {
      return { data: [], pagination: buildPaginationMeta(page, limit, 0) };
    }

    throw formatRepositoryError("list appointments", error);
  }

  const appointments = (data ?? []).map((row) => mapAppointment(row as AppointmentRow));
  const patientMap = await getPatientNameMap(clinicId, Array.from(new Set(appointments.map((item) => item.patientId))));
  const providerMap = await getProviderNameMap(clinicId, Array.from(new Set(appointments.map((item) => item.providerId))));

  return {
    data: appointments.map((item) => ({
      ...item,
      patientName: patientMap.get(item.patientId) ?? "Unknown patient",
      providerName: providerMap.get(item.providerId) ?? "Unknown provider"
    })),
    pagination: buildPaginationMeta(page, limit, count ?? 0)
  };
}
export async function listPrescriptionsPage(clinicId: string, filters: PrescriptionDirectoryFilters = {}): Promise<PaginatedResult<PrescriptionListItem>> {
  const supabase = createSupabaseAdminClient();
  const { page, limit, from, to } = getRange(filters.page, filters.limit);
  let query = supabase
    .from("prescriptions")
    .select(prescriptionColumns, { count: "planned" })
    .eq("clinic_id", clinicId)
    .order("issued_at", { ascending: false });

  if (filters.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  if (filters.providerId) {
    query = query.eq("provider_id", filters.providerId);
  }

  if (filters.search) {
    query = query.or(`drug_name.ilike.%${filters.search}%,dosage.ilike.%${filters.search}%,frequency.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (isBootstrapError(error)) {
      return { data: [], pagination: buildPaginationMeta(page, limit, 0) };
    }

    throw formatRepositoryError("list prescriptions", error);
  }

  const prescriptions = (data ?? []).map((row) => mapPrescription(row as PrescriptionRow));
  const patientMap = await getPatientNameMap(clinicId, Array.from(new Set(prescriptions.map((item) => item.patientId))));
  const providerMap = await getProviderNameMap(clinicId, Array.from(new Set(prescriptions.map((item) => item.providerId))));

  return {
    data: prescriptions.map((item) => ({
      ...item,
      patientName: patientMap.get(item.patientId) ?? "Unknown patient",
      providerName: providerMap.get(item.providerId) ?? "Unknown provider"
    })),
    pagination: buildPaginationMeta(page, limit, count ?? 0)
  };
}

export async function listLabResultsPage(clinicId: string, filters: LabDirectoryFilters = {}): Promise<PaginatedResult<LabResultListItem>> {
  const supabase = createSupabaseAdminClient();
  const { page, limit, from, to } = getRange(filters.page, filters.limit);
  let query = supabase
    .from("lab_results")
    .select(labColumns, { count: "planned" })
    .eq("clinic_id", clinicId)
    .order("collected_at", { ascending: false });

  if (filters.patientId) {
    query = query.eq("patient_id", filters.patientId);
  }

  if (filters.flag) {
    query = query.eq("flag", filters.flag);
  }

  if (filters.search) {
    query = query.or(`test_name.ilike.%${filters.search}%,result.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (isBootstrapError(error)) {
      return { data: [], pagination: buildPaginationMeta(page, limit, 0) };
    }

    throw formatRepositoryError("list lab results", error);
  }

  const labs = (data ?? []).map((row) => mapLabResult(row as LabResultRow));
  const patientMap = await getPatientNameMap(clinicId, Array.from(new Set(labs.map((item) => item.patientId))));

  return {
    data: labs.map((item) => ({
      ...item,
      patientName: patientMap.get(item.patientId) ?? "Unknown patient"
    })),
    pagination: buildPaginationMeta(page, limit, count ?? 0)
  };
}

