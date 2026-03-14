import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase";
import type { AuditLog } from "@/lib/types";

type AuditRow = {
  id: string;
  user_id: string;
  clinic_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  changes: Record<string, unknown> | null;
  created_at: string;
};

function mapAudit(row: AuditRow, userName?: string): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    clinicId: row.clinic_id ?? undefined,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    changes: row.changes,
    createdAt: row.created_at,
    timestamp: row.created_at,
    userName
  };
}

export async function listAuditLogsDetailed(clinicId: string, filters?: { userId?: string; entityType?: string; action?: string }) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("audit_logs").select("id, user_id, clinic_id, entity_type, entity_id, action, changes, created_at").eq("clinic_id", clinicId).order("created_at", { ascending: false }).limit(100);
  if (filters?.userId) query = query.eq("user_id", filters.userId);
  if (filters?.entityType) query = query.eq("entity_type", filters.entityType);
  if (filters?.action) query = query.ilike("action", `%${filters.action}%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const userIds = Array.from(new Set((data ?? []).map((row) => row.user_id as string)));
  const { data: userRows } = await supabase.from("users").select("id, full_name").in("id", userIds);
  const userMap = new Map((userRows ?? []).map((row) => [row.id as string, row.full_name as string]));

  return (data ?? []).map((row) => mapAudit(row as AuditRow, userMap.get(row.user_id as string)));
}

export async function createAuditRecord(input: { userId: string; clinicId: string; entityType: string; entityId: string; action: string; changes?: Record<string, unknown> | null; }) {
  const supabase = createSupabaseAdminClient();
  const id = randomUUID();
  await supabase.from("audit_logs").insert({
    id,
    user_id: input.userId,
    clinic_id: input.clinicId,
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    changes: input.changes ?? null,
    timestamp: new Date().toISOString()
  });
  return { id, ...input, createdAt: new Date().toISOString(), timestamp: new Date().toISOString() } satisfies AuditLog;
}

export async function updateAuditRecord(id: string, clinicId: string, input: { entityType: string; entityId: string; action: string; changes?: Record<string, unknown> | null; }) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("audit_logs").update({
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    changes: input.changes ?? null
  }).eq("id", id).eq("clinic_id", clinicId);
  return { id, clinicId, userId: "", ...input, createdAt: new Date().toISOString(), timestamp: new Date().toISOString() } satisfies AuditLog;
}

export async function deleteAuditRecord(id: string, clinicId: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("audit_logs").delete().eq("id", id).eq("clinic_id", clinicId);
  return true;
}