import { SectionCard } from "@/components/dashboard/section-card";
import { PortalProfileForm } from "@/components/forms/portal-profile-form";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listEncountersWithDetails } from "@/lib/encounter-repositories";
import { getPatient } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function PortalRecordsPage() {
  const user = await requireUser(["patient"]);
  if (!user.patientId) return null;
  const [patient, encounters] = await Promise.all([
    getPatient(user.patientId, user.clinicId),
    listEncountersWithDetails(user.clinicId, { patientId: user.patientId })
  ]);

  if (!patient) return null;

  return (
    <AppShell user={user} title="Portal records" subtitle="Review visit summaries and update your personal profile details securely.">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard eyebrow="Records" title="Visit summaries">
          <DataTable columns={["Visit", "Provider", "Status", "Created"]}>
            {encounters.map((encounter) => (
              <tr key={encounter.id}>
                <td className="px-4 py-3 font-medium text-ink">{encounter.visitReason}</td>
                <td className="px-4 py-3 text-ink/75">{encounter.providerName}</td>
                <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{encounter.status}</span></td>
                <td className="px-4 py-3 text-ink/75">{formatDateTime(encounter.createdAt)}</td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>
        <SectionCard eyebrow="Profile" title="Update personal information">
          <PortalProfileForm
            patientId={patient.id}
            defaultValues={{
              phone: patient.phone,
              email: patient.email,
              guardianName: patient.guardianName,
              insuranceId: patient.insuranceId
            }}
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}