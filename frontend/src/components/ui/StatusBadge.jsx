import { cn } from "../../lib/utils";
import { MaterialIcon } from "./MaterialIcon";

const tones = {
  primary: "bg-primary-container/15 text-primary border-primary/20",
  success: "bg-[#e6f4ea] text-[#137333] border-[#ceead6]",
  warning: "bg-secondary-container text-on-secondary-container border-outline-variant",
  danger: "bg-error-container text-on-error-container border-error/25",
  neutral: "bg-surface-container text-on-surface-variant border-outline-variant",
  inverse: "bg-inverse-surface text-inverse-on-surface border-outline",
};

export function StatusBadge({ children, className = "", icon, tone = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded border px-2.5 py-1 text-label-sm uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {icon ? <MaterialIcon name={icon} className="text-[14px]" /> : null}
      {children}
    </span>
  );
}
