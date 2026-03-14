import type { Role } from "@/lib/types";

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  doctor: "Doctor",
  staff: "Staff",
  patient: "Patient"
};

export const routeAccess: Array<{
  prefix: string;
  allow: Role[];
}> = [
  { prefix: "/dashboard", allow: ["admin", "doctor", "staff", "patient"] },
  { prefix: "/portal", allow: ["patient"] },
  { prefix: "/patients", allow: ["admin", "doctor", "staff"] },
  { prefix: "/appointments", allow: ["admin", "doctor", "staff", "patient"] },
  { prefix: "/encounters", allow: ["admin", "doctor", "staff"] },
  { prefix: "/prescriptions", allow: ["admin", "doctor", "patient"] },
  { prefix: "/labs", allow: ["admin", "doctor", "patient"] },
  { prefix: "/immunizations", allow: ["admin", "doctor", "patient"] },
  { prefix: "/billing", allow: ["admin", "doctor", "staff"] },
  { prefix: "/providers", allow: ["admin", "doctor", "staff"] },
  { prefix: "/reports", allow: ["admin"] },
  { prefix: "/audit", allow: ["admin"] },
  { prefix: "/admin", allow: ["admin"] }
];

export function isRouteAllowed(pathname: string, role: Role) {
  const matched = routeAccess.find((item) => pathname.startsWith(item.prefix));
  if (!matched) {
    return true;
  }

  return matched.allow.includes(role);
}