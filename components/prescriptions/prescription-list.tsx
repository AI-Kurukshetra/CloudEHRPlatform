import Link from "next/link";

import { formatDateTime } from "@/lib/utils";

export function PrescriptionList({
  prescriptions,
  patients,
  providers
}: {
  prescriptions: Array<{
    id: string;
    patientId: string;
    providerId: string;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    issuedAt: string;
  }>;
  patients: Array<{ id: string; firstName: string; lastName: string }>;
  providers: Array<{ id: string; fullName: string }>;
}) {
  return (
    <div className="grid gap-4">
      {prescriptions.map((prescription) => {
        const patient = patients.find((item) => item.id === prescription.patientId);
        const provider = providers.find((item) => item.id === prescription.providerId);

        return (
          <article key={prescription.id} className="rounded-[1.2rem] border border-[color:var(--border)] bg-white/55 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-ink/45">Medication</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{prescription.drugName}</h3>
                <p className="mt-1 text-sm text-ink/65">
                  {prescription.dosage} | {prescription.frequency} | {prescription.duration}
                </p>
              </div>
              <span className="pill bg-sand text-coral">Issued {formatDateTime(prescription.issuedAt)}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Patient:{" "}
                {patient ? (
                  <Link href={`/patients/${prescription.patientId}`} className="font-medium text-teal hover:text-ink">
                    {patient.firstName} {patient.lastName}
                  </Link>
                ) : (
                  "Unknown"
                )}
              </span>
              <span>Ordering provider: {provider?.fullName ?? "Unknown"}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
