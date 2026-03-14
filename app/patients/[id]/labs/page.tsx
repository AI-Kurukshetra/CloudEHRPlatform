import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listLabOrdersWithDetails } from "@/lib/lab-repositories";
import { getPatient } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function PatientLabsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const { id } = await params;
  const [patient, labs] = await Promise.all([
    getPatient(id, user.clinicId),
    listLabOrdersWithDetails(user.clinicId, { patientId: id, providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined })
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <AppShell user={user} title={`${patient.firstName} ${patient.lastName} labs`} subtitle="Laboratory orders, report availability, and component review for this patient.">
      <SectionCard eyebrow="Laboratory" title="Patient lab workflow">
        <DataTable columns={["Lab ID", "Test", "Status", "Ordered", "Report"]}>
          {labs.map((lab) => (
            <tr key={lab.id}>
              <td className="px-4 py-3 font-medium text-ink"><Link href={`/labs/${lab.id}`}>{lab.id.slice(0, 8).toUpperCase()}</Link></td>
              <td className="px-4 py-3 text-ink/75">{lab.testName}</td>
              <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{lab.status}</span></td>
              <td className="px-4 py-3 text-ink/75">{formatDateTime(lab.orderedAt)}</td>
              <td className="px-4 py-3 text-ink/75">{lab.reportCount > 0 ? "Available" : "Pending"}</td>
            </tr>
          ))}
        </DataTable>
        {labs.length === 0 ? <p className="mt-4 text-sm text-ink/65">No lab orders exist for this patient yet.</p> : null}
      </SectionCard>
    </AppShell>
  );
}