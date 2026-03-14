import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { listLabResults, listPatients } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function LabsPage() {
  const user = await requireUser(["admin", "doctor", "patient"]);
  const [patients, labs] = await Promise.all([
    listPatients(user.clinicId),
    listLabResults(user.clinicId, { patientId: user.role === "patient" ? user.patientId ?? undefined : undefined })
  ]);

  return (
    <AppShell
      user={user}
      title="Lab results integration"
      subtitle="Review imported results, flag abnormalities, and surface clinically important follow-up work."
    >
      <SectionCard eyebrow="Results" title="Recent laboratory data">
        <div className="grid gap-4 lg:grid-cols-2">
          {labs.map((lab) => {
            const patient = patients.find((item) => item.id === lab.patientId);

            return (
              <article key={lab.id} className="rounded-[1.2rem] border border-black/5 bg-white/55 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-ink/45">{patient?.firstName ?? "Unknown"} {patient?.lastName ?? "Patient"}</p>
                    <h3 className="mt-2 text-lg font-semibold text-ink">{lab.testName}</h3>
                  </div>
                  <span className={`pill ${lab.flag === "normal" ? "bg-teal-soft text-teal" : "bg-coral/10 text-coral"}`}>{lab.flag}</span>
                </div>
                <p className="mt-4 text-base text-ink/80">{lab.result}</p>
                <p className="mt-3 text-sm text-ink/60">Collected {formatDateTime(lab.collectedAt)}</p>
              </article>
            );
          })}
          {labs.length === 0 ? <p className="text-sm text-ink/65">No lab results are available yet.</p> : null}
        </div>
      </SectionCard>
    </AppShell>
  );
}
