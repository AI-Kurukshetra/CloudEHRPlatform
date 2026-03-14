import type { Route } from "next";
import Link from "next/link";

import type { PaginationMeta } from "@/lib/types";

type SearchParams = Record<string, string | undefined>;

function buildHref(pathname: string, params: SearchParams, page: number) {
  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value || key === "page") {
      continue;
    }

    nextParams.set(key, value);
  }

  nextParams.set("page", String(page));

  return `${pathname}?${nextParams.toString()}`;
}

export function PaginationControls({
  pathname,
  params,
  pagination
}: {
  pathname: string;
  params: SearchParams;
  pagination: PaginationMeta;
}) {
  if (pagination.total <= pagination.limit) {
    return null;
  }

  const pages = Array.from(
    new Set([
      1,
      Math.max(1, pagination.page - 1),
      pagination.page,
      Math.min(pagination.totalPages, pagination.page + 1),
      pagination.totalPages
    ])
  ).filter((page) => page >= 1 && page <= pagination.totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[color:var(--border)] bg-white/60 px-4 py-3 text-sm text-ink/70">
      <span>
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} total results
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildHref(pathname, params, Math.max(1, pagination.page - 1)) as Route}
          className={`rounded-full px-3 py-1 ${pagination.hasPreviousPage ? "bg-ink text-white" : "pointer-events-none bg-black/5 text-ink/35"}`}
        >
          Previous
        </Link>
        {pages.map((page) => (
          <Link
            key={page}
            href={buildHref(pathname, params, page) as Route}
            className={`rounded-full px-3 py-1 ${page === pagination.page ? "bg-teal text-white" : "bg-black/5 text-ink"}`}
          >
            {page}
          </Link>
        ))}
        <Link
          href={buildHref(pathname, params, Math.min(pagination.totalPages, pagination.page + 1)) as Route}
          className={`rounded-full px-3 py-1 ${pagination.hasNextPage ? "bg-ink text-white" : "pointer-events-none bg-black/5 text-ink/35"}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}

