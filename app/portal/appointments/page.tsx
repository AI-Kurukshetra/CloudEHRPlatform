import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable } from "@/components/ui/data-table";
import { requireUser } from "@/lib/auth";
import { listAppointments, listProviders } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function PortalAppointmentsPage() {
  const user = await requireUser(["patient"]);
  if (!user.patientId) return null;
  const [appointments, providers] = await Promise.all([
    listAppointments(user.clinicId, { patientId: user.patientId }),
    listProviders(user.clinicId)
  ]);
  const providerMap = new Map(providers.map((provider) => [provider.id, provider.fullName]));

  return (
    <AppShell user={user} title="Portal appointments" subtitle="Review your scheduled and historical appointments.">
      <SectionCard eyebrow="Appointments" title="Your care schedule">
        <DataTable columns={["Reason", "Provider", "Time", "Status"]}>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="px-4 py-3 font-medium text-ink">{appointment.reason}</td>
              <td className="px-4 py-3 text-ink/75">{providerMap.get(appointment.providerId) ?? "Unknown provider"}</td>
              <td className="px-4 py-3 text-ink/75">{formatDateTime(appointment.appointmentTime)}</td>
              <td className="px-4 py-3"><span className="pill bg-teal-soft text-teal">{appointment.status}</span></td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </AppShell>
  );
}