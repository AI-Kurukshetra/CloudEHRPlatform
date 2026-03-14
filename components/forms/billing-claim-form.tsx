"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";

import { billingClaimSchema } from "@/lib/schemas";

type BillingClaimValues = z.input<typeof billingClaimSchema>;

export function BillingClaimForm({
  clinicId,
  patientOptions,
  providerOptions,
  encounterOptions,
  defaultValues,
  claimId,
  redirectTo
}: {
  clinicId: string;
  patientOptions: Array<{ id: string; label: string }>;
  providerOptions: Array<{ id: string; label: string }>;
  encounterOptions: Array<{ id: string; label: string }>;
  defaultValues?: Partial<BillingClaimValues>;
  claimId?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const form = useForm<BillingClaimValues>({
    resolver: zodResolver(billingClaimSchema),
    defaultValues: {
      clinicId,
      patientId: defaultValues?.patientId ?? patientOptions[0]?.id ?? "",
      providerId: defaultValues?.providerId ?? providerOptions[0]?.id ?? "",
      encounterId: defaultValues?.encounterId ?? encounterOptions[0]?.id ?? "",
      claimNumber: defaultValues?.claimNumber,
      status: defaultValues?.status ?? "draft",
      submittedAt: defaultValues?.submittedAt ?? null,
      totalAmount: defaultValues?.totalAmount,
      items: defaultValues?.items ?? [{ cptCode: "99213", description: "Office visit", amount: 150 }]
    }
  });
  const items = useFieldArray({ control: form.control, name: "items" });

  const mutation = useMutation({
    mutationFn: async (payload: BillingClaimValues) => {
      const normalized = {
        ...payload,
        submittedAt: typeof payload.submittedAt === "string" && payload.submittedAt ? new Date(payload.submittedAt).toISOString() : payload.submittedAt ?? null
      };

      const response = await fetch("/api/billing", {
        method: claimId ? "PUT" : "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(claimId ? { id: claimId, ...normalized } : normalized)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to save billing claim.");
      }

      return response.json();
    },
    onSuccess: () => {
      router.push((redirectTo ?? "/billing/claims") as never);
      router.refresh();
    }
  });

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <div className="grid gap-4 md:grid-cols-3">
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
        <label className="block text-sm text-ink/75">
          Encounter
          <select {...form.register("encounterId")}>
            {encounterOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm text-ink/75">
          Claim number
          <input {...form.register("claimNumber")} placeholder="Auto-generated if blank" />
        </label>
        <label className="block text-sm text-ink/75">
          Status
          <select {...form.register("status")}>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially paid</option>
            <option value="denied">Denied</option>
          </select>
        </label>
        <label className="block text-sm text-ink/75">
          Submitted at
          <input type="datetime-local" {...form.register("submittedAt")} />
        </label>
      </div>
      <div className="rounded-[1rem] border border-[color:var(--border)] bg-white/45 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-ink">Billing items</h3>
          <button type="button" className="secondary" onClick={() => items.append({ cptCode: "", description: "", amount: 0 })}>Add item</button>
        </div>
        <div className="space-y-3">
          {items.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-[0.9fr_1.4fr_0.7fr_auto]">
              <input placeholder="CPT" {...form.register(`items.${index}.cptCode`)} />
              <input placeholder="Description" {...form.register(`items.${index}.description`)} />
              <input type="number" step="0.01" placeholder="Amount" {...form.register(`items.${index}.amount`, { valueAsNumber: true })} />
              <button type="button" className="secondary" onClick={() => items.remove(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
      {mutation.error ? <p className="text-sm text-coral">{mutation.error.message}</p> : null}
      <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving claim..." : claimId ? "Update claim" : "Generate claim"}</button>
    </form>
  );
}