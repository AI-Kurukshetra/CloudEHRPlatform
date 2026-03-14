import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalString = (max: number) => z.preprocess(
  emptyStringToUndefined,
  z.string().trim().min(1).max(max).optional()
);

const optionalUuid = z.preprocess(
  emptyStringToUndefined,
  z.string().uuid().optional()
);

const optionalDateString = z.preprocess(
  emptyStringToUndefined,
  z.string().date().optional()
);

const optionalDateTimeString = z.preprocess(
  emptyStringToUndefined,
  z.string().datetime().optional()
);

const currencySchema = z.coerce.number().min(0).max(1000000);

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const roleSchema = z.enum(["admin", "doctor", "staff", "patient"]);
export const genderSchema = z.enum(["male", "female", "other", "unknown"]);
export const appointmentStatusSchema = z.enum(["scheduled", "checked_in", "completed", "cancelled"]);
export const encounterStatusSchema = z.enum(["draft", "in_progress", "completed"]);
export const labResultFlagSchema = z.enum(["normal", "abnormal", "critical"]);
export const labOrderStatusSchema = z.enum(["ordered", "collected", "reported", "reviewed", "cancelled"]);
export const billingClaimStatusSchema = z.enum(["draft", "submitted", "paid", "partially_paid", "denied"]);
export const paymentMethodSchema = z.enum(["insurance", "card", "cash", "bank_transfer", "check"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(120),
  role: roleSchema,
  clinicId: z.string().min(2).max(64),
  specialty: z.string().max(120).optional().or(z.literal("")),
  licenseNumber: z.string().max(120).optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  gender: genderSchema.optional(),
  phone: z.string().max(20).optional().or(z.literal("")),
  insuranceId: z.string().max(40).optional().or(z.literal(""))
}).superRefine((value, ctx) => {
  if (value.role === "patient") {
    if (!value.dob) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dob"], message: "Date of birth is required for patient accounts." });
    }
    if (!value.phone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Phone is required for patient accounts." });
    }
    if (!value.insuranceId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["insuranceId"], message: "Insurance ID is required for patient accounts." });
    }
  }

  if (value.role === "doctor") {
    if (!value.specialty) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["specialty"], message: "Specialty is required for doctor accounts." });
    }
    if (!value.licenseNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["licenseNumber"], message: "License number is required for doctor accounts." });
    }
  }
});

export const patientSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  dob: z.string().date(),
  gender: genderSchema,
  guardianName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().min(7).max(20),
  email: z.string().email(),
  insuranceId: z.string().min(4).max(40),
  clinicId: z.string().min(2).max(64),
  allergies: z.array(z.string().min(1)).default([]),
  medications: z.array(z.string().min(1)).default([]),
  diagnoses: z.array(z.string().min(1)).default([]),
  pastMedicalHistory: z.string().max(50000).optional().or(z.literal("")),
  authUserId: z.string().uuid().optional().nullable()
});

export const patientSelfUpdateSchema = z.object({
  phone: z.string().min(7).max(20),
  email: z.string().email(),
  guardianName: z.string().max(120).optional().or(z.literal("")),
  insuranceId: z.string().min(4).max(40)
});

export const patientFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  dob: optionalDateString,
  gender: z.preprocess(emptyStringToUndefined, genderSchema.optional()),
  allergy: optionalString(120),
  registrationDate: optionalDateString,
  providerId: optionalUuid
});

export const patientLookupSchema = z.object({
  search: optionalString(120),
  limit: z.coerce.number().int().min(1).max(20).default(10)
});

export const medicalHistorySchema = z.object({
  pastMedicalHistory: z.string().max(50000)
});

export const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  clinicId: z.string().min(2).max(64),
  appointmentTime: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(15).max(180),
  status: appointmentStatusSchema.default("scheduled"),
  reason: z.string().min(3).max(240),
  notes: z.string().max(1000).default("")
});

export const appointmentFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  status: z.preprocess(emptyStringToUndefined, appointmentStatusSchema.optional()),
  patientId: optionalUuid,
  providerId: optionalUuid,
  dateFrom: optionalDateString,
  dateTo: optionalDateString
});

export const prescriptionSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  clinicId: z.string().min(2).max(64),
  encounterId: optionalUuid.nullable(),
  drugName: z.string().min(2).max(120),
  dosage: z.string().min(1).max(120),
  frequency: z.string().min(1).max(120),
  duration: z.string().min(1).max(120)
});

export const prescriptionFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  patientId: optionalUuid,
  providerId: optionalUuid
});

export const encounterDiagnosisSchema = z.object({
  icd10Code: z.string().min(3).max(12),
  diagnosisName: z.string().min(2).max(160),
  notes: z.string().max(1000).default("")
});

export const encounterProcedureSchema = z.object({
  cptCode: z.string().min(3).max(12),
  procedureName: z.string().min(2).max(160),
  notes: z.string().max(1000).default("")
});

export const clinicalNoteSchema = z.object({
  encounterId: optionalUuid,
  subjective: z.string().max(8000).default(""),
  objective: z.string().max(8000).default(""),
  assessment: z.string().max(8000).default(""),
  plan: z.string().max(8000).default("")
});

export const encounterSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  clinicId: z.string().min(2).max(64),
  appointmentId: optionalUuid.nullable(),
  visitReason: z.string().min(3).max(240),
  status: encounterStatusSchema.default("draft")
});

export const encounterBundleSchema = encounterSchema.extend({
  note: clinicalNoteSchema.omit({ encounterId: true }),
  diagnoses: z.array(encounterDiagnosisSchema).default([]),
  procedures: z.array(encounterProcedureSchema).default([])
});

export const encounterFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  status: z.preprocess(emptyStringToUndefined, encounterStatusSchema.optional()),
  patientId: optionalUuid,
  providerId: optionalUuid
});

export const labResultFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  patientId: optionalUuid,
  flag: z.preprocess(emptyStringToUndefined, labResultFlagSchema.optional())
});

export const labOrderSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  clinicId: z.string().min(2).max(64),
  encounterId: optionalUuid.nullable(),
  testName: z.string().min(2).max(160),
  labName: z.string().min(2).max(160),
  status: labOrderStatusSchema.default("ordered")
});

export const labReportSchema = z.object({
  labOrderId: z.string().uuid(),
  reportNumber: z.string().min(3).max(40),
  reportDate: z.string().datetime(),
  resultSummary: z.string().min(3).max(4000),
  abnormalFlag: z.coerce.boolean().default(false),
  fileUrl: z.string().max(500).default("")
});

export const labComponentSchema = z.object({
  testComponent: z.string().min(2).max(160),
  value: z.string().min(1).max(160),
  referenceRange: z.string().max(160).default(""),
  unit: z.string().max(40).default(""),
  flag: labResultFlagSchema.default("normal")
});

export const labWorkflowSchema = labOrderSchema.extend({
  report: labReportSchema.omit({ labOrderId: true }).optional(),
  results: z.array(labComponentSchema).default([])
});

export const labOrderFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  patientId: optionalUuid,
  providerId: optionalUuid,
  status: z.preprocess(emptyStringToUndefined, labOrderStatusSchema.optional())
});

export const billingItemSchema = z.object({
  cptCode: z.string().min(3).max(12),
  description: z.string().min(2).max(240),
  amount: currencySchema
});

export const paymentSchema = z.object({
  claimId: z.string().uuid(),
  paymentMethod: paymentMethodSchema,
  amount: currencySchema,
  paymentDate: z.string().datetime()
});

export const billingClaimSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid(),
  providerId: z.string().uuid(),
  clinicId: z.string().min(2).max(64),
  claimNumber: optionalString(40),
  status: billingClaimStatusSchema.default("draft"),
  totalAmount: currencySchema.optional(),
  submittedAt: optionalDateTimeString.nullable(),
  items: z.array(billingItemSchema).min(1)
});

export const billingFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  patientId: optionalUuid,
  providerId: optionalUuid,
  status: z.preprocess(emptyStringToUndefined, billingClaimStatusSchema.optional())
});

export const immunizationSchema = z.object({
  patientId: z.string().uuid(),
  clinicId: z.string().min(2).max(64),
  vaccineName: z.string().min(2).max(160),
  doseNumber: z.coerce.number().int().min(1).max(12),
  dateAdministered: z.string().date(),
  providerId: z.string().uuid(),
  lotNumber: z.string().min(2).max(80),
  notes: z.string().max(1000).default(""),
  nextDueDate: optionalDateString.nullable()
});

export const immunizationFiltersSchema = paginationSchema.extend({
  patientId: optionalUuid,
  providerId: optionalUuid,
  vaccineName: optionalString(120)
});

export const providerSchema = z.object({
  userId: z.string().uuid(),
  clinicId: z.string().min(2).max(64),
  fullName: z.string().min(2).max(120),
  specialty: z.string().min(2).max(120),
  licenseNumber: z.string().min(2).max(120)
});

export const providerFiltersSchema = paginationSchema.extend({
  search: optionalString(120)
});

export const auditLogSchema = z.object({
  userId: z.string().uuid(),
  entityType: z.string().min(2).max(80),
  entityId: z.string().uuid(),
  action: z.string().min(2).max(120),
  changes: z.record(z.string(), z.unknown()).nullable().optional()
});

export const auditFiltersSchema = paginationSchema.extend({
  userId: optionalUuid,
  entityType: optionalString(80),
  action: optionalString(80)
});