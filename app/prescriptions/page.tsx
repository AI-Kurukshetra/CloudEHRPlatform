import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { PrescriptionComposer } from "@/components/forms/prescription-composer";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { PrescriptionList } from "@/components/prescriptions/prescription-list";
import { requireUser } from "@/lib/auth";
import { listPrescriptionsPage } from "@/lib/query-repositories";
import { listPatients, listProviders } from "@/lib/repositories";
import { prescriptionFiltersSchema } from "@/lib/schemas";

function pickParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function PrescriptionsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser(["admin", "doctor", "patient"]);
  const params = await searchParams;
  const parsed = prescriptionFiltersSchema.safeParse({
    search: pickParam(params.search),
    page: pickParam(params.page),
    limit: pickParam(params.limit) ?? "20",
    patientId: user.role === "patient" ? user.patientId ?? undefined : undefined,
    providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined
  });
  const filters = parsed.success ? parsed.data : { page: 1, limit: 20 };
  const [providers, prescriptions, patients] = await Promise.all([
    listProviders(user.clinicId),
    listPrescriptionsPage(user.clinicId, filters),
    user.role === "doctor" ? listPatients(user.clinicId) : Promise.resolve([])
  ]);
  const error = pickParam(params.error);

  return (
    <AppShell
      user={user}
      title="Prescription management"
      subtitle="Search medication orders while surfacing clinical decision support during prescribing."
    >
      {error ? <div className="surface border-coral/20 bg-coral/10 p-4 text-sm text-coral">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Matching orders" value={prescriptions.pagination.total} hint="Medication orders returned for the active filter set." />
        <MetricCard label="Visible rows" value={prescriptions.data.length} hint="Prescription rows currently rendered." />
        <MetricCard label="Providers" value={providers.length} hint="Prescribing clinicians configured in the clinic." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard eyebrow="Orders" title="Recent prescriptions">
          <form method="get" className="mb-5 grid gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-white/60 p-4 md:grid-cols-[1fr_auto_auto]">
            <label className="block text-sm text-ink/75">
              Search
              <input name="search" defaultValue={filters.search} placeholder="Drug name, dosage, or frequency" />
            </label>
            <label className="block text-sm text-ink/75">
              Page size
              <select name="limit" defaultValue={String(filters.limit)}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <button type="submit">Apply</button>
              <Link href="/prescriptions" className="rounded-full bg-black/5 px-4 py-3 text-sm text-ink">Clear</Link>
            </div>
          </form>
          <PrescriptionList prescriptions={prescriptions.data} />
          {prescriptions.data.length === 0 ? <p className="mt-4 text-sm text-ink/65">No prescriptions match the current search.</p> : null}
          <div className="mt-5">
            <PaginationControls
              pathname="/prescriptions"
              params={{ search: filters.search, limit: String(filters.limit) }}
              pagination={prescriptions.pagination}
            />
          </div>
        </SectionCard>
        <SectionCard eyebrow="Create" title="Issue a prescription">
          {user.role !== "doctor" ? (
            <p className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/70">Only doctors can issue prescriptions here. Admin and patient roles have read-only access.</p>
          ) : !user.providerId ? (
            <p className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/70">This doctor account is not linked to a provider profile yet.</p>
          ) : (
            <PrescriptionComposer clinicId={user.clinicId} providerId={user.providerId} patients={patients} />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}