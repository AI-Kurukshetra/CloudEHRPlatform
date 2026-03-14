import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listEncountersWithDetails } from "@/lib/encounter-repositories";
import { getPatient } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function PatientEncountersPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const { id } = await params;
  const [patient, encounters] = await Promise.all([
    getPatient(id, user.clinicId),
    listEncountersWithDetails(user.clinicId, { patientId: id, providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined })
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <AppShell user={user} title={`${patient.firstName} ${patient.lastName} encounters`} subtitle="Patient visit summaries and clinical documentation history.">
      <SectionCard eyebrow="Timeline" title="Encounter history">
        <DataTable columns={["Encounter", "Provider", "Status", "Created"]}>
          {encounters.map((encounter) => (
            <tr key={encounter.id}>
              <td className="px-4 py-3 font-medium text-ink"><Link href={`/encounters/${encounter.id}`}>{encounter.visitReason}</Link></td>
              <td className="px-4 py-3 text-ink/75">{encounter.providerName}</td>
              <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{encounter.status}</span></td>
              <td className="px-4 py-3 text-ink/75">{formatDateTime(encounter.createdAt)}</td>
            </tr>
          ))}
        </DataTable>
        {encounters.length === 0 ? <p className="mt-4 text-sm text-ink/65">No encounters are documented for this patient yet.</p> : null}
      </SectionCard>
    </AppShell>
  );
}