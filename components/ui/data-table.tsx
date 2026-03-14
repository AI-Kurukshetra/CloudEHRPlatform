import type { ReactNode } from "react";

export function DataTable({
  columns,
  children
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-[color:var(--border)] bg-white/40">
      <table className="min-w-full divide-y divide-black/5 text-sm">
        <thead className="bg-white/70 text-left text-ink/55">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 bg-white/35">{children}</tbody>
      </table>
    </div>
  );
}