import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { MaterialIcon } from "../ui/MaterialIcon";

export function SideNav({ title, subtitle, items = [], cta }) {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low p-stack-md md:flex">
      <div className="mb-stack-lg">
        <div className="text-headline-sm font-semibold text-primary">{title}</div>
        <div className="text-label-md text-secondary">{subtitle}</div>
      </div>
      <div className="flex flex-1 flex-col gap-unit">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={cn(
              "flex items-center gap-stack-sm rounded-xl p-3 text-label-md transition-colors",
              item.active
                ? "scale-[0.98] bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-highest",
            )}
          >
            <MaterialIcon name={item.icon} filled={item.active} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      {cta ? cta : null}
    </aside>
  );
}
