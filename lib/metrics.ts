import { listAppointments, listAuditLogs, listLabResults, listPatients, listPrescriptions, listProviders } from "@/lib/repositories";

function groupAppointmentsByWeekday(appointmentTimes: string[]) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = new Map(labels.map((label) => [label, 0]));

  appointmentTimes.forEach((timestamp) => {
    const label = labels[new Date(timestamp).getDay()];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return labels.map((label) => ({ label, value: counts.get(label) ?? 0 }));
}

export async function getDashboardMetrics(clinicId: string) {
  const [patients, appointments, prescriptions, providers] = await Promise.all([
    listPatients(clinicId),
    listAppointments(clinicId),
    listPrescriptions(clinicId),
    listProviders(clinicId)
  ]);

  return {
    totalPatients: patients.length,
    upcomingAppointments: appointments.filter((item) => item.status === "scheduled").length,
    providers: providers.length,
    activePrescriptions: prescriptions.length
  };
}

export async function getAdminAnalytics(clinicId: string) {
  const [appointments, labs, auditLogs] = await Promise.all([
    listAppointments(clinicId),
    listLabResults(clinicId),
    listAuditLogs(clinicId, 10)
  ]);

  const providerProductivityMap = new Map<string, number>();
  appointments.forEach((appointment) => {
    providerProductivityMap.set(
      appointment.providerId,
      (providerProductivityMap.get(appointment.providerId) ?? 0) + 1
    );
  });

  return {
    appointmentTrend: groupAppointmentsByWeekday(appointments.map((item) => item.appointmentTime)),
    providerProductivity: Array.from(providerProductivityMap.entries()).map(([provider, encounters]) => ({
      provider,
      encounters
    })),
    patientOutcomes: {
      abnormalLabs: labs.filter((lab) => lab.flag !== "normal").length,
      completedVisits: appointments.filter((item) => item.status === "completed").length
    },
    recentAuditLogs: auditLogs
  };
}
