import { SectionCard } from "@/components/dashboard/section-card";
import { EncounterForm } from "@/components/forms/encounter-form";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { listPatients, listProviders } from "@/lib/repositories";

export default async function NewEncounterPage() {
  const user = await requireUser(["admin", "doctor"]);
  const [patients, providers] = await Promise.all([
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);

  return (
    <AppShell
      user={user}
      title="New encounter"
      subtitle="Document the consultation in SOAP format and attach diagnoses and CPT-coded procedures."
    >
      <SectionCard eyebrow="Author" title="Encounter builder">
        <EncounterForm
          clinicId={user.clinicId}
          patientOptions={patients.map((patient) => ({ id: patient.id, label: `${patient.firstName} ${patient.lastName}` }))}
          providerOptions={providers.map((provider) => ({ id: provider.id, label: provider.fullName }))}
        />
      </SectionCard>
    </AppShell>
  );
}