import { cn } from "../../lib/utils";

export function Panel({ children, className = "" }) {
  return (
    <div className={cn("rounded-xl border border-outline-variant bg-surface-container-lowest", className)}>
      {children}
    </div>
  );
}
