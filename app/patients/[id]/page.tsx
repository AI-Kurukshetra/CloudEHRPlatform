import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { getPatientSummary } from "@/lib/repositories";
import { formatDate, formatDateTime } from "@/lib/utils";

export default async function PatientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const { id } = await params;
  const summary = await getPatientSummary(user.clinicId, id);

  if (!summary) {
    notFound();
  }

  const { patient, appointments, prescriptions, labs } = summary;

  return (
    <AppShell
      user={user}
      title={`${patient.firstName} ${patient.lastName}`}
      subtitle="Unified patient chart for demographics, visit history, medication activity, and laboratory review."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard eyebrow="Demographics" title="Chart summary">
          <dl className="grid gap-4 text-sm text-ink/75 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-ink/45">Date of birth</dt>
              <dd className="mt-2 text-base font-medium text-ink">{formatDate(patient.dob)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-ink/45">Insurance</dt>
              <dd className="mt-2 text-base font-medium text-ink">{patient.insuranceId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-ink/45">Phone</dt>
              <dd className="mt-2 text-base font-medium text-ink">{patient.phone}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.22em] text-ink/45">Email</dt>
              <dd className="mt-2 text-base font-medium text-ink">{patient.email}</dd>
            </div>
          </dl>
          <div className="mt-6 grid gap-3">
            <div className="rounded-[1.1rem] bg-white/55 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Allergies</p>
              <p className="mt-2 text-sm text-ink/75">{patient.allergies.length ? patient.allergies.join(", ") : "None documented"}</p>
            </div>
            <div className="rounded-[1.1rem] bg-white/55 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Medications</p>
              <p className="mt-2 text-sm text-ink/75">{patient.medications.length ? patient.medications.join(", ") : "None documented"}</p>
            </div>
            <div className="rounded-[1.1rem] bg-white/55 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Diagnoses</p>
              <p className="mt-2 text-sm text-ink/75">{patient.diagnoses.length ? patient.diagnoses.join(", ") : "None documented"}</p>
            </div>
          </div>
        </SectionCard>
        <div className="space-y-6">
          <SectionCard eyebrow="Encounters" title="Upcoming and historical visits">
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-[1.1rem] border border-black/5 bg-white/55 p-4 text-sm text-ink/75">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-ink">{appointment.reason}</span>
                    <span className="pill bg-teal-soft text-teal">{appointment.status}</span>
                  </div>
                  <p className="mt-2">{formatDateTime(appointment.appointmentTime)}</p>
                  {appointment.notes ? <p className="mt-2 text-ink/65">{appointment.notes}</p> : null}
                </div>
              ))}
              {appointments.length === 0 ? <p className="text-sm text-ink/65">No appointments recorded for this patient yet.</p> : null}
            </div>
          </SectionCard>
          <SectionCard eyebrow="Orders" title="Prescriptions and lab results">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-ink">Prescriptions</p>
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="rounded-[1.1rem] bg-white/55 p-4 text-sm text-ink/75">
                    <p className="font-medium text-ink">{prescription.drugName}</p>
                    <p className="mt-1">{prescription.dosage} | {prescription.frequency} | {prescription.duration}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/45">Issued {formatDateTime(prescription.issuedAt)}</p>
                  </div>
                ))}
                {prescriptions.length === 0 ? <p className="text-sm text-ink/65">No prescriptions recorded yet.</p> : null}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-ink">Lab results</p>
                {labs.map((lab) => (
                  <div key={lab.id} className="rounded-[1.1rem] bg-white/55 p-4 text-sm text-ink/75">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-ink">{lab.testName}</p>
                      <span className="pill bg-sand text-coral">{lab.flag}</span>
                    </div>
                    <p className="mt-1">{lab.result}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-ink/45">Collected {formatDateTime(lab.collectedAt)}</p>
                  </div>
                ))}
                {labs.length === 0 ? <p className="text-sm text-ink/65">No lab results recorded yet.</p> : null}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
      <div className="px-1 text-sm text-ink/70">
        <Link href="/patients" className="font-medium text-teal hover:text-ink">Back to patient roster</Link>
      </div>
    </AppShell>
  );
}
