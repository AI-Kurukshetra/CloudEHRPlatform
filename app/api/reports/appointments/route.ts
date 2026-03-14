import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getAdminAnalytics } from "@/lib/metrics";

export async function GET() {
  const session = await getSessionUser();

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: (await getAdminAnalytics(session.clinicId)).appointmentTrend });
}
