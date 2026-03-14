import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { requireUser } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/metrics";
import { listAppointments, listPatients, listProviders } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const [metrics, appointments, patients, providers] = await Promise.all([
    getDashboardMetrics(user.clinicId),
    listAppointments(user.clinicId),
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);
  const params = await searchParams;
  const denied = params.denied === "1";

  return (
    <AppShell
      user={user}
      title="Operational command center"
      subtitle="Monitor appointments, patient volume, and prescribing activity across your clinic."
    >
      {denied ? (
        <div className="surface border-coral/20 bg-coral/10 p-4 text-sm text-coral">
          Access was denied for the requested route. Your current role remains signed in.
        </div>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Patients" value={metrics.totalPatients} hint="Active patient charts available to care teams." />
        <MetricCard label="Upcoming visits" value={metrics.upcomingAppointments} hint="Scheduled appointments awaiting check-in." />
        <MetricCard label="Providers" value={metrics.providers} hint="Credentialed clinicians configured for the clinic." />
        <MetricCard label="Prescriptions" value={metrics.activePrescriptions} hint="Recent medication orders issued from visit workflows." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Schedule" title="Next appointments">
          <div className="space-y-3">
            {appointments.slice(0, 4).map((appointment) => {
              const patient = patients.find((item) => item.id === appointment.patientId);
              const provider = providers.find((item) => item.id === appointment.providerId);

              return (
                <div key={appointment.id} className="rounded-[1.2rem] border border-black/5 bg-white/55 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-ink">{patient?.firstName ?? "Unknown"} {patient?.lastName ?? "Patient"}</p>
                      <p className="text-sm text-ink/65">{appointment.reason} with {provider?.fullName ?? "Unknown provider"}</p>
                    </div>
                    <span className="pill bg-teal-soft text-teal">{appointment.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-ink/70">{formatDateTime(appointment.appointmentTime)} | {appointment.durationMinutes} minutes</p>
                </div>
              );
            })}
            {appointments.length === 0 ? <p className="text-sm text-ink/65">No appointments yet. Add providers and patients to begin scheduling.</p> : null}
          </div>
        </SectionCard>
        <SectionCard eyebrow="Role-aware workflow" title="Recommended next actions">
          <div className="grid gap-3">
            <div className="rounded-[1.2rem] bg-teal px-4 py-4 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">For {user.role}</p>
              <p className="mt-2 text-lg font-semibold">
                {user.role === "admin"
                  ? "Review audit logs, revenue reporting, and clinic-level settings."
                  : user.role === "doctor"
                    ? "Complete visit notes, issue prescriptions, and track abnormal labs."
                    : user.role === "staff"
                      ? "Register patients, confirm insurance, and resolve scheduling gaps."
                      : "Check upcoming visits, prescriptions, and newly available lab results."}
              </p>
            </div>
            <div className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/70">
              Supabase Auth now backs sessions, and core EHR records are loaded from the configured project. If the workspace is empty, apply the SQL migration and begin creating clinic records through the app.
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
