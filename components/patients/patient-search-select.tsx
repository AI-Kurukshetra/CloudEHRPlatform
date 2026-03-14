"use client";

import { useDeferredValue, useEffect, useState } from "react";

import type { PatientSummaryCard } from "@/lib/types";

export function PatientSearchSelect({
  name,
  label,
  required = true
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [options, setOptions] = useState<PatientSummaryCard[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPatients() {
      setLoading(true);
      const params = new URLSearchParams({
        search: deferredQuery,
        page: "1",
        limit: "8"
      });

      const response = await fetch(`/api/patients?${params.toString()}`, {
        headers: {
          accept: "application/json"
        }
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const payload = await response.json();
      if (!active) {
        return;
      }

      const nextOptions = (payload.data ?? []) as PatientSummaryCard[];
      setOptions(nextOptions);
      setSelectedId((current) => current || nextOptions[0]?.id || "");
      setLoading(false);
    }

    loadPatients().catch(() => {
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [deferredQuery]);

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={selectedId} required={required} />
      <label className="block text-sm text-ink/75">
        {label}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by patient, guardian, or phone"
        />
      </label>
      <label className="block text-sm text-ink/75">
        Matching patients
        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          disabled={loading || options.length === 0}
        >
          {options.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName} · {patient.phone}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-ink/55">
        {loading ? "Searching patient records..." : options.length ? `${options.length} patient matches loaded from the server.` : "No patient matches found."}
      </p>
    </div>
  );
}

