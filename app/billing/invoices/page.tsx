import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listBillingClaimsWithDetails } from "@/lib/billing-repositories";

export default async function BillingInvoicesPage() {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const claims = await listBillingClaimsWithDetails(user.clinicId, user.role === "doctor" ? { providerId: user.providerId ?? undefined } : undefined);

  return (
    <AppShell user={user} title="Invoices" subtitle="Invoice-style view of billed, paid, and outstanding balances by claim.">
      <SectionCard eyebrow="Invoices" title="Claim invoices">
        <DataTable columns={["Invoice", "Patient", "Billed", "Paid", "Balance"]}>
          {claims.map((claim) => (
            <tr key={claim.id}>
              <td className="px-4 py-3 font-medium text-ink">{claim.claimNumber}</td>
              <td className="px-4 py-3 text-ink/75">{claim.patientName}</td>
              <td className="px-4 py-3 text-ink/75">${claim.totalAmount.toFixed(2)}</td>
              <td className="px-4 py-3 text-ink/75">${claim.paidAmount.toFixed(2)}</td>
              <td className="px-4 py-3 text-ink/75">${claim.balance.toFixed(2)}</td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </AppShell>
  );
}