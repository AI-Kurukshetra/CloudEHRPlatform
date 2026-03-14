import { notFound } from "next/navigation";

import { SectionCard } from "@/components/dashboard/section-card";
import { EncounterForm } from "@/components/forms/encounter-form";
import { AppShell } from "@/components/layout/app-shell";
import { ClinicalAlertList } from "@/components/ui/clinical-alert-list";
import { Modal } from "@/components/ui/modal";
import { requireUser } from "@/lib/auth";
import { getEncounterDetailById } from "@/lib/encounter-repositories";
import { listPatients, listProviders } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function EncounterDetailPage({
  params
}: {
  params: Promise<{ encounterId: string }>;
}) {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const { encounterId } = await params;
  const [detail, patients, providers] = await Promise.all([
    getEncounterDetailById(encounterId, user.clinicId),
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <AppShell
      user={user}
      title={`Encounter for ${detail.patient.firstName} ${detail.patient.lastName}`}
      subtitle="Review the SOAP note, clinical coding, and decision support output for this visit."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <SectionCard eyebrow="SOAP" title={detail.encounter.visitReason}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1rem] bg-white/55 p-4"><p className="text-xs uppercase tracking-[0.22em] text-ink/45">Subjective</p><p className="mt-3 text-sm text-ink/75">{detail.note?.subjective || "Not documented."}</p></div>
              <div className="rounded-[1rem] bg-white/55 p-4"><p className="text-xs uppercase tracking-[0.22em] text-ink/45">Objective</p><p className="mt-3 text-sm text-ink/75">{detail.note?.objective || "Not documented."}</p></div>
              <div className="rounded-[1rem] bg-white/55 p-4"><p className="text-xs uppercase tracking-[0.22em] text-ink/45">Assessment</p><p className="mt-3 text-sm text-ink/75">{detail.note?.assessment || "Not documented."}</p></div>
              <div className="rounded-[1rem] bg-white/55 p-4"><p className="text-xs uppercase tracking-[0.22em] text-ink/45">Plan</p><p className="mt-3 text-sm text-ink/75">{detail.note?.plan || "Not documented."}</p></div>
            </div>
          </SectionCard>
          <SectionCard eyebrow="Coding" title="Diagnoses and procedures">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-ink">Diagnoses</p>
                <div className="mt-3 space-y-3">
                  {detail.diagnoses.map((diagnosis) => <div key={diagnosis.id} className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75"><p className="font-medium text-ink">{diagnosis.icd10Code} · {diagnosis.diagnosisName}</p><p className="mt-1">{diagnosis.notes || "No coding notes."}</p></div>)}
                  {detail.diagnoses.length === 0 ? <p className="text-sm text-ink/65">No diagnoses documented.</p> : null}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Procedures</p>
                <div className="mt-3 space-y-3">
                  {detail.procedures.map((procedure) => <div key={procedure.id} className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75"><p className="font-medium text-ink">{procedure.cptCode} · {procedure.procedureName}</p><p className="mt-1">{procedure.notes || "No procedure notes."}</p></div>)}
                  {detail.procedures.length === 0 ? <p className="text-sm text-ink/65">No procedures documented.</p> : null}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
        <div className="space-y-6">
          <SectionCard eyebrow="Decision support" title="Alerts and reminders">
            <ClinicalAlertList alerts={detail.alerts} />
          </SectionCard>
          <SectionCard eyebrow="Meta" title="Encounter status">
            <div className="space-y-3 rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75">
              <p><span className="font-medium text-ink">Provider:</span> {detail.provider?.fullName ?? "Unknown provider"}</p>
              <p><span className="font-medium text-ink">Status:</span> {detail.encounter.status}</p>
              <p><span className="font-medium text-ink">Created:</span> {formatDateTime(detail.encounter.createdAt)}</p>
            </div>
            {user.role !== "staff" ? (
              <div className="mt-4">
                <Modal triggerLabel="Edit encounter" title="Update encounter">
                  <EncounterForm
                    clinicId={user.clinicId}
                    encounterId={detail.encounter.id}
                    patientOptions={patients.map((patient) => ({ id: patient.id, label: `${patient.firstName} ${patient.lastName}` }))}
                    providerOptions={providers.map((provider) => ({ id: provider.id, label: provider.fullName }))}
                    defaultValues={{
                      patientId: detail.encounter.patientId,
                      providerId: detail.encounter.providerId,
                      appointmentId: detail.encounter.appointmentId ?? null,
                      visitReason: detail.encounter.visitReason,
                      status: detail.encounter.status,
                      note: detail.note ?? undefined,
                      diagnoses: detail.diagnoses.map((item) => ({ icd10Code: item.icd10Code, diagnosisName: item.diagnosisName, notes: item.notes })),
                      procedures: detail.procedures.map((item) => ({ cptCode: item.cptCode, procedureName: item.procedureName, notes: item.notes }))
                    }}
                  />
                </Modal>
              </div>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}