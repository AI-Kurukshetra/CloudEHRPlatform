import Link from "next/link";

import { AppointmentList } from "@/components/appointments/appointment-list";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { PatientSearchSelect } from "@/components/patients/patient-search-select";
import { requireUser } from "@/lib/auth";
import { listAppointmentsPage } from "@/lib/query-repositories";
import { listProviders } from "@/lib/repositories";
import { appointmentFiltersSchema } from "@/lib/schemas";

function pickParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser(["admin", "doctor", "staff", "patient"]);
  const params = await searchParams;
  const parsed = appointmentFiltersSchema.safeParse({
    search: pickParam(params.search),
    status: pickParam(params.status),
    dateFrom: pickParam(params.dateFrom),
    dateTo: pickParam(params.dateTo),
    page: pickParam(params.page),
    limit: pickParam(params.limit) ?? "20",
    patientId: user.role === "patient" ? user.patientId ?? undefined : undefined,
    providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined
  });
  const filters = parsed.success ? parsed.data : { page: 1, limit: 20 };
  const [appointments, providers] = await Promise.all([
    listAppointmentsPage(user.clinicId, filters),
    listProviders(user.clinicId)
  ]);
  const error = pickParam(params.error);
  const canBookAsPatient = user.role !== "patient" || Boolean(user.patientId);

  return (
    <AppShell
      user={user}
      title="Appointment operations"
      subtitle="Search and page scheduled visits while keeping booking flows usable for large patient directories."
    >
      {error ? <div className="surface border-coral/20 bg-coral/10 p-4 text-sm text-coral">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Matching visits" value={appointments.pagination.total} hint="Appointments returned for the current server-side filter set." />
        <MetricCard label="Visible rows" value={appointments.data.length} hint="Appointments currently rendered in the table." />
        <MetricCard label="Providers" value={providers.length} hint="Available clinicians mapped to scheduling workflows." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Calendar" title="Appointment list">
          <form method="get" className="mb-5 grid gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-white/60 p-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block text-sm text-ink/75 xl:col-span-2">
              Search
              <input name="search" defaultValue={filters.search} placeholder="Reason or scheduling notes" />
            </label>
            <label className="block text-sm text-ink/75">
              Status
              <select name="status" defaultValue={filters.status ?? ""}>
                <option value="">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="checked_in">Checked in</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="block text-sm text-ink/75">
              Page size
              <select name="limit" defaultValue={String(filters.limit)}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </label>
            <label className="block text-sm text-ink/75">
              From
              <input name="dateFrom" type="date" defaultValue={filters.dateFrom} />
            </label>
            <label className="block text-sm text-ink/75">
              To
              <input name="dateTo" type="date" defaultValue={filters.dateTo} />
            </label>
            <div className="flex flex-wrap items-end gap-3 md:col-span-2 xl:col-span-4">
              <button type="submit">Apply filters</button>
              <Link href="/appointments" className="rounded-full bg-black/5 px-4 py-3 text-sm text-ink">Clear</Link>
            </div>
          </form>
          <AppointmentList appointments={appointments.data} />
          {appointments.data.length === 0 ? <p className="mt-4 text-sm text-ink/65">No appointments match the current search.</p> : null}
          <div className="mt-5">
            <PaginationControls
              pathname="/appointments"
              params={{
                search: filters.search,
                status: filters.status,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                limit: String(filters.limit)
              }}
              pagination={appointments.pagination}
            />
          </div>
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
                <PatientSearchSelect name="patientId" label="Patient" />
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
          <p className="mt-4 text-sm text-ink/65">The booking form now searches patients server-side instead of rendering the entire clinic directory in a dropdown.</p>
        </SectionCard>
      </div>
    </AppShell>
  );
}


