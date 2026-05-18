import { cn } from "../../lib/utils";
import { MaterialIcon } from "./MaterialIcon";

export function IconButton({ icon, className = "", filled = false, ...props }) {
  return (
    <button
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-high",
        className,
      )}
      {...props}
    >
      <MaterialIcon name={icon} filled={filled} />
    </button>
  );
}
