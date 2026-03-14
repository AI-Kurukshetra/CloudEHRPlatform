"use client";

import type { ReactNode } from "react";
import { useState } from "react";

export function Modal({
  triggerLabel,
  title,
  children
}: {
  triggerLabel: string;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>{triggerLabel}</button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4 py-8">
          <div className="surface max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-ink">{title}</h2>
              <button type="button" className="secondary" onClick={() => setOpen(false)}>Close</button>
            </div>
            {children}
          </div>
        </div>
      ) : null}
    </>
  );
}