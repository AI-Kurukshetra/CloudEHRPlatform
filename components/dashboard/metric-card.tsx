export function MetricCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="surface p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-ink/45">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-sm text-ink/65">{hint}</p>
    </article>
  );
}
