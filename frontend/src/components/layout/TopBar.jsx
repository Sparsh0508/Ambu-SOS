import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { BrandMark } from "./BrandMark";
import { IconButton } from "../ui/IconButton";
import { useAuthStore } from "../../store/useAuthStore";

export function TopBar({
  links = [],
  className = "",
  rightSlot,
  showBrand = true,
  sticky = false,
  compact = false,
}) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const profileRoutes = {
      USER: "/patient/profile",
      DRIVER: "/driver/profile",
      CFR: "/cfr/profile",
      HOSPITAL_ADMIN: "/hospital/profile",
    };
    
    const route = profileRoutes[user.role] || "/patient/profile";
    navigate(route);
  };
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
            <IconButton icon="account_circle" onClick={handleProfileClick} />
          </>
        )}
      </div>
    </header>
  );
}
