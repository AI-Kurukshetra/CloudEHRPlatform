import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { EncounterForm } from "@/components/forms/encounter-form";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listEncountersWithDetails } from "@/lib/encounter-repositories";
import { listPatients, listProviders } from "@/lib/repositories";
import { encounterFiltersSchema } from "@/lib/schemas";
import { formatDateTime } from "@/lib/utils";

function pick(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function EncountersPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const params = await searchParams;
  const parsed = encounterFiltersSchema.safeParse({
    status: pick(params.status),
    patientId: pick(params.patientId),
    providerId: user.role === "doctor" ? user.providerId ?? undefined : pick(params.providerId),
    page: 1,
    limit: 20
  });
  const filters = parsed.success ? parsed.data : {};
  const [encounters, patients, providers] = await Promise.all([
    listEncountersWithDetails(user.clinicId, filters),
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);

  const patientOptions = patients.map((patient) => ({ id: patient.id, label: `${patient.firstName} ${patient.lastName}` }));
  const providerOptions = providers.map((provider) => ({ id: provider.id, label: provider.fullName }));

  return (
    <AppShell
      user={user}
      title="Clinical documentation"
      subtitle="Capture structured SOAP encounter notes, diagnoses, procedures, and visit summaries in one workflow."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Encounters" value={encounters.length} hint="Structured encounters recorded for the current clinic scope." />
        <MetricCard label="Patients" value={patientOptions.length} hint="Patients available for encounter authoring." />
        <MetricCard label="Providers" value={providerOptions.length} hint="Providers available for multi-clinician documentation." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard eyebrow="Visits" title="Encounter log">
          <DataTable columns={["Patient", "Provider", "Reason", "Status", "Created"]}>
            {encounters.map((encounter) => (
              <tr key={encounter.id}>
                <td className="px-4 py-3 font-medium text-ink"><Link href={`/encounters/${encounter.id}`}>{encounter.patientName}</Link></td>
                <td className="px-4 py-3 text-ink/75">{encounter.providerName}</td>
                <td className="px-4 py-3 text-ink/75">{encounter.visitReason}</td>
                <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{encounter.status}</span></td>
                <td className="px-4 py-3 text-ink/75">{formatDateTime(encounter.createdAt)}</td>
              </tr>
            ))}
          </DataTable>
          {encounters.length === 0 ? <p className="mt-4 text-sm text-ink/65">No encounters have been documented yet.</p> : null}
        </SectionCard>
        <SectionCard eyebrow="Author" title="New encounter">
          {user.role === "staff" ? (
            <p className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/70">Staff can review encounter history but encounter authoring is restricted to clinicians and admins.</p>
          ) : (
            <div className="space-y-4">
              <Modal triggerLabel="Open encounter form" title="Create encounter">
                <EncounterForm clinicId={user.clinicId} patientOptions={patientOptions} providerOptions={providerOptions} />
              </Modal>
              <Link href="/encounters/new" className="inline-flex rounded-full bg-black/5 px-4 py-3 text-sm text-ink">Open full-page authoring</Link>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}