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

const optionalDateString = z.preprocess(
  emptyStringToUndefined,
  z.string().date().optional()
);

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const roleSchema = z.enum(["admin", "doctor", "staff", "patient"]);
export const genderSchema = z.enum(["male", "female", "other", "unknown"]);

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

export const patientFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  dob: optionalDateString,
  gender: z.preprocess(emptyStringToUndefined, genderSchema.optional()),
  allergy: optionalString(120),
  registrationDate: optionalDateString
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
  durationMinutes: z.number().int().min(15).max(180),
  status: z.enum(["scheduled", "checked_in", "completed", "cancelled"]).default("scheduled"),
  reason: z.string().min(3).max(240),
  notes: z.string().max(1000).default("")
});

export const appointmentFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  status: z.preprocess(emptyStringToUndefined, z.enum(["scheduled", "checked_in", "completed", "cancelled"]).optional()),
  patientId: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  providerId: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  dateFrom: optionalDateString,
  dateTo: optionalDateString
});

export const prescriptionSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  clinicId: z.string().min(2).max(64),
  drugName: z.string().min(2).max(120),
  dosage: z.string().min(1).max(120),
  frequency: z.string().min(1).max(120),
  duration: z.string().min(1).max(120)
});

export const prescriptionFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  patientId: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  providerId: z.preprocess(emptyStringToUndefined, z.string().uuid().optional())
});

export const labResultFiltersSchema = paginationSchema.extend({
  search: optionalString(120),
  patientId: z.preprocess(emptyStringToUndefined, z.string().uuid().optional()),
  flag: z.preprocess(emptyStringToUndefined, z.enum(["normal", "abnormal", "critical"]).optional())
});

