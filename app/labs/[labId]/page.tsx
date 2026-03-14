import { notFound } from "next/navigation";

import { SectionCard } from "@/components/dashboard/section-card";
import { LabWorkflowForm } from "@/components/forms/lab-workflow-form";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import { requireUser } from "@/lib/auth";
import { getLabWorkflow } from "@/lib/lab-repositories";
import { listPatients, listProviders } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function LabDetailPage({
  params
}: {
  params: Promise<{ labId: string }>;
}) {
  const user = await requireUser(["admin", "doctor", "patient"]);
  const { labId } = await params;
  const [detail, patients, providers] = await Promise.all([
    getLabWorkflow(labId, user.clinicId),
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);

  if (!detail) {
    notFound();
  }

  if (user.role === "patient" && detail.patient.authUserId !== user.id) {
    notFound();
  }

  return (
    <AppShell user={user} title={`${detail.order.testName} laboratory report`} subtitle="Detailed report components, reference ranges, abnormal markers, and report file access.">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <SectionCard eyebrow="Report" title={`${detail.patient.firstName} ${detail.patient.lastName}`}>
          <div className="grid gap-3 rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75">
            <p><span className="font-medium text-ink">Lab ID:</span> {detail.order.id.slice(0, 8).toUpperCase()}</p>
            <p><span className="font-medium text-ink">Test:</span> {detail.order.testName}</p>
            <p><span className="font-medium text-ink">Status:</span> {detail.order.status}</p>
            <p><span className="font-medium text-ink">Ordered:</span> {formatDateTime(detail.order.orderedAt)}</p>
            <p><span className="font-medium text-ink">Laboratory:</span> {detail.order.labName}</p>
            {detail.report?.fileUrl ? <a href={detail.report.fileUrl} className="font-medium text-teal">Download report PDF</a> : <p>No report PDF has been attached yet.</p>}
          </div>
          <div className="mt-4 space-y-3">
            {detail.results.map((result) => (
              <div key={result.id} className="rounded-[1rem] border border-[color:var(--border)] bg-white/55 p-4 text-sm text-ink/75">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-ink">{result.testComponent}</p>
                  <span className={`pill ${result.flag === "normal" ? "bg-teal-soft text-teal" : "bg-coral/10 text-coral"}`}>{result.flag}</span>
                </div>
                <p className="mt-2">{result.value} {result.unit}</p>
                <p className="mt-1 text-ink/60">Reference range: {result.referenceRange || "Not supplied"}</p>
              </div>
            ))}
            {detail.results.length === 0 ? <p className="text-sm text-ink/65">No component results have been recorded yet.</p> : null}
          </div>
        </SectionCard>
        <SectionCard eyebrow="Update" title="Maintain laboratory workflow">
          {user.role === "patient" ? (
            <p className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/70">Patients can review completed reports here. Editing is restricted to clinical staff.</p>
          ) : (
            <Modal triggerLabel="Edit lab workflow" title="Update lab workflow">
              <LabWorkflowForm
                clinicId={user.clinicId}
                labId={detail.order.id}
                patientOptions={patients.map((patient) => ({ id: patient.id, label: `${patient.firstName} ${patient.lastName}` }))}
                providerOptions={providers.map((provider) => ({ id: provider.id, label: provider.fullName }))}
                defaultValues={{
                  patientId: detail.order.patientId,
                  providerId: detail.order.providerId,
                  encounterId: detail.order.encounterId ?? null,
                  testName: detail.order.testName,
                  labName: detail.order.labName,
                  status: detail.order.status,
                  report: detail.report ? {
                    reportNumber: detail.report.reportNumber,
                    reportDate: detail.report.reportDate,
                    resultSummary: detail.report.resultSummary,
                    abnormalFlag: detail.report.abnormalFlag,
                    fileUrl: detail.report.fileUrl
                  } : undefined,
                  results: detail.results.map((result) => ({
                    testComponent: result.testComponent,
                    value: result.value,
                    referenceRange: result.referenceRange,
                    unit: result.unit,
                    flag: result.flag
                  }))
                }}
              />
            </Modal>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}