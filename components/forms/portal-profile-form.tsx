"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { patientSelfUpdateSchema } from "@/lib/schemas";

export function PortalProfileForm({
  patientId,
  defaultValues
}: {
  patientId: string;
  defaultValues: z.input<typeof patientSelfUpdateSchema>;
}) {
  const router = useRouter();
  const form = useForm<z.infer<typeof patientSelfUpdateSchema>>({
    resolver: zodResolver(patientSelfUpdateSchema),
    defaultValues
  });

  const mutation = useMutation({
    mutationFn: async (payload: z.infer<typeof patientSelfUpdateSchema>) => {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to update profile.");
      }

      return response.json();
    },
    onSuccess: () => {
      router.refresh();
    }
  });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <label className="block text-sm text-ink/75">
        Phone
        <input {...form.register("phone")} />
      </label>
      <label className="block text-sm text-ink/75">
        Email
        <input {...form.register("email")} />
      </label>
      <label className="block text-sm text-ink/75">
        Guardian name
        <input {...form.register("guardianName")} />
      </label>
      <label className="block text-sm text-ink/75">
        Insurance ID
        <input {...form.register("insuranceId")} />
      </label>
      {mutation.error ? <p className="text-sm text-coral">{mutation.error.message}</p> : null}
      <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Update portal profile"}</button>
    </form>
  );
}