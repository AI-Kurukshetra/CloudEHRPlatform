import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listPrescriptions, listProviders } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function PortalPrescriptionsPage() {
  const user = await requireUser(["patient"]);
  if (!user.patientId) return null;
  const [prescriptions, providers] = await Promise.all([
    listPrescriptions(user.clinicId, { patientId: user.patientId }),
    listProviders(user.clinicId)
  ]);
  const providerMap = new Map(providers.map((provider) => [provider.id, provider.fullName]));

  return (
    <AppShell user={user} title="Portal prescriptions" subtitle="Review your medication orders and prescribing clinicians.">
      <SectionCard eyebrow="Medications" title="Active and historical prescriptions">
        <DataTable columns={["Medication", "Dosage", "Provider", "Issued"]}>
          {prescriptions.map((prescription) => (
            <tr key={prescription.id}>
              <td className="px-4 py-3 font-medium text-ink">{prescription.drugName}</td>
              <td className="px-4 py-3 text-ink/75">{prescription.dosage} · {prescription.frequency} · {prescription.duration}</td>
              <td className="px-4 py-3 text-ink/75">{providerMap.get(prescription.providerId) ?? "Unknown provider"}</td>
              <td className="px-4 py-3 text-ink/75">{formatDateTime(prescription.issuedAt)}</td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </AppShell>
  );
}