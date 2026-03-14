import type { ClinicalAlert } from "@/lib/types";

export function ClinicalAlertList({ alerts }: { alerts: ClinicalAlert[] }) {
  if (alerts.length === 0) {
    return <p className="rounded-[1rem] bg-white/50 p-4 text-sm text-ink/70">No active clinical decision support alerts for this context.</p>;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div key={`${alert.type}-${index}`} className={`rounded-[1rem] border p-4 text-sm ${alert.severity === "critical" ? "border-coral/30 bg-coral/10 text-coral" : alert.severity === "warning" ? "border-amber-400/30 bg-amber-50 text-amber-800" : "border-teal/20 bg-teal-soft text-teal"}`}>
          <p className="font-semibold">{alert.title}</p>
          <p className="mt-1">{alert.message}</p>
        </div>
      ))}
    </div>
  );
}