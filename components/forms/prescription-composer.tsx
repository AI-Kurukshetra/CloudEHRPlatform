"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { ClinicalAlertList } from "@/components/ui/clinical-alert-list";
import { getClinicalDecisionSupport } from "@/lib/decision-support";
import { prescriptionSchema } from "@/lib/schemas";
import type { Patient } from "@/lib/types";

type PrescriptionValues = z.input<typeof prescriptionSchema>;

export function PrescriptionComposer({
  clinicId,
  providerId,
  patients
}: {
  clinicId: string;
  providerId: string;
  patients: Patient[];
}) {
  const router = useRouter();
  const form = useForm<PrescriptionValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      clinicId,
      providerId,
      patientId: patients[0]?.id ?? "",
      drugName: "Atorvastatin",
      dosage: "10mg",
      frequency: "Once nightly",
      duration: "30 days",
      encounterId: null
    }
  });

  const patientId = form.watch("patientId");
  const drugName = form.watch("drugName");
  const patient = patients.find((item) => item.id === patientId);
  const alerts = useMemo(() => patient ? getClinicalDecisionSupport({ patient, medicationName: drugName }) : [], [patient, drugName]);

  const mutation = useMutation({
    mutationFn: async (payload: PrescriptionValues) => {
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to issue prescription.");
      }

      return response.json();
    },
    onSuccess: () => {
      router.refresh();
      form.reset({ ...form.getValues(), drugName: "", dosage: "", frequency: "", duration: "", encounterId: null });
    }
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <label className="block text-sm text-ink/75">
        Patient
        <select {...form.register("patientId")}>
          {patients.map((entry) => <option key={entry.id} value={entry.id}>{entry.firstName} {entry.lastName}</option>)}
        </select>
      </label>
      <label className="block text-sm text-ink/75">
        Drug name
        <input {...form.register("drugName")} />
      </label>
      <label className="block text-sm text-ink/75">
        Dosage
        <input {...form.register("dosage")} />
      </label>
      <label className="block text-sm text-ink/75">
        Frequency
        <input {...form.register("frequency")} />
      </label>
      <label className="block text-sm text-ink/75">
        Duration
        <input {...form.register("duration")} />
      </label>
      <ClinicalAlertList alerts={alerts} />
      {mutation.error ? <p className="text-sm text-coral">{mutation.error.message}</p> : null}
      <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Issuing prescription..." : "Issue prescription"}</button>
    </form>
  );
}