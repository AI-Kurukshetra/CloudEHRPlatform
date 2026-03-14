import Link from "next/link";

import { SectionCard } from "@/components/dashboard/section-card";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { requireUser } from "@/lib/auth";
import { listLabResultsPage } from "@/lib/query-repositories";
import { labResultFiltersSchema } from "@/lib/schemas";
import { formatDateTime } from "@/lib/utils";

function pickParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export default async function LabsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser(["admin", "doctor", "patient"]);
  const params = await searchParams;
  const parsed = labResultFiltersSchema.safeParse({
    search: pickParam(params.search),
    flag: pickParam(params.flag),
    page: pickParam(params.page),
    limit: pickParam(params.limit) ?? "20",
    patientId: user.role === "patient" ? user.patientId ?? undefined : undefined
  });
  const filters = parsed.success ? parsed.data : { page: 1, limit: 20 };
  const labs = await listLabResultsPage(user.clinicId, filters);

  return (
    <AppShell
      user={user}
      title="Lab results integration"
      subtitle="Page and filter imported results so large lab histories stay responsive."
    >
      <SectionCard eyebrow="Results" title="Recent laboratory data">
        <form method="get" className="mb-5 grid gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-white/60 p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="block text-sm text-ink/75">
            Search
            <input name="search" defaultValue={filters.search} placeholder="Test name or result" />
          </label>
          <label className="block text-sm text-ink/75">
            Flag
            <select name="flag" defaultValue={filters.flag ?? ""}>
              <option value="">All flags</option>
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <label className="block text-sm text-ink/75">
            Page size
            <select name="limit" defaultValue={String(filters.limit)}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
          <div className="flex flex-wrap items-end gap-3">
            <button type="submit">Apply</button>
            <Link href="/labs" className="rounded-full bg-black/5 px-4 py-3 text-sm text-ink">Clear</Link>
          </div>
        </form>
        <div className="grid gap-4 lg:grid-cols-2">
          {labs.data.map((lab) => (
            <article key={lab.id} className="rounded-[1.2rem] border border-black/5 bg-white/55 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-ink/45">{lab.patientName}</p>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{lab.testName}</h3>
                </div>
                <span className={`pill ${lab.flag === "normal" ? "bg-teal-soft text-teal" : "bg-coral/10 text-coral"}`}>{lab.flag}</span>
              </div>
              <p className="mt-4 text-base text-ink/80">{lab.result}</p>
              <p className="mt-3 text-sm text-ink/60">Collected {formatDateTime(lab.collectedAt)}</p>
            </article>
          ))}
          {labs.data.length === 0 ? <p className="text-sm text-ink/65">No lab results are available for the current search.</p> : null}
        </div>
        <div className="mt-5">
          <PaginationControls
            pathname="/labs"
            params={{ search: filters.search, flag: filters.flag, limit: String(filters.limit) }}
            pagination={labs.pagination}
          />
        </div>
      </SectionCard>
    </AppShell>
  );
}


