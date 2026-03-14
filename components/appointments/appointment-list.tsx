import Link from "next/link";

import type { AppointmentListItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function AppointmentList({ appointments }: { appointments: AppointmentListItem[] }) {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-[color:var(--border)]">
      <table className="min-w-full divide-y divide-black/5 text-sm">
        <thead className="bg-white/70 text-left text-ink/55">
          <tr>
            <th className="px-4 py-3 font-medium">Patient</th>
            <th className="px-4 py-3 font-medium">Provider</th>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Duration</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 bg-white/35">
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="px-4 py-3 font-medium text-ink">
                <Link href={`/patients/${appointment.patientId}`} className="hover:text-teal">
                  {appointment.patientName}
                </Link>
              </td>
              <td className="px-4 py-3 text-ink/75">{appointment.providerName}</td>
              <td className="px-4 py-3 text-ink/75">{formatDateTime(appointment.appointmentTime)}</td>
              <td className="px-4 py-3 text-ink/75">{appointment.durationMinutes} min</td>
              <td className="px-4 py-3">
                <span className="pill bg-teal-soft text-teal">{appointment.status}</span>
              </td>
              <td className="px-4 py-3 text-ink/75">{appointment.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
