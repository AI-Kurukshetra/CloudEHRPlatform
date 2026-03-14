import { notFound } from "next/navigation";

import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listImmunizationsWithDetails } from "@/lib/immunization-repositories";
import { getPatient } from "@/lib/repositories";

export default async function PatientImmunizationsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const { id } = await params;
  const [patient, immunizations] = await Promise.all([
    getPatient(id, user.clinicId),
    listImmunizationsWithDetails(user.clinicId, { patientId: id, providerId: user.role === "doctor" ? user.providerId ?? undefined : undefined })
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <AppShell user={user} title={`${patient.firstName} ${patient.lastName} immunizations`} subtitle="Dose history, lot numbers, and reminder tracking for this patient.">
      <SectionCard eyebrow="Vaccines" title="Patient immunization timeline">
        <DataTable columns={["Vaccine", "Dose", "Date", "Provider", "Reminder"]}>
          {immunizations.map((record) => (
            <tr key={record.id}>
              <td className="px-4 py-3 font-medium text-ink">{record.vaccineName}</td>
              <td className="px-4 py-3 text-ink/75">Dose {record.doseNumber}</td>
              <td className="px-4 py-3 text-ink/75">{record.dateAdministered}</td>
              <td className="px-4 py-3 text-ink/75">{record.providerName}</td>
              <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{record.reminderStatus.replace("_", " ")}</span></td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </AppShell>
  );
}