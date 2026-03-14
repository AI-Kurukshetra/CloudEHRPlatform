import { redirect } from "next/navigation";

import { isRouteAllowed } from "@/lib/rbac";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { Role, SessionUser } from "@/lib/types";

function asRole(value: unknown): Role | null {
  return value === "admin" || value === "doctor" || value === "staff" || value === "patient"
    ? value
    : null;
}

function buildSessionUser(user: {
  id: string;
  email?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}): SessionUser | null {
  const role = asRole(user.app_metadata?.role ?? user.user_metadata?.role);
  const clinicId = user.app_metadata?.clinic_id ?? user.user_metadata?.clinic_id;

  if (!role || typeof clinicId !== "string") {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : user.email?.split("@")[0] ?? "MedFlow User",
    role,
    clinicId,
    patientId: typeof user.app_metadata?.patient_id === "string" ? user.app_metadata.patient_id : null,
    providerId: typeof user.app_metadata?.provider_id === "string" ? user.app_metadata.provider_id : null
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return buildSessionUser(user);
}

export async function requireUser(allowedRoles?: Role[]) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/dashboard?denied=1");
  }

  return session;
}

export function canAccessPath(role: Role, pathname: string) {
  return isRouteAllowed(pathname, role);
}

export function extractRoleFromMetadata(metadata: Record<string, unknown> | undefined) {
  return asRole(metadata?.role);
}
