import Link from "next/link";

import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listLabOrdersWithDetails } from "@/lib/lab-repositories";
import { formatDateTime } from "@/lib/utils";

export default async function PortalLabsPage() {
  const user = await requireUser(["patient"]);
  if (!user.patientId) return null;
  const labs = await listLabOrdersWithDetails(user.clinicId, { patientId: user.patientId });

  return (
    <AppShell user={user} title="Portal laboratory reports" subtitle="Download available reports and review abnormal markers for your ordered labs.">
      <SectionCard eyebrow="Laboratory" title="Your lab orders">
        <DataTable columns={["Lab ID", "Test", "Status", "Ordered", "Report"]}>
          {labs.map((lab) => (
            <tr key={lab.id}>
              <td className="px-4 py-3 font-medium text-ink"><Link href={`/labs/${lab.id}`}>{lab.id.slice(0, 8).toUpperCase()}</Link></td>
              <td className="px-4 py-3 text-ink/75">{lab.testName}</td>
              <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{lab.status}</span></td>
              <td className="px-4 py-3 text-ink/75">{formatDateTime(lab.orderedAt)}</td>
              <td className="px-4 py-3 text-ink/75">{lab.reportCount > 0 ? "Download available" : "Pending"}</td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </AppShell>
  );
}