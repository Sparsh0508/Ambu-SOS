import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BottomNav } from "../../../components/layout/BottomNav";
import { TopBar } from "../../../components/layout/TopBar";
import { EmptyState, PageError, PageLoader } from "../../../components/ui/PageState";
import { Panel } from "../../../components/ui/Panel";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { getPatientBottomNav } from "../../../data/appData";
import { formatDate, formatStatusLabel, formatTime } from "../../../lib/formatters";
import { getApiErrorMessage } from "../../../services/apiClient";
import { userApi } from "../../../services/appApi";

export default function RideHistoryPage() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchHistory() {
      setIsLoading(true);
      setError("");

      try {
        const response = await userApi.getTripHistory();

        if (!mounted) {
          return;
        }

        setRides(response.data);
      } catch (requestError) {
        if (mounted) {
          setError(getApiErrorMessage(requestError, "Unable to load your ride history."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, []);

  const rideOverview = useMemo(() => {
    return rides.reduce(
      (summary, ride) => {
        summary.total += 1;

        if (ride.status === "COMPLETED") {
          summary.completed += 1;
        }

        if (ride.status === "CANCELLED") {
          summary.cancelled += 1;
        }

        return summary;
      },
      { total: 0, completed: 0, cancelled: 0 },
    );
  }, [rides]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar sticky />
        <PageLoader label="Loading ride history..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar sticky />
        <PageError actionLabel="Try Again" message={error} onAction={() => navigate(0)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopBar
        links={[
          { label: "Map", to: "/patient/home" },
          { label: "Missions", to: "/patient/history", active: true },
          { label: "Chat", to: rides[0] ? `/patient/tracking/${rides[0].id}` : "/patient/home" },
          { label: "Profile", to: "/patient/profile" },
        ]}
        sticky
      />

      <main className="min-h-screen bg-background px-margin-mobile pb-24 pt-6 md:px-margin-desktop md:pb-8">
        <div className="mx-auto max-w-screen-panel pt-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-headline-lg-mobile md:text-headline-lg">Patient Ride History</h1>
            <p className="text-body-md text-secondary">Review past emergency trips and status reports.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md outline-none focus:ring-2 focus:ring-primary">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
              <option>All Time</option>
            </select>
            <select className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md outline-none focus:ring-2 focus:ring-primary">
              <option>All Statuses</option>
              <option>Completed</option>
              <option>Cancelled</option>
              <option>Transferred</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel className="flex flex-col gap-4 p-6">
            <h3 className="text-headline-sm">Overview</h3>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-4">
              <div>
                <p className="text-label-sm uppercase tracking-wider text-secondary">Total Trips</p>
                <p className="mt-1 text-display-lg text-primary">{rideOverview.total}</p>
              </div>
              <MaterialIcon name="ambulance" className="text-4xl text-primary" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-outline-variant p-3">
                <p className="text-label-sm text-secondary">Completed</p>
                <p className="mt-1 text-headline-md text-tertiary-container">{rideOverview.completed}</p>
              </div>
              <div className="rounded-lg border border-outline-variant p-3">
                <p className="text-label-sm text-secondary">Cancelled</p>
                <p className="mt-1 text-headline-md text-error">{rideOverview.cancelled}</p>
              </div>
            </div>
          </Panel>

          <Panel className="overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low p-4">
              <h3 className="text-headline-sm">Trip Records</h3>
              <button
                className="flex items-center gap-2 rounded-lg p-2 text-primary transition-colors hover:bg-primary-container"
                onClick={() => {
                  const csvContent = [
                    ["Date", "Time", "Destination", "Status"].join(","),
                    ...rides.map((ride) => [
                      new Date(ride.requestedAt).toLocaleDateString(),
                      new Date(ride.requestedAt).toLocaleTimeString(),
                      ride.hospital?.name || ride.destAddress || ride.pickupAddress,
                      ride.status,
                    ].join(",")),
                  ].join("\n");
                  
                  const blob = new Blob([csvContent], { type: "text/csv" });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `trip-history-${new Date().toISOString().split("T")[0]}.csv`;
                  link.click();
                  window.URL.revokeObjectURL(url);
                  toast.success("Trip history exported successfully!");
                }}
                type="button"
              >
                <MaterialIcon name="download" className="text-sm" />
                <span className="text-label-sm font-semibold">EXPORT</span>
              </button>
            </div>
            {rides.length ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-lowest">
                      <th className="p-4 text-label-sm uppercase tracking-wider text-secondary">Date &amp; Time</th>
                      <th className="p-4 text-label-sm uppercase tracking-wider text-secondary">Destination</th>
                      <th className="p-4 text-label-sm uppercase tracking-wider text-secondary">Status</th>
                      <th className="p-4 text-right text-label-sm uppercase tracking-wider text-secondary">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {rides.map((ride) => (
                      <tr key={ride.id} className="transition-colors hover:bg-surface-container-low">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-body-md font-medium">{formatDate(ride.requestedAt)}</span>
                            <span className="mt-1 font-mono text-label-sm text-secondary">{formatTime(ride.requestedAt)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <MaterialIcon name={ride.hospital?.name ? "local_hospital" : "location_on"} className="text-sm text-secondary" />
                            <span className="text-body-md">{ride.hospital?.name || ride.destAddress || ride.pickupAddress}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-sm border px-2 py-1 text-label-sm ${
                              ride.status === "COMPLETED"
                                ? "border-[#ceead6] bg-[#e6f4ea] text-[#137333]"
                                : ride.status === "CANCELLED"
                                  ? "border-outline-variant bg-error-container text-on-error-container"
                                  : "border-outline-variant bg-surface-container text-on-surface-variant"
                            }`}
                          >
                            {formatStatusLabel(ride.status)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            className="p-1 text-primary transition-colors hover:text-primary-container"
                            onClick={() => navigate(`/patient/trip/${ride.id}`)}
                            type="button"
                          >
                            <MaterialIcon name="visibility" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                actionLabel="Request Ambulance"
                icon="assignment"
                message="Your completed and in-progress emergency requests will appear here."
                onAction={() => navigate("/patient/home")}
                title="No trip records yet"
              />
            )}
          </Panel>
        </div>
        </div>
      </main>

      <BottomNav items={getPatientBottomNav("Missions")} />
    </div>
  );
}
