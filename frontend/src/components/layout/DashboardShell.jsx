import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

export function DashboardShell({
  topLinks,
  sideTitle,
  sideSubtitle,
  sideItems,
  sideCta,
  bottomItems,
  children,
  headerClassName = "",
  mainClassName = "",
  rightSlot,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex min-h-screen flex-col md:flex-row">
        {sideItems ? (
          <SideNav title={sideTitle} subtitle={sideSubtitle} items={sideItems} cta={sideCta} />
        ) : null}
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar links={topLinks} className={headerClassName} rightSlot={rightSlot} />
          <main className={mainClassName}>{children}</main>
        </div>
      </div>
      {bottomItems ? <BottomNav items={bottomItems} /> : null}
    </div>
  );
}
