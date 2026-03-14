import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { PatientIntakeForm } from "@/components/patients/patient-intake-form";
import { requireUser } from "@/lib/auth";
import { listPatients } from "@/lib/repositories";
import { formatDate } from "@/lib/utils";

export default async function PatientsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const patients = await listPatients(user.clinicId);
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <AppShell
      user={user}
      title="Patient chart management"
      subtitle="Maintain demographics, allergies, medications, diagnoses, and intake readiness from a single workspace."
    >
      {error ? <div className="surface border-coral/20 bg-coral/10 p-4 text-sm text-coral">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Patients" value={patients.length} hint="Unique patient charts currently in the clinic index." />
        <MetricCard label="Allergies flagged" value={patients.filter((patient) => patient.allergies.length > 0).length} hint="Patients with at least one documented allergy." />
        <MetricCard label="Chronic conditions" value={patients.filter((patient) => patient.diagnoses.length > 0).length} hint="Charts with active diagnosis history already attached." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Directory" title="Patient roster">
          <div className="grid gap-3">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="rounded-[1.2rem] border border-black/5 bg-white/55 p-4 transition hover:-translate-y-0.5 hover:border-teal/25 hover:bg-white/75"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{patient.firstName} {patient.lastName}</h3>
                    <p className="text-sm text-ink/65">DOB {formatDate(patient.dob)} | Insurance {patient.insuranceId}</p>
                  </div>
                  <span className="pill bg-sand text-coral">{patient.gender}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/60">
                  {patient.allergies.length ? <span className="pill bg-coral/10 text-coral">Allergies: {patient.allergies.join(", ")}</span> : null}
                  {patient.diagnoses.length ? <span className="pill bg-teal-soft text-teal">{patient.diagnoses.join(", ")}</span> : null}
                </div>
              </Link>
            ))}
            {patients.length === 0 ? <p className="text-sm text-ink/65">No patients are stored for this clinic yet.</p> : null}
          </div>
        </SectionCard>
        <SectionCard eyebrow="Intake" title="Register a new patient">
          <PatientIntakeForm clinicId={user.clinicId} />
        </SectionCard>
      </div>
    </AppShell>
  );
}
