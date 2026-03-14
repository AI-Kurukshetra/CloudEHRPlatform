import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { listEncountersWithDetails } from "@/lib/encounter-repositories";
import { listLabOrdersWithDetails } from "@/lib/lab-repositories";
import { listAppointments, listPrescriptions } from "@/lib/repositories";
import { formatDateTime } from "@/lib/utils";

export default async function PortalDashboardPage() {
  const user = await requireUser(["patient"]);
  if (!user.patientId) {
    return null;
  }

  const [appointments, prescriptions, labs, encounters] = await Promise.all([
    listAppointments(user.clinicId, { patientId: user.patientId }),
    listPrescriptions(user.clinicId, { patientId: user.patientId }),
    listLabOrdersWithDetails(user.clinicId, { patientId: user.patientId }),
    listEncountersWithDetails(user.clinicId, { patientId: user.patientId })
  ]);

  return (
    <AppShell user={user} title="Patient portal" subtitle="Review your upcoming care, medication orders, lab reports, and visit summaries.">
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Upcoming visits" value={appointments.filter((item) => item.status === "scheduled").length} hint="Scheduled appointments visible to your account." />
        <MetricCard label="Prescriptions" value={prescriptions.length} hint="Medication orders linked to your chart." />
        <MetricCard label="Lab orders" value={labs.length} hint="Laboratory orders and reports available in the portal." />
        <MetricCard label="Visit summaries" value={encounters.length} hint="Encounter summaries available for review." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Next up" title="Upcoming appointments">
          <div className="space-y-3">
            {appointments.filter((item) => item.status === "scheduled").slice(0, 4).map((appointment) => (
              <div key={appointment.id} className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75">
                <p className="font-medium text-ink">{appointment.reason}</p>
                <p className="mt-1">{formatDateTime(appointment.appointmentTime)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard eyebrow="Quick links" title="Portal modules">
          <div className="grid gap-3">
            <Link href="/portal/appointments" className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75">Appointments</Link>
            <Link href="/portal/prescriptions" className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75">Prescriptions</Link>
            <Link href="/portal/labs" className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75">Laboratory reports</Link>
            <Link href="/portal/records" className="rounded-[1rem] bg-white/55 p-4 text-sm text-ink/75">Visit summaries and profile</Link>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}