import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Button } from "../../../components/ui/Button";
import { EmptyState, PageError, PageLoader } from "../../../components/ui/PageState";
import { Panel } from "../../../components/ui/Panel";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { formatDateTime } from "../../../lib/formatters";
import { getApiErrorMessage } from "../../../services/apiClient";
import { hospitalApi } from "../../../services/appApi";

const sideItems = [
  { label: "Dashboard", icon: "dashboard", to: "/hospital/dashboard", active: true },
  { label: "Profile", icon: "local_hospital", to: "/hospital/profile" },
];

export default function HospitalDashboardPage() {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    let intervalId = null;

    async function fetchDashboard() {
      try {
        const response = await hospitalApi.getDashboard();

        if (mounted) {
          setTrips(response.data);
          setError("");
        }
      } catch (requestError) {
        if (mounted) {
          setError(getApiErrorMessage(requestError, "Unable to load incoming patients."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchDashboard();
    intervalId = window.setInterval(fetchDashboard, 5000);

    return () => {
      mounted = false;

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  if (isLoading) {
    return <PageLoader label="Loading hospital dashboard..." />;
  }

  if (error && !trips.length) {
    return <PageError actionLabel="Retry" message={error} onAction={() => window.location.reload()} />;
  }

  return (
    <DashboardShell
      sideTitle="AmbuSOS Admin"
      sideSubtitle="Hospital Command"
      sideItems={sideItems}
      sideCta={
        <Button className="mt-auto w-full" icon="settings" onClick={() => window.location.assign("/hospital/profile")}>
          Manage Resources
        </Button>
      }
      bottomItems={[
        { label: "Dashboard", icon: "dashboard", to: "/hospital/dashboard", active: true },
        { label: "Profile", icon: "local_hospital", to: "/hospital/profile" },
      ]}
      mainClassName="min-h-screen bg-background p-margin-mobile pb-24 md:p-margin-desktop"
    >
      <div className="mx-auto max-w-screen-panel space-y-stack-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg">Incoming Patient Dashboard</h1>
            <p className="text-body-md text-secondary">Live ambulance arrivals, triage details, and dispatch status.</p>
          </div>
          <div className="rounded-full border border-outline-variant bg-surface px-4 py-2 text-label-md text-secondary">
            Refreshing every 5 seconds
          </div>
        </div>

        <div className="grid grid-cols-1 gap-stack-md md:grid-cols-3">
          <Panel className="p-stack-md">
            <p className="text-label-sm uppercase tracking-wider text-secondary">Incoming Units</p>
            <p className="mt-2 text-display-lg text-primary">{trips.length}</p>
          </Panel>
          <Panel className="p-stack-md">
            <p className="text-label-sm uppercase tracking-wider text-secondary">Critical Cases</p>
            <p className="mt-2 text-display-lg text-error">
              {trips.filter((trip) => ["CRITICAL", "LIFE_THREATENING"].includes(trip.medicalReport?.severity)).length}
            </p>
          </Panel>
          <Panel className="p-stack-md">
            <p className="text-label-sm uppercase tracking-wider text-secondary">En Route</p>
            <p className="mt-2 text-display-lg text-tertiary">
              {trips.filter((trip) => trip.status === "ARRIVED" || trip.status === "ON_BOARD").length}
            </p>
          </Panel>
        </div>

        {trips.length ? (
          <div className="grid grid-cols-1 gap-stack-md xl:grid-cols-2">
            {trips.map((trip) => (
              <Panel key={trip.id} className="relative overflow-hidden p-stack-md">
                <div className={`absolute left-0 top-0 h-full w-1 ${trip.medicalReport?.severity === "CRITICAL" ? "bg-error" : "bg-primary"}`} />
                <div className="pl-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-secondary">Arrival Status</p>
                      <h2 className="mt-1 text-headline-sm">{trip.medicalReport?.suspectedCondition || "Emergency Intake"}</h2>
                      <p className="mt-2 text-body-md text-secondary">{trip.passenger?.fullName || "Unknown patient"}</p>
                    </div>
                    <span className="rounded-full bg-surface-container px-3 py-1 text-label-sm text-secondary">
                      {trip.medicalReport?.severity || trip.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-secondary">Pickup</p>
                      <p className="mt-1 text-body-md">{trip.pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-secondary">Driver Unit</p>
                      <p className="mt-1 text-body-md">{trip.driver?.ambulance?.plateNumber || "Pending"}</p>
                    </div>
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-secondary">Requested</p>
                      <p className="mt-1 text-body-md">{formatDateTime(trip.requestedAt)}</p>
                    </div>
                    <div>
                      <p className="text-label-sm uppercase tracking-wider text-secondary">Last Notes</p>
                      <p className="mt-1 text-body-md">{trip.medicalReport?.paramedicNotes || "No notes shared yet."}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-outline-variant pt-4">
                    <span className="text-label-sm text-secondary">{trip.status}</span>
                    <Link to={`/hospital/patient/${trip.id}`}>
                      <Button icon="visibility" iconSide="right">
                        View Intake
                      </Button>
                    </Link>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="local_hospital"
            message="When ambulances are routed to your facility, patient intake cards will appear here automatically."
            title="No incoming patients right now"
          />
        )}
      </div>
    </DashboardShell>
  );
}
