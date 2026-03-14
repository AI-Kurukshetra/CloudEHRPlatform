import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { LabWorkflowForm } from "@/components/forms/lab-workflow-form";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listLabOrdersWithDetails } from "@/lib/lab-repositories";
import { listPatients, listProviders } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function LabsPage() {
  const user = await requireUser(["admin", "doctor", "patient"]);
  const [labs, patients, providers] = await Promise.all([
    listLabOrdersWithDetails(user.clinicId, {
      patientId: user.role === "patient" ? user.patientId ?? undefined : undefined,
      providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined
    }),
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);

  return (
    <AppShell
      user={user}
      title="Laboratory management"
      subtitle="Track ordering, report receipt, component values, abnormal markers, and secure report links."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Lab orders" value={labs.length} hint="Orders visible to the current role scope." />
        <MetricCard label="Patients" value={patients.length} hint="Patients available for laboratory workflows." />
        <MetricCard label="Providers" value={providers.length} hint="Clinicians ordering or reviewing labs." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard eyebrow="Workflow" title="Laboratory orders">
          <DataTable columns={["Lab ID", "Patient", "Test", "Status", "Ordered date"]}>
            {labs.map((lab) => (
              <tr key={lab.id}>
                <td className="px-4 py-3 font-medium text-ink"><Link href={`/labs/${lab.id}`}>{lab.id.slice(0, 8).toUpperCase()}</Link></td>
                <td className="px-4 py-3 text-ink/75">{lab.patientName}</td>
                <td className="px-4 py-3 text-ink/75">{lab.testName}</td>
                <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{lab.status}</span></td>
                <td className="px-4 py-3 text-ink/75">{formatDateTime(lab.orderedAt)}</td>
              </tr>
            ))}
          </DataTable>
          {labs.length === 0 ? <p className="mt-4 text-sm text-ink/65">No laboratory orders are available yet.</p> : null}
        </SectionCard>
        <SectionCard eyebrow="Create" title="Order laboratory work">
          {user.role === "patient" ? (
            <p className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/70">Patients can review their lab orders and reports here. Ordering is restricted to clinical staff.</p>
          ) : (
            <div className="space-y-4">
              <Modal triggerLabel="Open lab order form" title="Create lab order">
                <LabWorkflowForm
                  clinicId={user.clinicId}
                  patientOptions={patients.map((patient) => ({ id: patient.id, label: `${patient.firstName} ${patient.lastName}` }))}
                  providerOptions={providers.map((provider) => ({ id: provider.id, label: provider.fullName }))}
                />
              </Modal>
              <Link href="/labs/orders/new" className="inline-flex rounded-full bg-black/5 px-4 py-3 text-sm text-ink">Open full-page lab workflow</Link>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}