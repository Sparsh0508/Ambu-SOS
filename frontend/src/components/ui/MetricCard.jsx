import { cn } from "../../lib/utils";

export function MetricCard({ label, value, className = "", tone = "default" }) {
  const toneMap = {
    default: "bg-surface-container-lowest text-on-surface",
    accent: "bg-surface-container-low text-primary",
  };

  return (
    <div className={cn("rounded-lg border border-outline-variant p-4 shadow-sm", toneMap[tone], className)}>
      <p className="text-label-sm text-secondary">{label}</p>
      <p className="mt-1 text-headline-md font-semibold">{value}</p>
    </div>
  );
}
