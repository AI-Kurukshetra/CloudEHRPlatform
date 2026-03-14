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
  {
    prefix: "/dashboard",
    allow: ["admin", "doctor", "staff", "patient"]
  },
  {
    prefix: "/patients",
    allow: ["admin", "doctor", "staff"]
  },
  {
    prefix: "/appointments",
    allow: ["admin", "doctor", "staff", "patient"]
  },
  {
    prefix: "/prescriptions",
    allow: ["admin", "doctor", "patient"]
  },
  {
    prefix: "/labs",
    allow: ["admin", "doctor", "patient"]
  },
  {
    prefix: "/reports",
    allow: ["admin"]
  },
  {
    prefix: "/admin",
    allow: ["admin"]
  }
];

export function isRouteAllowed(pathname: string, role: Role) {
  const matched = routeAccess.find((item) => pathname.startsWith(item.prefix));
  if (!matched) {
    return true;
  }

  return matched.allow.includes(role);
}

