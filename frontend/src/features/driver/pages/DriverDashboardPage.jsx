import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { MapStage } from "../../../components/shared/MapStage";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { MetricCard } from "../../../components/ui/MetricCard";
import { EmptyState, PageError, PageLoader } from "../../../components/ui/PageState";
import { Panel } from "../../../components/ui/Panel";
import { operationsData } from "../../../data/appData";
import { formatCurrency, formatDistanceKm, formatStatusLabel } from "../../../lib/formatters";
import { getCurrentCoordinates } from "../../../lib/geolocation";
import { getApiErrorMessage } from "../../../services/apiClient";
import { socket } from "../../../services/socketClient";
import { driverApi } from "../../../services/appApi";
import { useAuthStore } from "../../../store/useAuthStore";

export default function DriverDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [dashboard, setDashboard] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState("");

  const isOnline = dashboard?.driver?.status === "AVAILABLE";
  const activeRequest = pendingRequests[0] ?? null;
  const sideItems = useMemo(
    () => [
      { label: "Dashboard", icon: "dashboard", to: "/driver/dashboard", active: true },
      { label: "Navigation", icon: "emergency", to: activeTrip ? `/driver/navigation/${activeTrip.id}` : "/driver/dashboard" },
    ],
    [activeTrip],
  );

  const loadDashboard = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const [summaryResponse, activeTripResponse] = await Promise.all([
        driverApi.getDashboardSummary(),
        driverApi.getActiveTrip(),
      ]);

      setDashboard(summaryResponse.data);
      setActiveTrip(activeTripResponse.data);

      if (activeTripResponse.data) {
        navigate(`/driver/navigation/${activeTripResponse.data.id}`, { replace: true });
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to load the driver dashboard."));
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, [navigate]);

  const syncLocation = useCallback(async () => {
    const coordinates = await getCurrentCoordinates();
    await driverApi.updateLocation(coordinates);
  }, []);

  useEffect(() => {
    socket.connect();
    loadDashboard(true);
  }, [loadDashboard]);

  useEffect(() => {
    if (!isOnline) {
      setPendingRequests([]);
      return undefined;
    }

    let intervalId = null;

    async function fetchRequests() {
      try {
        await syncLocation();
        const response = await driverApi.getPendingRequests();
        setPendingRequests(response.data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to refresh nearby requests."));
      }
    }

    fetchRequests();
    intervalId = window.setInterval(fetchRequests, 5000);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isOnline, syncLocation]);

  async function handleToggleStatus() {
    setIsToggling(true);

    try {
      if (!isOnline) {
        await syncLocation();
      }

      await driverApi.updateStatus({ isOnline: !isOnline });
      await loadDashboard();
      toast.success(`You are now ${!isOnline ? "online" : "offline"}.`);
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Could not update driver availability."));
    } finally {
      setIsToggling(false);
    }
  }

  function handleAcceptRequest(request) {
    if (!user?.id) {
      return;
    }

    socket.emit("acceptTrip", {
      tripId: request.id,
      driverId: user.id,
    });

    navigate(`/driver/navigation/${request.id}`);
  }

  if (isLoading) {
    return <PageLoader label="Loading driver dashboard..." />;
  }

  if (!dashboard) {
    return <PageError actionLabel="Retry" message={error} onAction={() => loadDashboard(true)} />;
  }

  return (
    <DashboardShell
      sideTitle="AmbuSOS Driver"
      sideSubtitle={dashboard.driver?.licenseNumber || "Live Fleet"}
      sideItems={sideItems}
      sideCta={
        <Button className="mt-auto w-full" icon={isOnline ? "toggle_off" : "toggle_on"} loading={isToggling} onClick={handleToggleStatus}>
          {isOnline ? "Go Offline" : "Go Online"}
        </Button>
      }
      bottomItems={[
        { label: "Dashboard", icon: "dashboard", to: "/driver/dashboard", active: true },
        { label: "Mission", icon: "emergency", to: activeTrip ? `/driver/navigation/${activeTrip.id}` : "/driver/dashboard" },
      ]}
      mainClassName="flex-1 overflow-y-auto bg-background p-margin-mobile pb-24 md:p-margin-desktop"
      rightSlot={
        <>
          <div className="mr-4 hidden items-center rounded-full border border-outline-variant bg-surface-container px-3 py-1.5 md:flex">
            <span className={`mr-2 h-3 w-3 animate-pulse rounded-full ${isOnline ? "bg-tertiary" : "bg-error"}`} />
            <span className={`text-label-sm font-semibold ${isOnline ? "text-tertiary" : "text-error"}`}>
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-high">
            <MaterialIcon name="notifications" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-high">
            <MaterialIcon name="account_circle" />
          </button>
        </>
      }
    >
      <div className="w-full">
        <div className="mb-stack-lg flex flex-col items-start justify-between gap-4 rounded-lg border border-error-container bg-primary p-4 text-on-primary shadow-sm md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <MaterialIcon name="warning" filled className="text-3xl" />
            <div>
              <h2 className="text-headline-sm font-bold uppercase tracking-wide">
                {activeRequest ? "Immediate Dispatch Request" : "Driver Availability"}
              </h2>
              <p className="text-body-md opacity-90">
                {activeRequest
                  ? `${activeRequest.pickupAddress || "Live pickup"} • ${formatDistanceKm(activeRequest.distanceKm)} away`
                  : isOnline
                    ? "You are visible to nearby emergency requests."
                    : "Go online to receive dispatch requests in your area."}
              </p>
            </div>
          </div>
          <div className="flex w-full gap-2 md:w-auto">
            <Button
              className="flex-1 rounded md:flex-none"
              disabled={!activeRequest}
              onClick={() => activeRequest && handleAcceptRequest(activeRequest)}
              variant="inverse"
            >
              ACCEPT
            </Button>
            <Button
              className="flex-1 border-on-primary text-on-primary md:flex-none"
              disabled={!activeRequest}
              onClick={() => activeRequest && setPendingRequests((requests) => requests.slice(1))}
              variant="secondary"
            >
              IGNORE
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-stack-lg md:grid-cols-12">
          <div className="flex flex-col gap-stack-lg md:col-span-4">
            <div className="grid grid-cols-2 gap-stack-sm">
              <MetricCard label="Today's Earnings" value={formatCurrency(dashboard.stats?.todayEarnings ?? 0)} />
              <MetricCard label="Completed Trips" value={String(dashboard.stats?.completedTrips ?? 0)} />
            </div>
            <Panel className="flex flex-1 flex-col p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-surface-container pb-2">
                <h3 className="flex items-center gap-2 text-headline-sm font-semibold">
                  <MaterialIcon name="assignment" className="text-secondary" />
                  Current Mission
                </h3>
                <span className="rounded bg-surface-container px-2 py-1 text-label-sm text-secondary">
                  {activeTrip ? formatStatusLabel(activeTrip.status) : "Standby"}
                </span>
              </div>
              {activeTrip ? (
                <div className="flex flex-1 flex-col justify-between gap-4 p-2">
                  <div>
                    <p className="text-label-sm uppercase tracking-wider text-secondary">Pickup</p>
                    <p className="mt-1 text-body-md">{activeTrip.pickupAddress}</p>
                  </div>
                  <div>
                    <p className="text-label-sm uppercase tracking-wider text-secondary">Destination</p>
                    <p className="mt-1 text-body-md">{activeTrip.destAddress || "Hospital to be assigned on arrival"}</p>
                  </div>
                  <Button icon="route" onClick={() => navigate(`/driver/navigation/${activeTrip.id}`)}>
                    Resume Mission
                  </Button>
                </div>
              ) : pendingRequests.length ? (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
                      <p className="text-label-sm uppercase tracking-wider text-secondary">New Emergency</p>
                      <p className="mt-2 text-body-md">{request.pickupAddress || "Live location request"}</p>
                      <p className="mt-1 text-label-sm text-secondary">{formatDistanceKm(request.distanceKm)}</p>
                      <Button className="mt-3 w-full" onClick={() => handleAcceptRequest(request)}>
                        Accept Request
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="radar"
                  message="Stay online to keep receiving new emergency dispatches."
                  title="Awaiting next dispatch"
                />
              )}
            </Panel>
          </div>

          <MapStage
            tone="dark"
            image={operationsData.images.driverDashboardMap}
            imageClassName="opacity-80"
            className="h-[400px] rounded-lg border border-outline shadow-sm md:col-span-8 md:h-auto"
          >
            <div className="absolute right-4 top-4 flex flex-col gap-2 rounded bg-surface-container-lowest/90 p-2 backdrop-blur-sm">
              {["add", "remove", "my_location"].map((icon) => (
                <button
                  key={icon}
                  className={`flex h-8 w-8 items-center justify-center rounded bg-surface ${
                    icon === "my_location" ? "text-primary" : "text-on-surface"
                  } hover:bg-surface-variant`}
                >
                  <MaterialIcon name={icon} filled={icon === "my_location"} className="text-sm" />
                </button>
              ))}
            </div>
            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary/20">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-container-lowest bg-primary shadow-sm">
                  <MaterialIcon name="ambulance" className="text-[14px] text-on-primary" />
                </div>
              </div>
            </div>
          </MapStage>
        </div>
      </div>
    </DashboardShell>
  );
}
