import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { listBillingClaimsWithDetails } from "@/lib/billing-repositories";

export default async function BillingPage() {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const claims = await listBillingClaimsWithDetails(user.clinicId, user.role === "doctor" ? { providerId: user.providerId ?? undefined } : undefined);
  const totalAmount = claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
  const totalBalance = claims.reduce((sum, claim) => sum + claim.balance, 0);

  return (
    <AppShell user={user} title="Billing & claim management" subtitle="Generate encounter-based claims, monitor payer status, and track payment collections.">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Claims" value={claims.length} hint="Claims in the current clinic scope." />
        <MetricCard label="Billed" value={`$${totalAmount.toFixed(2)}`} hint="Total billed amount across visible claims." />
        <MetricCard label="Outstanding" value={`$${totalBalance.toFixed(2)}`} hint="Remaining balance after posted payments." />
      </section>
      <SectionCard eyebrow="Workspaces" title="Revenue cycle surfaces">
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/billing/claims" className="rounded-[1rem] bg-white/55 p-5 text-sm text-ink/75"><p className="font-semibold text-ink">Claims</p><p className="mt-2">Generate and manage claim submissions from documented encounters.</p></Link>
          <Link href="/billing/invoices" className="rounded-[1rem] bg-white/55 p-5 text-sm text-ink/75"><p className="font-semibold text-ink">Invoices</p><p className="mt-2">Review invoice-style summaries and open balances by patient.</p></Link>
          <Link href="/billing/payments" className="rounded-[1rem] bg-white/55 p-5 text-sm text-ink/75"><p className="font-semibold text-ink">Payments</p><p className="mt-2">Track payments posted against billing claims.</p></Link>
        </div>
      </SectionCard>
    </AppShell>
  );
}