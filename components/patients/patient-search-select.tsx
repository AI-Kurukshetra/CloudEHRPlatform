"use client";

import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
  const [selectedId, setSelectedId] = useState("");

  const patientsQuery = useQuery({
    queryKey: ["patient-picker", deferredQuery],
    queryFn: async () => {
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
        throw new Error("Unable to search patient records.");
      }

      const payload = await response.json();
      return (payload.data ?? []) as PatientSummaryCard[];
    }
  });

  const options = patientsQuery.data ?? [];
  const effectiveSelectedId = selectedId || options[0]?.id || "";

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={effectiveSelectedId} required={required} />
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
          value={effectiveSelectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          disabled={patientsQuery.isLoading || options.length === 0}
        >
          {options.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName} · {patient.phone}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-ink/55">
        {patientsQuery.isLoading
          ? "Searching patient records..."
          : options.length
            ? `${options.length} patient matches loaded from the server.`
            : "No patient matches found."}
      </p>
    </div>
  );
}