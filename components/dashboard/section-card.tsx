import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  eyebrow,
  className,
  children
}: {
  title: string;
  eyebrow?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("surface p-5 lg:p-6", className)}>
      <div className="mb-4">
        {eyebrow ? <p className="text-xs uppercase tracking-[0.24em] text-ink/45">{eyebrow}</p> : null}
        <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}
