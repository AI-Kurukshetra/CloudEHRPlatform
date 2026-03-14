import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listProvidersWithFilters } from "@/lib/provider-repositories";

export default async function ProvidersPage() {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const providers = await listProvidersWithFilters(user.clinicId);

  return (
    <AppShell user={user} title="Provider roster" subtitle="Review credentialed clinicians, specialties, and multi-provider clinic coverage.">
      <SectionCard eyebrow="Providers" title="Clinic providers">
        <DataTable columns={["Provider", "Specialty", "License"]}>
          {providers.map((provider) => (
            <tr key={provider.id}>
              <td className="px-4 py-3 font-medium text-ink">{provider.fullName}</td>
              <td className="px-4 py-3 text-ink/75">{provider.specialty}</td>
              <td className="px-4 py-3 text-ink/75">{provider.licenseNumber}</td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </AppShell>
  );
}