"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

import { labWorkflowSchema } from "@/lib/schemas";

type LabWorkflowValues = z.input<typeof labWorkflowSchema>;

export function LabWorkflowForm({
  clinicId,
  patientOptions,
  providerOptions,
  labId,
  defaultValues,
  redirectTo
}: {
  clinicId: string;
  patientOptions: Array<{ id: string; label: string }>;
  providerOptions: Array<{ id: string; label: string }>;
  labId?: string;
  defaultValues?: Partial<LabWorkflowValues>;
  redirectTo?: string;
}) {
  const router = useRouter();
  const form = useForm<LabWorkflowValues>({
    resolver: zodResolver(labWorkflowSchema),
    defaultValues: {
      clinicId,
      patientId: defaultValues?.patientId ?? patientOptions[0]?.id ?? "",
      providerId: defaultValues?.providerId ?? providerOptions[0]?.id ?? "",
      encounterId: defaultValues?.encounterId ?? null,
      testName: defaultValues?.testName ?? "",
      labName: defaultValues?.labName ?? "",
      status: defaultValues?.status ?? "ordered",
      report: defaultValues?.report,
      results: defaultValues?.results ?? []
    }
  });
  const results = useFieldArray({ control: form.control, name: "results" });

  const mutation = useMutation({
    mutationFn: async (payload: LabWorkflowValues) => {
      const normalized = {
        ...payload,
        report: payload.report
          ? {
              ...payload.report,
              reportDate: typeof payload.report.reportDate === "string" && payload.report.reportDate ? new Date(payload.report.reportDate).toISOString() : payload.report.reportDate
            }
          : payload.report
      };

      const response = await fetch("/api/labs", {
        method: labId ? "PUT" : "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(labId ? { id: labId, ...normalized } : normalized)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to save lab workflow.");
      }

      return response.json();
    },
    onSuccess: (payload) => {
      const nextId = payload.data?.order?.id ?? payload.data?.id;
      router.push((redirectTo ?? (nextId ? `/labs/${nextId}` : "/labs")) as never);
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
          Ordering provider
          <select {...form.register("providerId")}>
            {providerOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm text-ink/75">
          Test name
          <input {...form.register("testName")} />
        </label>
        <label className="block text-sm text-ink/75">
          Laboratory
          <input {...form.register("labName")} />
        </label>
        <label className="block text-sm text-ink/75">
          Status
          <select {...form.register("status")}>
            <option value="ordered">Ordered</option>
            <option value="collected">Collected</option>
            <option value="reported">Reported</option>
            <option value="reviewed">Reviewed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>
      <div className="rounded-[1rem] border border-[color:var(--border)] bg-white/45 p-4">
        <h3 className="font-semibold text-ink">Report</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-ink/75">
            Report number
            <input {...form.register("report.reportNumber")} />
          </label>
          <label className="block text-sm text-ink/75">
            Report date
            <input type="datetime-local" {...form.register("report.reportDate")} />
          </label>
          <label className="block text-sm text-ink/75 md:col-span-2">
            Summary
            <textarea rows={4} {...form.register("report.resultSummary")} />
          </label>
          <label className="block text-sm text-ink/75">
            Report file URL
            <input {...form.register("report.fileUrl")} />
          </label>
          <label className="flex items-center gap-3 rounded-[0.85rem] border border-[color:var(--border)] bg-white/75 px-4 py-3 text-sm text-ink/75">
            <input type="checkbox" className="h-4 w-4" {...form.register("report.abnormalFlag")} />
            Mark summary as abnormal
          </label>
        </div>
      </div>
      <div className="rounded-[1rem] border border-[color:var(--border)] bg-white/45 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-ink">Component results</h3>
          <button type="button" className="secondary" onClick={() => results.append({ testComponent: "", value: "", referenceRange: "", unit: "", flag: "normal" })}>Add result</button>
        </div>
        <div className="space-y-3">
          {results.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_1fr_0.6fr_0.7fr_auto]">
              <input placeholder="Component" {...form.register(`results.${index}.testComponent`)} />
              <input placeholder="Value" {...form.register(`results.${index}.value`)} />
              <input placeholder="Reference range" {...form.register(`results.${index}.referenceRange`)} />
              <input placeholder="Unit" {...form.register(`results.${index}.unit`)} />
              <select {...form.register(`results.${index}.flag`)}>
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
                <option value="critical">Critical</option>
              </select>
              <button type="button" className="secondary" onClick={() => results.remove(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
      {mutation.error ? <p className="text-sm text-coral">{mutation.error.message}</p> : null}
      <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving lab workflow..." : labId ? "Update lab workflow" : "Create lab order"}</button>
    </form>
  );
}