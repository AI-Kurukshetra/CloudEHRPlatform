import { SectionCard } from "@/components/dashboard/section-card";
import { ImmunizationForm } from "@/components/forms/immunization-form";
import { AppShell } from "@/components/layout/app-shell";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listImmunizationsWithDetails } from "@/lib/immunization-repositories";
import { listPatients, listProviders } from "@/lib/repositories";

export default async function ImmunizationsPage() {
  const user = await requireUser(["admin", "doctor", "patient"]);
  const [immunizations, patients, providers] = await Promise.all([
    listImmunizationsWithDetails(user.clinicId, { patientId: user.role === "patient" ? user.patientId ?? undefined : undefined, providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined }),
    listPatients(user.clinicId),
    listProviders(user.clinicId)
  ]);

  return (
    <AppShell user={user} title="Immunization tracking" subtitle="Maintain vaccine history, dose schedules, and reminder status by patient.">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard eyebrow="Timeline" title="Immunization records">
          <DataTable columns={["Patient", "Vaccine", "Dose", "Date", "Reminder"]}>
            {immunizations.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-3 font-medium text-ink">{record.patientName}</td>
                <td className="px-4 py-3 text-ink/75">{record.vaccineName}</td>
                <td className="px-4 py-3 text-ink/75">Dose {record.doseNumber}</td>
                <td className="px-4 py-3 text-ink/75">{record.dateAdministered}</td>
                <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{record.reminderStatus.replace("_", " ")}</span></td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>
        <SectionCard eyebrow="Record" title="Add immunization">
          {user.role === "patient" ? (
            <p className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/70">Patients can review their immunization timeline here. Recording vaccines is restricted to clinicians.</p>
          ) : (
            <Modal triggerLabel="Open immunization form" title="Record immunization">
              <ImmunizationForm
                clinicId={user.clinicId}
                patientOptions={patients.map((patient) => ({ id: patient.id, label: `${patient.firstName} ${patient.lastName}` }))}
                providerOptions={providers.map((provider) => ({ id: provider.id, label: provider.fullName }))}
              />
            </Modal>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}