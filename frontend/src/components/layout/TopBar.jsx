import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { BrandMark } from "./BrandMark";
import { IconButton } from "../ui/IconButton";

export function TopBar({
  links = [],
  className = "",
  rightSlot,
  showBrand = true,
  sticky = false,
  compact = false,
}) {
  return (
    <header
      className={cn(
        "z-30 flex h-14 items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile md:h-16 md:px-margin-desktop",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className="flex items-center gap-stack-md">
        {showBrand ? <BrandMark /> : null}
        {links.length ? (
          <nav className="hidden items-center gap-stack-lg md:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  "rounded px-3 py-2 text-label-md transition-colors",
                  link.active
                    ? "border-b-2 border-primary px-0 text-primary"
                    : "text-secondary hover:bg-surface-container-high",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </div>
      <div className={cn("flex items-center gap-stack-sm", compact && "gap-2")}>
        {rightSlot ?? (
          <>
            <IconButton icon="notifications" />
            <IconButton icon="account_circle" />
          </>
        )}
      </div>
    </header>
  );
}
