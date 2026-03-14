import { SectionCard } from "@/components/dashboard/section-card";
import { LabWorkflowForm } from "@/components/forms/lab-workflow-form";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { listPatients, listProviders } from "@/lib/repositories";

export default async function NewLabOrderPage() {
  const user = await requireUser(["admin", "doctor"]);
  const [patients, providers] = await Promise.all([
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);

  return (
    <AppShell user={user} title="New laboratory order" subtitle="Create a lab order, attach a report summary, and capture component-level result values.">
      <SectionCard eyebrow="Order" title="Laboratory workflow builder">
        <LabWorkflowForm
          clinicId={user.clinicId}
          patientOptions={patients.map((patient) => ({ id: patient.id, label: `${patient.firstName} ${patient.lastName}` }))}
          providerOptions={providers.map((provider) => ({ id: provider.id, label: provider.fullName }))}
        />
      </SectionCard>
    </AppShell>
  );
}