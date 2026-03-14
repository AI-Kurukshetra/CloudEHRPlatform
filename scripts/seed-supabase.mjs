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
  name: "Northstar Family Health"
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

  const authUsers = await listAllAuthUsers();
  const existingUserMap = new Map(authUsers.map((user) => [String(user.email || "").toLowerCase(), user]));
  const authByKey = new Map();

  for (const seed of userSeeds) {
    const authUser = await ensureAuthUser(seed, existingUserMap);
    authByKey.set(seed.key, authUser);
  }

  const { error: clinicError } = await supabase.from("clinics").upsert({
    id: clinic.id,
    name: clinic.name
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

  const labRows = [...labSeeds, ...generatedLabs].map((seed) => ({
    id: seed.id,
    patient_id: patientIdsByKey.get(seed.patientKey),
    clinic_id: clinic.id,
    test_name: seed.testName,
    result: seed.result,
    flag: seed.flag,
    collected_at: seed.collectedAt
  }));

  const { error: labsError } = await supabase.from("lab_results").upsert(labRows, { onConflict: "id" });
  if (labsError) {
    throw labsError;
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

  const auditRows = auditLogSeeds.map((seed) => ({
    id: seed.id,
    user_id: authByKey.get(seed.userKey).id,
    action: seed.action,
    timestamp: seed.timestamp
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
  console.log(`- ${prescriptionRows.length} prescriptions`);
  console.log(`- ${labRows.length} lab results`);
  console.log(`- ${medicalRecordRows.length} medical records`);
  console.log(`- ${auditRows.length} audit logs`);
}

main().catch((error) => {
  console.error("Seed failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});





