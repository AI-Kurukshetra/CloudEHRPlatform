import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { PatientIntakeForm } from "@/components/patients/patient-intake-form";
import { requireUser } from "@/lib/auth";
import { listPatientsPage } from "@/lib/query-repositories";
import { patientFiltersSchema } from "@/lib/schemas";
import { formatDate } from "@/lib/utils";

function pickParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function PatientsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser(["admin", "doctor", "staff"]);
  const params = await searchParams;
  const parsed = patientFiltersSchema.safeParse({
    search: pickParam(params.search),
    dob: pickParam(params.dob),
    gender: pickParam(params.gender),
    allergy: pickParam(params.allergy),
    registrationDate: pickParam(params.registrationDate),
    page: pickParam(params.page),
    limit: pickParam(params.limit) ?? "20"
  });
  const filters = parsed.success ? parsed.data : { page: 1, limit: 20 };
  const directory = await listPatientsPage(user.clinicId, filters);
  const error = pickParam(params.error);
  const queryParams = {
    search: filters.search,
    dob: filters.dob,
    gender: filters.gender,
    allergy: filters.allergy,
    registrationDate: filters.registrationDate,
    limit: String(filters.limit)
  };

  return (
    <AppShell
      user={user}
      title="Patient chart management"
      subtitle="Search, filter, and page through the patient directory without loading the entire clinic roster into the browser."
    >
      {error ? <div className="surface border-coral/20 bg-coral/10 p-4 text-sm text-coral">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Matching patients" value={directory.pagination.total} hint="Server-side filtered result count for the current directory view." />
        <MetricCard label="Visible on page" value={directory.data.length} hint="Rows currently rendered in the roster." />
        <MetricCard label="Allergy flags" value={directory.data.filter((patient) => patient.allergies.length > 0).length} hint="Patients on the current page with at least one documented allergy." />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard eyebrow="Directory" title="Patient roster">
          <form method="get" className="mb-5 grid gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-white/60 p-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block text-sm text-ink/75 xl:col-span-3">
              Search
              <input name="search" defaultValue={filters.search} placeholder="Patient, guardian, or phone" />
            </label>
            <label className="block text-sm text-ink/75">
              Gender
              <select name="gender" defaultValue={filters.gender ?? ""}>
                <option value="">All genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
            <label className="block text-sm text-ink/75">
              Date of birth
              <input name="dob" type="date" defaultValue={filters.dob} />
            </label>
            <label className="block text-sm text-ink/75">
              Allergy
              <input name="allergy" defaultValue={filters.allergy} placeholder="Penicillin, latex, pollen..." />
            </label>
            <label className="block text-sm text-ink/75">
              Registration date
              <input name="registrationDate" type="date" defaultValue={filters.registrationDate} />
            </label>
            <label className="block text-sm text-ink/75">
              Page size
              <select name="limit" defaultValue={String(filters.limit)}>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </label>
            <div className="flex flex-wrap items-end gap-3 md:col-span-2 xl:col-span-3">
              <button type="submit">Apply filters</button>
              <Link href="/patients" className="rounded-full bg-black/5 px-4 py-3 text-sm text-ink">Clear</Link>
            </div>
          </form>
          <div className="grid gap-3">
            {directory.data.map((patient) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="rounded-[1.2rem] border border-black/5 bg-white/55 p-4 transition hover:-translate-y-0.5 hover:border-teal/25 hover:bg-white/75"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{patient.firstName} {patient.lastName}</h3>
                    <p className="text-sm text-ink/65">DOB {formatDate(patient.dob)} · Phone {patient.phone}</p>
                    {patient.guardianName ? <p className="text-sm text-ink/55">Guardian: {patient.guardianName}</p> : null}
                  </div>
                  <span className="pill bg-sand text-coral">{patient.gender}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/60">
                  <span className="pill bg-white text-ink/75">Registered {formatDate(patient.createdAt)}</span>
                  {patient.allergies.length ? <span className="pill bg-coral/10 text-coral">Allergies: {patient.allergies.join(", ")}</span> : null}
                  {patient.diagnoses.length ? <span className="pill bg-teal-soft text-teal">{patient.diagnoses.join(", ")}</span> : null}
                </div>
              </Link>
            ))}
            {directory.data.length === 0 ? <p className="text-sm text-ink/65">No patients match the current search and filter criteria.</p> : null}
          </div>
          <div className="mt-5">
            <PaginationControls pathname="/patients" params={queryParams} pagination={directory.pagination} />
          </div>
        </SectionCard>
        <SectionCard eyebrow="Intake" title="Register a new patient">
          <PatientIntakeForm clinicId={user.clinicId} />
        </SectionCard>
      </div>
    </AppShell>
  );
}

