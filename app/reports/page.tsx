import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/metrics";
import { listProviders } from "@/lib/repositories";

export default async function ReportsPage() {
  const user = await requireUser(["admin"]);
  const [analytics, providers] = await Promise.all([
    getAdminAnalytics(user.clinicId),
    listProviders(user.clinicId)
  ]);

  return (
    <AppShell
      user={user}
      title="Reporting and analytics"
      subtitle="Track appointment demand, provider productivity, billing posture, and clinical follow-up indicators."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard eyebrow="Appointments" title="Trend snapshot">
          <div className="grid gap-3">
            {analytics.appointmentTrend.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <span className="w-10 text-sm text-ink/60">{item.label}</span>
                <div className="h-3 flex-1 rounded-full bg-white/70">
                  <div className="h-3 rounded-full bg-teal" style={{ width: `${Math.min(item.value * 8, 100)}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-medium text-ink">{item.value}</span>
              </div>
            ))}
            {analytics.appointmentTrend.every((item) => item.value === 0) ? <p className="text-sm text-ink/65">No appointment volume has been recorded yet.</p> : null}
          </div>
        </SectionCard>
        <SectionCard eyebrow="Productivity" title="Provider throughput">
          <div className="space-y-3">
            {analytics.providerProductivity.map((item) => {
              const provider = providers.find((entry) => entry.id === item.provider);
              return (
                <div key={item.provider} className="rounded-[1.2rem] bg-white/55 p-4">
                  <p className="font-medium text-ink">{provider?.fullName ?? item.provider}</p>
                  <p className="mt-1 text-sm text-ink/65">{item.encounters} encounters recorded</p>
                </div>
              );
            })}
            {analytics.providerProductivity.length === 0 ? <p className="text-sm text-ink/65">No provider activity has been recorded yet.</p> : null}
          </div>
        </SectionCard>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard eyebrow="Outcomes" title="Clinical follow-up indicators">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.2rem] bg-teal px-4 py-5 text-white">
              <p className="text-sm uppercase tracking-[0.22em] text-white/65">Abnormal labs</p>
              <p className="mt-3 text-3xl font-semibold">{analytics.patientOutcomes.abnormalLabs}</p>
            </div>
            <div className="rounded-[1.2rem] bg-ink px-4 py-5 text-white">
              <p className="text-sm uppercase tracking-[0.22em] text-white/65">Completed visits</p>
              <p className="mt-3 text-3xl font-semibold">{analytics.patientOutcomes.completedVisits}</p>
            </div>
          </div>
        </SectionCard>
        <SectionCard eyebrow="Governance" title="Recent audit activity">
          <div className="space-y-3">
            {analytics.recentAuditLogs.map((log) => (
              <div key={log.id} className="rounded-[1.2rem] bg-white/55 p-4 text-sm text-ink/75">
                <p className="font-medium text-ink">{log.action}</p>
                <p className="mt-1 text-ink/60">User {log.userId} | {new Date(log.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {analytics.recentAuditLogs.length === 0 ? <p className="text-sm text-ink/65">No audit entries have been recorded yet.</p> : null}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
