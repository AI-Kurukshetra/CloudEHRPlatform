import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { PrescriptionList } from "@/components/prescriptions/prescription-list";
import { requireUser } from "@/lib/auth";
import { listPatients, listPrescriptions, listProviders } from "@/lib/repositories";

export default async function PrescriptionsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser(["admin", "doctor", "patient"]);
  const [patients, providers, prescriptions] = await Promise.all([
    listPatients(user.clinicId),
    listProviders(user.clinicId),
    listPrescriptions(user.clinicId, {
      patientId: user.role === "patient" ? user.patientId ?? undefined : undefined,
      providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined
    })
  ]);
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <AppShell
      user={user}
      title="Prescription management"
      subtitle="Support e-prescribing, allergy awareness, and pharmacy-ready medication workflows."
    >
      {error ? <div className="surface border-coral/20 bg-coral/10 p-4 text-sm text-coral">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Issued" value={prescriptions.length} hint="Medication orders available in the current role scope." />
        <MetricCard label="Patients" value={patients.length} hint="Charts that can receive medication orders." />
        <MetricCard label="Providers" value={providers.length} hint="Prescribing clinicians configured in the clinic." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard eyebrow="Orders" title="Recent prescriptions">
          <PrescriptionList prescriptions={prescriptions} patients={patients} providers={providers} />
        </SectionCard>
        <SectionCard eyebrow="Create" title="Issue a prescription">
          {user.role !== "doctor" ? (
            <p className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/70">Only doctors can issue prescriptions here. Admin and patient roles have read-only access.</p>
          ) : !user.providerId ? (
            <p className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/70">This doctor account is not linked to a provider profile yet.</p>
          ) : (
            <form action="/api/prescriptions" method="post" className="grid gap-4">
              <input type="hidden" name="clinicId" value={user.clinicId} />
              <input type="hidden" name="redirectTo" value="/prescriptions" />
              <input type="hidden" name="providerId" value={user.providerId} />
              <label className="block text-sm text-ink/75">
                Patient
                <select name="patientId" defaultValue={patients[0]?.id}>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-ink/75">
                Drug name
                <input name="drugName" defaultValue="Atorvastatin" required />
              </label>
              <label className="block text-sm text-ink/75">
                Dosage
                <input name="dosage" defaultValue="10mg" required />
              </label>
              <label className="block text-sm text-ink/75">
                Frequency
                <input name="frequency" defaultValue="Once nightly" required />
              </label>
              <label className="block text-sm text-ink/75">
                Duration
                <input name="duration" defaultValue="30 days" required />
              </label>
              <button type="submit">Issue prescription</button>
            </form>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
