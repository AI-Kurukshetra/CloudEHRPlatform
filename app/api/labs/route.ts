import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { listLabResultsPage } from "@/lib/query-repositories";
import { labResultFiltersSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  const session = await getSessionUser();

  if (!session || !["admin", "doctor", "patient"].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = labResultFiltersSchema.safeParse({
    ...searchParams,
    patientId: session.role === "patient" ? session.patientId ?? undefined : searchParams.patientId
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const labs = await listLabResultsPage(session.clinicId, parsed.data);
  return NextResponse.json(labs);
}

