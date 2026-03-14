import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { NavLink } from "@/components/layout/nav-link";
import { roleLabels } from "@/lib/rbac";
import type { Role } from "@/lib/types";

const navByRole: Record<Role, Array<{ href: Route; label: string }>> = {
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/patients", label: "Patients" },
    { href: "/appointments", label: "Appointments" },
    { href: "/prescriptions", label: "Prescriptions" },
    { href: "/labs", label: "Labs" },
    { href: "/reports", label: "Reports" },
    { href: "/admin", label: "Admin" }
  ],
  doctor: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/patients", label: "Patients" },
    { href: "/appointments", label: "Appointments" },
    { href: "/prescriptions", label: "Prescriptions" },
    { href: "/labs", label: "Labs" }
  ],
  staff: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/patients", label: "Patients" },
    { href: "/appointments", label: "Appointments" }
  ],
  patient: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/appointments", label: "Appointments" },
    { href: "/prescriptions", label: "Prescriptions" },
    { href: "/labs", label: "Labs" }
  ]
};

export function AppShell({
  children,
  user,
  title,
  subtitle
}: {
  children: ReactNode;
  user: {
    fullName: string;
    role: Role;
    clinicId: string;
  };
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="surface mb-6 overflow-hidden">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-ink/45">MedFlow AI</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-ink/70">{subtitle}</p>
          </div>
          <div className="flex flex-col items-start gap-3 rounded-[1.25rem] bg-ink px-5 py-4 text-white shadow-card sm:items-end">
            <span className="pill bg-white/10 text-white">{roleLabels[user.role]}</span>
            <div className="text-left sm:text-right">
              <p className="text-lg font-semibold">{user.fullName}</p>
              <p className="text-sm text-white/70">{user.clinicId}</p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="bg-white text-ink" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/50 bg-white/40 px-6 py-4 lg:px-8">
          <nav className="flex flex-wrap gap-2">
            {navByRole[user.role].map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </nav>
        </div>
      </header>
      <main className="space-y-6">{children}</main>
      <footer className="mt-8 flex items-center justify-between px-2 pb-4 text-sm text-ink/55">
        <span>HIPAA-conscious starter architecture for multi-clinic EHR workflows.</span>
        <Link href="/admin" className="font-medium text-teal hover:text-ink">
          Review admin controls
        </Link>
      </footer>
    </div>
  );
}
