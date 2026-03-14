import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Provider } from "@/lib/types";

type ProviderRow = {
  id: string;
  user_id: string;
  clinic_id: string;
  full_name: string;
  specialty: string;
  license_number: string;
  created_at: string;
};

function mapProvider(row: ProviderRow): Provider {
  return {
    id: row.id,
    userId: row.user_id,
    clinicId: row.clinic_id,
    fullName: row.full_name,
    specialty: row.specialty,
    licenseNumber: row.license_number,
    createdAt: row.created_at
  };
}

export async function listProvidersWithFilters(clinicId: string, search?: string) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("providers").select("id, user_id, clinic_id, full_name, specialty, license_number, created_at").eq("clinic_id", clinicId).order("full_name", { ascending: true });
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,specialty.ilike.%${search}%,license_number.ilike.%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapProvider(row as ProviderRow));
}

export async function createProviderRecord(input: Omit<Provider, "id" | "createdAt">) {
  const supabase = createSupabaseAdminClient();
  const id = randomUUID();
  await supabase.from("providers").insert({
    id,
    user_id: input.userId,
    clinic_id: input.clinicId,
    full_name: input.fullName,
    specialty: input.specialty,
    license_number: input.licenseNumber
  });
  return { id, ...input } satisfies Provider;
}

export async function updateProviderRecord(id: string, clinicId: string, input: Omit<Provider, "id" | "clinicId" | "createdAt">) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("providers").update({
    user_id: input.userId,
    full_name: input.fullName,
    specialty: input.specialty,
    license_number: input.licenseNumber
  }).eq("id", id).eq("clinic_id", clinicId);
  return { id, clinicId, ...input } satisfies Provider;
}

export async function deleteProviderRecord(id: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("providers").delete().eq("id", id).eq("clinic_id", clinicId);
  return true;
}