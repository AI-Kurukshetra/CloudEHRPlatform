export type Role = "admin" | "doctor" | "staff" | "patient";
export type PatientGender = "male" | "female" | "other" | "unknown";
export type EncounterStatus = "draft" | "in_progress" | "completed";
export type LabOrderStatus = "ordered" | "collected" | "reported" | "reviewed" | "cancelled";
export type LabResultFlag = "normal" | "abnormal" | "critical";
export type BillingClaimStatus = "draft" | "submitted" | "paid" | "partially_paid" | "denied";
export type PaymentMethod = "insurance" | "card" | "cash" | "bank_transfer" | "check";
export type ClinicalAlertType = "allergy" | "interaction" | "preventive";
export type ClinicalAlertSeverity = "info" | "warning" | "critical";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  clinicId: string;
  createdAt?: string;`r`n};

export type Clinic = {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt?: string;`r`n};

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  clinicId: string;
  patientId?: string | null;
  providerId?: string | null;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: PatientGender;
  guardianName: string;
  phone: string;
  email: string;
  insuranceId: string;
  clinicId: string;
  allergies: string[];
  medications: string[];
  diagnoses: string[];
  pastMedicalHistory: string;
  createdAt: string;
  authUserId?: string | null;
};

export type PatientSummaryCard = Pick<
  Patient,
  | "id"
  | "firstName"
  | "lastName"
  | "guardianName"
  | "dob"
  | "gender"
  | "phone"
  | "allergies"
  | "diagnoses"
  | "insuranceId"
  | "createdAt"
>;

export type Provider = {
  id: string;
  userId: string;
  clinicId: string;
  fullName: string;
  specialty: string;
  licenseNumber: string;
  createdAt?: string;`r`n};

export type AppointmentStatus =
  | "scheduled"
  | "checked_in"
  | "completed"
  | "cancelled";

export type Appointment = {
  id: string;
  patientId: string;
  providerId: string;
  clinicId: string;
  appointmentTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string;
  notes: string;
};

export type AppointmentListItem = Appointment & {
  patientName: string;
  providerName: string;
};

export type Prescription = {
  id: string;
  patientId: string;
  providerId: string;
  clinicId: string;
  encounterId?: string | null;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  issuedAt: string;
};

export type PrescriptionListItem = Prescription & {
  patientName: string;
  providerName: string;
};

export type LabResult = {
  id: string;
  patientId: string;
  clinicId: string;
  testName: string;
  result: string;
  flag: LabResultFlag;
  collectedAt: string;
};

export type LabResultListItem = LabResult & {
  patientName: string;
};

export type Encounter = {
  id: string;
  patientId: string;
  providerId: string;
  clinicId: string;
  appointmentId?: string | null;
  visitReason: string;
  status: EncounterStatus;
  createdAt?: string;`r`n};

export type EncounterListItem = Encounter & {
  patientName: string;
  providerName: string;
};

export type ClinicalNote = {
  id: string;
  encounterId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  createdAt: string;
  updatedAt?: string;
};

export type EncounterDiagnosis = {
  id: string;
  encounterId: string;
  icd10Code: string;
  diagnosisName: string;
  notes: string;
};

export type EncounterProcedure = {
  id: string;
  encounterId: string;
  cptCode: string;
  procedureName: string;
  notes: string;
};

export type EncounterDetail = {
  encounter: Encounter;
  patient: Patient;
  provider: Provider | null;
  note: ClinicalNote | null;
  diagnoses: EncounterDiagnosis[];
  procedures: EncounterProcedure[];
  alerts: ClinicalAlert[];
};

export type LabOrder = {
  id: string;
  patientId: string;
  providerId: string;
  clinicId: string;
  encounterId?: string | null;
  testName: string;
  labName: string;
  status: LabOrderStatus;
  orderedAt: string;
};

export type LabOrderListItem = LabOrder & {
  patientName: string;
  providerName: string;
  reportCount: number;
};

export type LabReport = {
  id: string;
  labOrderId: string;
  reportNumber: string;
  reportDate: string;
  resultSummary: string;
  abnormalFlag: boolean;
  fileUrl: string;
};

export type LabComponentResult = {
  id: string;
  reportId: string;
  testComponent: string;
  value: string;
  referenceRange: string;
  unit: string;
  flag: LabResultFlag;
};

export type LabOrderDetail = {
  order: LabOrder;
  patient: Patient;
  provider: Provider | null;
  report: LabReport | null;
  results: LabComponentResult[];
};

export type BillingClaim = {
  id: string;
  patientId: string;
  encounterId: string;
  providerId: string;
  clinicId: string;
  claimNumber: string;
  status: BillingClaimStatus;
  totalAmount: number;
  submittedAt: string | null;
  createdAt?: string;`r`n};

export type BillingItem = {
  id: string;
  claimId: string;
  cptCode: string;
  description: string;
  amount: number;
};

export type BillingPayment = {
  id: string;
  claimId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: string;
};

export type BillingClaimListItem = BillingClaim & {
  patientName: string;
  providerName: string;
  itemCount: number;
  paidAmount: number;
  balance: number;
};

export type BillingClaimDetail = {
  claim: BillingClaim;
  patient: Patient;
  provider: Provider | null;
  encounter: Encounter | null;
  diagnoses: EncounterDiagnosis[];
  procedures: EncounterProcedure[];
  items: BillingItem[];
  payments: BillingPayment[];
};

export type Immunization = {
  id: string;
  patientId: string;
  clinicId: string;
  vaccineName: string;
  doseNumber: number;
  dateAdministered: string;
  providerId: string;
  lotNumber: string;
  notes: string;
  nextDueDate: string | null;
};

export type ImmunizationListItem = Immunization & {
  patientName: string;
  providerName: string;
  reminderStatus: "up_to_date" | "due_soon" | "overdue";
};

export type ClinicalAlert = {
  type: ClinicalAlertType;
  severity: ClinicalAlertSeverity;
  title: string;
  message: string;
};

export type AuditLog = {
  id: string;
  userId: string;
  clinicId?: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown> | null;
  createdAt: string;
  timestamp?: string;
  userName?: string;
};

export type DocumentRecord = {
  id: string;
  patientId: string;
  clinicId: string;
  fileUrl: string;
  fileType: string;
  createdAt?: string;`r`n};
