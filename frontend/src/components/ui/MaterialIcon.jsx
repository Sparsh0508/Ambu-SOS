import { cn } from "../../lib/utils";

export function MaterialIcon({ name, className = "", filled = false }) {
  return (
    <span className={cn("material-symbols-outlined", filled && "icon-filled", className)}>
      {name}
    </span>
  );
}
