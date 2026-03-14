"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { immunizationSchema } from "@/lib/schemas";

type ImmunizationValues = z.infer<typeof immunizationSchema>;

export function ImmunizationForm({
  clinicId,
  patientOptions,
  providerOptions,
  immunizationId,
  defaultValues,
  redirectTo
}: {
  clinicId: string;
  patientOptions: Array<{ id: string; label: string }>;
  providerOptions: Array<{ id: string; label: string }>;
  immunizationId?: string;
  defaultValues?: Partial<ImmunizationValues>;
  redirectTo?: string;
}) {
  const router = useRouter();
  const form = useForm<ImmunizationValues>({
    resolver: zodResolver(immunizationSchema),
    defaultValues: {
      clinicId,
      patientId: defaultValues?.patientId ?? patientOptions[0]?.id ?? "",
      providerId: defaultValues?.providerId ?? providerOptions[0]?.id ?? "",
      vaccineName: defaultValues?.vaccineName ?? "",
      doseNumber: defaultValues?.doseNumber ?? 1,
      dateAdministered: defaultValues?.dateAdministered ?? new Date().toISOString().slice(0, 10),
      lotNumber: defaultValues?.lotNumber ?? "",
      notes: defaultValues?.notes ?? "",
      nextDueDate: defaultValues?.nextDueDate ?? null
    }
  });

  const mutation = useMutation({
    mutationFn: async (payload: ImmunizationValues) => {
      const response = await fetch("/api/immunizations", {
        method: immunizationId ? "PUT" : "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(immunizationId ? { id: immunizationId, ...payload } : payload)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to save immunization.");
      }
      return response.json();
    },
    onSuccess: () => {
      router.push(redirectTo ?? "/immunizations");
      router.refresh();
    }
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-ink/75">
          Patient
          <select {...form.register("patientId")}>
            {patientOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label className="block text-sm text-ink/75">
          Provider
          <select {...form.register("providerId")}>
            {providerOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-ink/75">
          Vaccine name
          <input {...form.register("vaccineName")} />
        </label>
        <label className="block text-sm text-ink/75">
          Dose number
          <input type="number" min="1" {...form.register("doseNumber", { valueAsNumber: true })} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-ink/75">
          Date administered
          <input type="date" {...form.register("dateAdministered")} />
        </label>
        <label className="block text-sm text-ink/75">
          Next due date
          <input type="date" {...form.register("nextDueDate")} />
        </label>
      </div>
      <label className="block text-sm text-ink/75">
        Lot number
        <input {...form.register("lotNumber")} />
      </label>
      <label className="block text-sm text-ink/75">
        Notes
        <textarea rows={4} {...form.register("notes")} />
      </label>
      {mutation.error ? <p className="text-sm text-coral">{mutation.error.message}</p> : null}
      <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving immunization..." : immunizationId ? "Update immunization" : "Record immunization"}</button>
    </form>
  );
}