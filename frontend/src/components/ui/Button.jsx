import { cn } from "../../lib/utils";
import { MaterialIcon } from "./MaterialIcon";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-surface-tint border border-transparent shadow-sm",
  secondary:
    "border border-outline bg-transparent text-secondary hover:bg-surface-container-lowest",
  soft: "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container",
  ghost: "text-secondary hover:bg-surface-container-high border border-transparent",
  inverse:
    "border border-outline bg-surface-container-lowest text-primary hover:bg-surface-container",
};

export function Button({
  children,
  className = "",
  icon,
  iconFilled = false,
  iconSide = "left",
  variant = "primary",
  loading = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-label-md transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {!loading && icon && iconSide === "left" ? <MaterialIcon name={icon} filled={iconFilled} /> : null}
      <span>{children}</span>
      {!loading && icon && iconSide === "right" ? <MaterialIcon name={icon} filled={iconFilled} /> : null}
    </button>
  );
}
