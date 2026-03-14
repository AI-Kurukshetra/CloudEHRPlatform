import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { listAuditLogs, listProviders, listUsers } from "@/lib/repositories";

export default async function AdminPage() {
  const user = await requireUser(["admin"]);
  const [users, providers, auditLogs] = await Promise.all([
    listUsers(user.clinicId),
    listProviders(user.clinicId),
    listAuditLogs(user.clinicId)
  ]);

  return (
    <AppShell
      user={user}
      title="Administration workspace"
      subtitle="Manage users, clinic settings, audit posture, and supporting operational controls."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard eyebrow="Access" title="Users and roles">
          <div className="space-y-3">
            {users.map((member) => (
              <div key={member.id} className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/75">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{member.fullName}</p>
                    <p className="mt-1">{member.email}</p>
                  </div>
                  <span className="pill bg-teal-soft text-teal">{member.role}</span>
                </div>
              </div>
            ))}
            {users.length === 0 ? <p className="text-sm text-ink/65">No application users exist for this clinic yet.</p> : null}
          </div>
        </SectionCard>
        <SectionCard eyebrow="Clinic operations" title="Providers, billing, and facility controls">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/75">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Providers</p>
              <div className="mt-3 space-y-2">
                {providers.map((provider) => (
                  <div key={provider.id}>
                    <p className="font-medium text-ink">{provider.fullName}</p>
                    <p>{provider.specialty} | License {provider.licenseNumber}</p>
                  </div>
                ))}
                {providers.length === 0 ? <p>No providers configured yet.</p> : null}
              </div>
            </div>
            <div className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/75">
              <p className="text-xs uppercase tracking-[0.22em] text-ink/45">Configuration domains</p>
              <ul className="mt-3 space-y-2">
                <li>Billing and insurance verification</li>
                <li>Inventory and facility management</li>
                <li>Clinical templates and location policies</li>
                <li>Storage and retention configuration</li>
              </ul>
            </div>
          </div>
        </SectionCard>
      </div>
      <SectionCard eyebrow="Audit trail" title="Recent system actions">
        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div key={log.id} className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/75">
              <p className="font-medium text-ink">{log.action}</p>
              <p className="mt-1">{new Date(log.timestamp).toLocaleString()}</p>
            </div>
          ))}
          {auditLogs.length === 0 ? <p className="text-sm text-ink/65">No audit activity recorded yet.</p> : null}
        </div>
      </SectionCard>
    </AppShell>
  );
}
