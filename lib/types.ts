export type Role = "admin" | "doctor" | "staff" | "patient";
export type PatientGender = "male" | "female" | "other" | "unknown";

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
  createdAt: string;
};

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
};

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
  flag: "normal" | "abnormal" | "critical";
  collectedAt: string;
};

export type LabResultListItem = LabResult & {
  patientName: string;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
};

export type DocumentRecord = {
  id: string;
  patientId: string;
  clinicId: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
};

