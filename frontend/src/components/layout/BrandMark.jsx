import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export function BrandMark({ className = "", to = "/" }) {
  return (
    <Link
      to={to}
      className={cn("text-headline-md font-bold uppercase tracking-tighter text-primary", className)}
    >
      AmbuSOS
    </Link>
  );
}
