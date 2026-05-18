import { Link } from "react-router-dom";
import { BottomNav } from "../../../components/layout/BottomNav";
import { TopBar } from "../../../components/layout/TopBar";
import { MapStage } from "../../../components/shared/MapStage";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { marketingData, getPatientBottomNav } from "../../../data/appData";
import { cn } from "../../../lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopBar
        sticky
        links={[
          { label: "Solutions", to: "/" },
          { label: "Network", to: "/" },
          { label: "Partners", to: "/" },
        ]}
      />

      <main className="pb-20 md:pb-0">
        <section className="clinical-grid border-b border-outline-variant bg-surface-container-lowest px-margin-mobile pb-16 pt-16 md:px-margin-desktop md:pt-24">
          <div className="mx-auto grid max-w-screen-panel grid-cols-1 items-center gap-gutter md:grid-cols-12">
            <div className="relative z-10 flex flex-col gap-stack-md rounded-xl border border-surface-variant bg-surface-container-lowest/90 p-4 backdrop-blur-sm md:col-span-6 md:p-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-error-container px-3 py-1 text-on-error-container">
                <MaterialIcon name="emergency" filled className="text-[16px]" />
                <span className="text-label-md uppercase tracking-wider">Mission Critical Protocol Active</span>
              </div>
              <h1 className="text-headline-lg-mobile leading-tight md:text-display-lg">
                Emergency Response in <span className="text-primary">Seconds</span>, Not Minutes.
              </h1>
              <p className="max-w-lg text-body-lg text-on-surface-variant">
                The zero-latency medical dispatch platform connecting patients, drivers, and
                hospitals in real-time. Built for split-second decisions.
              </p>
              <div className="mt-stack-sm flex flex-col gap-stack-sm sm:flex-row">
                <Link
                  to="/patient/home"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-primary px-8 py-4 text-headline-sm text-on-primary shadow-sm transition-colors hover:bg-surface-tint sm:w-auto"
                >
                  <MaterialIcon name="ambulance" />
                  Book Ambulance Now
                </Link>
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-outline bg-transparent px-8 py-4 text-headline-sm text-secondary transition-colors hover:bg-surface-container-lowest sm:w-auto"
                >
                  Partner Dashboard
                </Link>
              </div>
            </div>

            <MapStage
              tone="dark"
              image={marketingData.heroImage}
              imageClassName="opacity-60 mix-blend-luminosity"
              className="h-[400px] rounded-xl border border-outline-variant shadow-panel md:col-span-6 md:h-[600px]"
            >
              <div className="absolute left-8 top-8 rounded border border-outline-variant bg-surface-container-lowest p-3 shadow-sm">
                <span className="text-label-sm uppercase text-secondary">Unit 402 Status</span>
                <div className="mt-1 flex items-center gap-2 text-headline-sm text-primary">
                  <div className="h-3 w-3 animate-soft-pulse rounded-full bg-primary" />
                  EN ROUTE - 02:45 ETA
                </div>
              </div>
              <div className="absolute bottom-8 right-8 max-w-[200px] rounded border border-outline bg-inverse-surface p-4 shadow-overlay">
                <span className="text-label-sm uppercase text-inverse-primary">Patient Vitals Ping</span>
                <div className="mt-2 space-y-2 text-on-primary">
                  <div className="flex justify-between">
                    <span>HR:</span>
                    <span className="text-headline-sm text-tertiary-fixed">112 BPM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BP:</span>
                    <span className="text-headline-sm text-inverse-primary">90/60</span>
                  </div>
                </div>
              </div>
            </MapStage>
          </div>
        </section>

        <section className="border-b border-outline-variant bg-surface">
          <div className="mx-auto grid max-w-screen-panel grid-cols-2 divide-x divide-outline-variant px-margin-mobile py-8 md:grid-cols-4 md:px-margin-desktop">
            {marketingData.trustSignals.map((item) => (
              <div key={item.title} className="px-4 text-center">
                <MaterialIcon name={item.icon} className="mb-2 text-3xl text-primary" />
                <div className="text-headline-sm">{item.title}</div>
                <div className="mt-1 text-label-sm text-secondary">{item.subtitle}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-outline-variant bg-surface-container-low px-margin-mobile py-16 md:px-margin-desktop md:py-24">
          <div className="mx-auto max-w-screen-panel">
            <div className="mb-12 flex flex-col gap-2">
              <span className="text-label-md uppercase tracking-widest text-primary">Ecosystem Architecture</span>
              <h2 className="text-headline-lg">Built for Every Link in the Chain of Survival.</h2>
            </div>
            <div className="grid auto-rows-[minmax(250px,auto)] grid-cols-1 gap-gutter md:grid-cols-3">
              {marketingData.roleCards.map((card) => (
                <div
                  key={card.title}
                  className={cn(
                    "rounded-xl border border-outline-variant p-8",
                    card.layout === "large" && "relative overflow-hidden md:col-span-2 md:row-span-2",
                    card.layout === "tall" && "bg-inverse-surface text-inverse-on-surface",
                    !card.layout && "bg-surface-container-lowest",
                    card.layout !== "tall" && "bg-surface-container-lowest",
                  )}
                >
                  {card.layout === "large" ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-surface-variant opacity-20" />
                  ) : null}
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div>
                      <div
                        className={cn(
                          "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
                          card.accent === "primary" && "bg-primary-container text-on-primary-container",
                          card.accent === "tertiary" && "bg-tertiary-container text-on-tertiary-container",
                          card.accent === "secondary" && "bg-secondary-container text-on-secondary-container",
                          card.accent === "inverse" && "border border-outline text-inverse-primary",
                        )}
                      >
                        <MaterialIcon name={card.icon} />
                      </div>
                      <h3
                        className={cn(
                          "mb-2 text-headline-md",
                          card.layout === "tall" &&
                            "inline-block bg-inverse-on-surface px-2 text-inverse-surface",
                        )}
                      >
                        {card.title}
                      </h3>
                      <p
                        className={cn(
                          "text-body-md",
                          card.layout === "tall" ? "text-secondary-fixed-dim" : "text-secondary",
                        )}
                      >
                        {card.description}
                      </p>
                    </div>

                    {card.layout === "large" ? (
                      <div className="relative z-10 mt-8 flex w-full items-center gap-4 rounded-lg border border-outline-variant bg-surface p-4 shadow-sm md:w-3/4 md:self-end">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error text-white shadow-[0_0_15px_rgba(186,26,26,0.5)]">
                          <MaterialIcon name={card.detailIcon} className="text-3xl" />
                        </div>
                        <div>
                          <span className="block text-label-md uppercase text-primary">{card.detailTitle}</span>
                          <span className="block text-label-sm text-secondary">{card.detailText}</span>
                        </div>
                      </div>
                    ) : null}

                    {card.layout === "tall" ? (
                      <div className="mt-6 border-t border-dashed border-outline pt-4">
                        <div className="flex items-end justify-between">
                          <span className="text-label-md uppercase text-tertiary-fixed">{card.statLabel}</span>
                          <span className="text-headline-lg text-on-primary">{card.statValue}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface px-margin-mobile py-16 md:px-margin-desktop md:py-24">
          <div className="mx-auto flex max-w-screen-panel flex-col items-center gap-12 md:flex-row">
            <div className="grid w-full grid-cols-2 gap-4 md:w-1/2">
              {marketingData.technicalFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className={cn(
                    "rounded border border-outline-variant bg-surface-container-low p-6",
                    index % 2 === 1 && "mt-8",
                  )}
                >
                  <MaterialIcon name={feature.icon} className="text-primary" />
                  <div className="mt-2 text-headline-sm">{feature.title}</div>
                  <div className="text-label-sm text-secondary">{feature.copy}</div>
                </div>
              ))}
            </div>
            <div className="w-full space-y-6 md:w-1/2">
              <h2 className="text-headline-lg">Data-Driven Triage.</h2>
              <p className="text-body-lg text-secondary">
                AmbuSOS establishes a secure, encrypted data pipeline between the scene and the
                emergency room, ensuring clinical teams are fully briefed before the patient arrives.
              </p>
              <ul className="space-y-3">
                {[
                  "HIPAA Compliant Data Transfer",
                  "Integration with Major CAD Systems",
                  "Offline Resiliency Mode",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-body-md">
                    <MaterialIcon name="check_circle" className="text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline bg-inverse-surface px-margin-mobile pb-24 pt-16 md:px-margin-desktop md:pb-8">
        <div className="mx-auto flex max-w-screen-panel flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-sm space-y-4">
            <div className="text-headline-md font-bold uppercase tracking-tighter text-inverse-primary">
              AmbuSOS
            </div>
            <p className="text-body-md text-secondary-fixed-dim">
              Engineering time back into the golden hour. Mission-critical emergency response
              infrastructure.
            </p>
          </div>
          <div className="flex gap-16">
            {marketingData.footerColumns.map((column) => (
              <div key={column.heading} className="flex flex-col gap-3">
                <span className="text-label-md uppercase text-on-secondary">{column.heading}</span>
                {column.links.map((link) => (
                  <Link key={link} className="text-body-md text-secondary-fixed-dim hover:text-white" to="/">
                    {link}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-screen-panel border-t border-outline pt-8 text-center text-label-sm text-secondary-fixed-dim">
          © 2024 AmbuSOS Inc. Emergency Systems.
        </div>
      </footer>

      <BottomNav items={getPatientBottomNav("Map")} />
    </div>
  );
}
