import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { MaterialIcon } from "../ui/MaterialIcon";

export function BottomNav({ items = [] }) {
  return (
    <nav className="safe-bottom-space fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around rounded-t-xl border-t border-outline-variant bg-surface px-4 shadow-md md:hidden">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className={cn(
            "flex h-full w-full flex-col items-center justify-center rounded-lg text-label-sm transition-colors",
            item.active ? "scale-95 font-semibold text-primary" : "text-secondary hover:bg-surface-container",
          )}
        >
          <MaterialIcon name={item.icon} filled={item.active} className="mb-1" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
