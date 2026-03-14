import { SectionCard } from "@/components/dashboard/section-card";
import { BillingClaimForm } from "@/components/forms/billing-claim-form";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listBillingClaimsWithDetails } from "@/lib/billing-repositories";
import { listEncountersWithDetails } from "@/lib/encounter-repositories";
import { listPatients, listProviders } from "@/lib/repositories";

export default async function BillingClaimsPage() {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const [claims, patients, providers, encounters] = await Promise.all([
    listBillingClaimsWithDetails(user.clinicId, user.role === "doctor" ? { providerId: user.providerId ?? undefined } : undefined),
    listPatients(user.clinicId),
    listProviders(user.clinicId),
    listEncountersWithDetails(user.clinicId, user.role === "doctor" ? { providerId: user.providerId ?? undefined } : undefined)
  ]);

  return (
    <AppShell user={user} title="Billing claims" subtitle="Generate claims from encounters with diagnoses, procedures, and CPT-coded billing items.">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard eyebrow="Claims" title="Claim status tracking">
          <DataTable columns={["Claim", "Patient", "Provider", "Status", "Balance"]}>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td className="px-4 py-3 font-medium text-ink">{claim.claimNumber}</td>
                <td className="px-4 py-3 text-ink/75">{claim.patientName}</td>
                <td className="px-4 py-3 text-ink/75">{claim.providerName}</td>
                <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{claim.status}</span></td>
                <td className="px-4 py-3 text-ink/75">${claim.balance.toFixed(2)}</td>
              </tr>
            ))}
          </DataTable>
          {claims.length === 0 ? <p className="mt-4 text-sm text-ink/65">No claims have been generated yet.</p> : null}
        </SectionCard>
        <SectionCard eyebrow="Generate" title="Create claim from encounter">
          {user.role === "doctor" ? (
            <p className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/70">Doctors can review billing claims, while claim generation is reserved for admin and staff workflows.</p>
          ) : (
            <Modal triggerLabel="Open claim form" title="Generate claim">
              <BillingClaimForm
                clinicId={user.clinicId}
                patientOptions={patients.map((patient) => ({ id: patient.id, label: `${patient.firstName} ${patient.lastName}` }))}
                providerOptions={providers.map((provider) => ({ id: provider.id, label: provider.fullName }))}
                encounterOptions={encounters.map((encounter) => ({ id: encounter.id, label: `${encounter.patientName} · ${encounter.visitReason}` }))}
              />
            </Modal>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}