"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

import { encounterBundleSchema } from "@/lib/schemas";

type EncounterFormValues = z.infer<typeof encounterBundleSchema>;

export function EncounterForm({
  clinicId,
  patientOptions,
  providerOptions,
  encounterId,
  defaultValues,
  redirectTo
}: {
  clinicId: string;
  patientOptions: Array<{ id: string; label: string }>;
  providerOptions: Array<{ id: string; label: string }>;
  encounterId?: string;
  defaultValues?: Partial<EncounterFormValues>;
  redirectTo?: string;
}) {
  const router = useRouter();
  const form = useForm<EncounterFormValues>({
    resolver: zodResolver(encounterBundleSchema),
    defaultValues: {
      clinicId,
      patientId: defaultValues?.patientId ?? patientOptions[0]?.id ?? "",
      providerId: defaultValues?.providerId ?? providerOptions[0]?.id ?? "",
      appointmentId: defaultValues?.appointmentId ?? null,
      visitReason: defaultValues?.visitReason ?? "",
      status: defaultValues?.status ?? "draft",
      note: {
        subjective: defaultValues?.note?.subjective ?? "",
        objective: defaultValues?.note?.objective ?? "",
        assessment: defaultValues?.note?.assessment ?? "",
        plan: defaultValues?.note?.plan ?? ""
      },
      diagnoses: defaultValues?.diagnoses ?? [],
      procedures: defaultValues?.procedures ?? []
    }
  });

  const diagnoses = useFieldArray({ control: form.control, name: "diagnoses" });
  const procedures = useFieldArray({ control: form.control, name: "procedures" });

  const mutation = useMutation({
    mutationFn: async (payload: EncounterFormValues) => {
      const response = await fetch("/api/encounters", {
        method: encounterId ? "PUT" : "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(encounterId ? { id: encounterId, ...payload } : payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to save encounter.");
      }

      return response.json();
    },
    onSuccess: (payload) => {
      const nextId = payload.data?.encounter?.id ?? payload.data?.id;
      router.push(redirectTo ?? (nextId ? `/encounters/${nextId}` : "/encounters"));
      router.refresh();
    }
  });

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
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
      <label className="block text-sm text-ink/75">
        Visit reason
        <input {...form.register("visitReason")} />
      </label>
      <label className="block text-sm text-ink/75">
        Status
        <select {...form.register("status")}>
          <option value="draft">Draft</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-ink/75">
          Subjective
          <textarea rows={5} {...form.register("note.subjective")} />
        </label>
        <label className="block text-sm text-ink/75">
          Objective
          <textarea rows={5} {...form.register("note.objective")} />
        </label>
        <label className="block text-sm text-ink/75">
          Assessment
          <textarea rows={5} {...form.register("note.assessment")} />
        </label>
        <label className="block text-sm text-ink/75">
          Plan
          <textarea rows={5} {...form.register("note.plan")} />
        </label>
      </div>
      <div className="rounded-[1rem] border border-[color:var(--border)] bg-white/45 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-ink">Diagnoses</h3>
          <button type="button" className="secondary" onClick={() => diagnoses.append({ icd10Code: "", diagnosisName: "", notes: "" })}>Add diagnosis</button>
        </div>
        <div className="space-y-3">
          {diagnoses.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-[0.9fr_1.2fr_1fr_auto]">
              <input placeholder="ICD-10" {...form.register(`diagnoses.${index}.icd10Code`)} />
              <input placeholder="Diagnosis name" {...form.register(`diagnoses.${index}.diagnosisName`)} />
              <input placeholder="Notes" {...form.register(`diagnoses.${index}.notes`)} />
              <button type="button" className="secondary" onClick={() => diagnoses.remove(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[1rem] border border-[color:var(--border)] bg-white/45 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-ink">Procedures</h3>
          <button type="button" className="secondary" onClick={() => procedures.append({ cptCode: "", procedureName: "", notes: "" })}>Add procedure</button>
        </div>
        <div className="space-y-3">
          {procedures.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-[0.9fr_1.2fr_1fr_auto]">
              <input placeholder="CPT" {...form.register(`procedures.${index}.cptCode`)} />
              <input placeholder="Procedure name" {...form.register(`procedures.${index}.procedureName`)} />
              <input placeholder="Notes" {...form.register(`procedures.${index}.notes`)} />
              <button type="button" className="secondary" onClick={() => procedures.remove(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
      {mutation.error ? <p className="text-sm text-coral">{mutation.error.message}</p> : null}
      <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving encounter..." : encounterId ? "Update encounter" : "Create encounter"}</button>
    </form>
  );
}