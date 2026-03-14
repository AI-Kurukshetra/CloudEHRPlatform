import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listAuditLogsDetailed } from "@/lib/audit-repositories";
import { formatDateTime } from "@/lib/utils";

export default async function AuditPage() {
  const user = await requireUser(["admin"]);
  const logs = await listAuditLogsDetailed(user.clinicId);

  return (
    <AppShell user={user} title="Audit trail" subtitle="Track create, update, delete, and review activity across protected healthcare records.">
      <SectionCard eyebrow="Audit" title="Recent activity">
        <DataTable columns={["When", "User", "Entity", "Action"]}>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-3 text-ink/75">{formatDateTime(log.createdAt ?? log.timestamp ?? new Date().toISOString())}</td>
              <td className="px-4 py-3 text-ink/75">{log.userName ?? log.userId}</td>
              <td className="px-4 py-3 text-ink/75">{log.entityType}</td>
              <td className="px-4 py-3 font-medium text-ink">{log.action}</td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </AppShell>
  );
}