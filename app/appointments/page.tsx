import { AppointmentList } from "@/components/appointments/appointment-list";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { listAppointments, listPatients, listProviders } from "@/lib/repositories";

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser(["admin", "doctor", "staff", "patient"]);
  const [appointments, patients, providers] = await Promise.all([
    listAppointments(user.clinicId, {
      patientId: user.role === "patient" ? user.patientId ?? undefined : undefined,
      providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined
    }),
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;
  const canBookAsPatient = user.role !== "patient" || Boolean(user.patientId);

  return (
    <AppShell
      user={user}
      title="Appointment operations"
      subtitle="Coordinate provider availability, protect against double booking, and keep patients informed."
    >
      {error ? <div className="surface border-coral/20 bg-coral/10 p-4 text-sm text-coral">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Scheduled" value={appointments.filter((item) => item.status === "scheduled").length} hint="Visits currently booked and awaiting execution." />
        <MetricCard label="Providers" value={providers.length} hint="Available clinicians mapped to visit slots." />
        <MetricCard label="Patients" value={patients.length} hint="Patients actively present in scheduling workflows." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Calendar" title="Appointment list">
          <AppointmentList appointments={appointments} patients={patients} providers={providers} />
        </SectionCard>
        <SectionCard eyebrow="Booking" title="Create a new appointment">
          {!canBookAsPatient ? (
            <p className="rounded-[1.1rem] bg-white/55 p-4 text-sm text-ink/70">This patient login is not linked to a patient chart yet. Register a patient account with patient details or link the auth user to a chart in the database.</p>
          ) : providers.length === 0 ? (
            <p className="rounded-[1.1rem] bg-white/55 p-4 text-sm text-ink/70">No providers are available yet. Create a doctor account first.</p>
          ) : (
            <form action="/api/appointments" method="post" className="grid gap-4">
              <input type="hidden" name="clinicId" value={user.clinicId} />
              <input type="hidden" name="redirectTo" value="/appointments" />
              {user.role === "patient" ? (
                <input type="hidden" name="patientId" value={user.patientId ?? ""} />
              ) : (
                <label className="block text-sm text-ink/75">
                  Patient
                  <select name="patientId" defaultValue={patients[0]?.id}>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>{patient.firstName} {patient.lastName}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block text-sm text-ink/75">
                Provider
                <select name="providerId" defaultValue={user.role === "doctor" ? user.providerId ?? providers[0]?.id : providers[0]?.id}>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.fullName}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-ink/75">
                Appointment time
                <input name="appointmentTime" type="datetime-local" required />
              </label>
              <label className="block text-sm text-ink/75">
                Duration (minutes)
                <input name="durationMinutes" type="number" min="15" max="180" defaultValue="30" required />
              </label>
              <label className="block text-sm text-ink/75">
                Reason for visit
                <input name="reason" defaultValue="Follow-up visit" required />
              </label>
              <label className="block text-sm text-ink/75">
                Notes
                <textarea name="notes" rows={4} placeholder="Pre-visit context, reminders, or scheduling notes" />
              </label>
              <button type="submit">Book appointment</button>
            </form>
          )}
          <p className="mt-4 text-sm text-ink/65">Server validation enforces duration bounds and rejects provider overlaps in the same slot.</p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
