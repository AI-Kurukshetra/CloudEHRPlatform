import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { listAppointments } from "@/lib/repositories";

export async function GET() {
  const session = await getSessionUser();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appointments = await listAppointments(session.clinicId);
  const monthlyRevenue = appointments.reduce<Record<string, number>>((acc, appointment) => {
    const month = new Date(appointment.appointmentTime).toLocaleString("en-US", { month: "short" });
    acc[month] = (acc[month] ?? 0) + 150;
    return acc;
  }, {});

  return NextResponse.json({
    data: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }))
  });
}
