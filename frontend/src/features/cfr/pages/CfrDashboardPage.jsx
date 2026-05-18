import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BottomNav } from "../../../components/layout/BottomNav";
import { BrandMark } from "../../../components/layout/BrandMark";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { EmptyState, PageError, PageLoader } from "../../../components/ui/PageState";
import { formatDistanceKm, formatStatusLabel } from "../../../lib/formatters";
import { getCurrentCoordinates } from "../../../lib/geolocation";
import { getApiErrorMessage } from "../../../services/apiClient";
import { socket } from "../../../services/socketClient";
import { cfrApi } from "../../../services/appApi";
import { useAuthStore } from "../../../store/useAuthStore";

export default function CfrDashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [nearbyTrips, setNearbyTrips] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [error, setError] = useState("");

  const sideItems = [
    { label: "Nearby Calls", icon: "dashboard", to: "/cfr/dashboard", active: true },
    { label: "Status", icon: "medical_services", to: "/cfr/dashboard" },
  ];

  useEffect(() => {
    let intervalId = null;
    let mounted = true;

    async function fetchNearbyEmergencies() {
      if (!mounted) return;
      setIsLoading(true);

      try {
        const coords = currentLocation ?? (await getCurrentCoordinates());
        setCurrentLocation(coords);

        const response = await cfrApi.getNearby(coords.lat, coords.lng);
        if (mounted) {
          setNearbyTrips(response.data);
          setError("");
        }
      } catch (requestError) {
        if (mounted) {
          setError(getApiErrorMessage(requestError, "Unable to fetch nearby emergencies."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    socket.connect();
    fetchNearbyEmergencies();
    intervalId = window.setInterval(fetchNearbyEmergencies, 10000);

    return () => {
      mounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      socket.off("cfrAlert");
    };
  }, [currentLocation]);

  async function handleRespond(tripId) {
    setRespondingTo(tripId);

    try {
      await cfrApi.respond(tripId);
      socket.emit("cfrResponding", {
        tripId,
        cfrName: user?.fullName || "CFR",
      });
      toast.success("You are now responding to this emergency.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Could not respond to this emergency."));
    } finally {
      setRespondingTo(null);
    }
  }

  if (isLoading && !currentLocation && !nearbyTrips.length) {
    return <PageLoader label="Locating nearby emergencies..." />;
  }

  if (error && !nearbyTrips.length) {
    return <PageError actionLabel="Retry" message={error} onAction={() => setError("")} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <header className="z-10 flex h-14 items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile md:hidden">
        <BrandMark />
        <div className="flex items-center gap-stack-sm text-primary">
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high">
            <MaterialIcon name="notifications" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-high" onClick={() => navigate("/cfr/profile")}>
            <MaterialIcon name="account_circle" />
          </button>
        </div>
      </header>

      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low p-stack-md md:flex">
        <div className="mb-stack-lg">
          <div className="mb-unit text-headline-sm font-semibold text-primary">AmbuSOS Admin</div>
          <div className="text-label-md text-secondary">Hospital Command</div>
        </div>
        <div className="flex flex-1 flex-col gap-unit">
          {sideItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-stack-sm rounded-xl px-4 py-3 text-label-md transition-colors ${
                item.active
                  ? "scale-[0.98] bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              <MaterialIcon name={item.icon} filled={item.active} />
              {item.label}
            </Link>
          ))}
        </div>
        <Button className="mt-auto w-full" icon="add_circle">
          CFR READY
        </Button>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden bg-surface-dim md:flex-row">
        <section className="z-10 flex h-1/2 w-full max-w-md flex-col overflow-y-auto border-r border-outline-variant bg-surface-container-lowest shadow-[2px_0_8px_rgba(0,0,0,0.05)] md:h-screen md:w-1/3">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-surface-variant bg-surface-container-lowest p-stack-md">
            <div className="flex items-center gap-stack-sm">
              <div className="h-3 w-3 animate-soft-pulse rounded-full bg-tertiary" />
              <span className="text-headline-sm">ON DUTY</span>
            </div>
            <div className="text-label-md text-secondary">
              Radius: <span className="font-semibold text-on-surface">2km</span>
            </div>
          </div>

          <div className="flex flex-col gap-stack-md p-stack-md">
            {nearbyTrips.length ? nearbyTrips.map((incident) => (
              <article
                key={incident.id}
                className={`relative overflow-hidden rounded-lg border p-stack-sm shadow-sm ${
                  incident.status === "SEARCHING" ? "border-error" : "border-surface-variant"
                }`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${
                    incident.status === "SEARCHING" ? "bg-error" : "bg-tertiary"
                  }`}
                />
                <div className="mb-stack-sm flex items-start justify-between pl-2">
                  <div className="flex items-center gap-stack-sm">
                    <MaterialIcon
                      name={incident.status === "SEARCHING" ? "warning" : "healing"}
                      filled
                      className={incident.status === "SEARCHING" ? "text-error" : "text-tertiary"}
                    />
                    <span className={`text-label-md font-bold uppercase ${incident.status === "SEARCHING" ? "text-error" : "text-tertiary"}`}>
                      {incident.medicalReport?.severity || formatStatusLabel(incident.status)}
                    </span>
                  </div>
                  <div
                    className={`rounded px-2 py-1 text-label-sm ${
                      incident.status === "SEARCHING"
                        ? "bg-error-container text-on-error-container"
                        : "bg-surface-container text-secondary"
                    }`}
                  >
                    {incident.requestedAt ? new Date(incident.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Live"}
                  </div>
                </div>
                <div className="mb-stack-md pl-2">
                  <h3 className="mb-unit text-body-md font-semibold">{incident.passenger?.fullName || "Medical Emergency"}</h3>
                  <p className="flex items-center gap-unit text-label-md text-secondary">
                    <MaterialIcon name="location_on" className="text-[16px]" />
                    {incident.pickupAddress}
                  </p>
                  <p className="mt-unit flex items-center gap-unit text-label-md text-secondary">
                    <MaterialIcon name="route" className="text-[16px]" />
                    {formatDistanceKm(incident.distanceKm)}
                  </p>
                </div>
                <div className="flex gap-stack-sm pl-2">
                  <Button
                    loading={respondingTo === incident.id}
                    onClick={() => handleRespond(incident.id)}
                    variant={incident.status === "SEARCHING" ? "primary" : "secondary"}
                    className="flex-1 rounded py-2"
                  >
                    RESPOND
                  </Button>
                  <button className="flex h-10 w-10 items-center justify-center rounded border border-outline text-on-surface-variant transition-colors hover:bg-surface-container-high">
                    <MaterialIcon name="info" />
                  </button>
                </div>
              </article>
            )) : (
              <EmptyState
                icon="radar"
                message="You're clear for now. Active emergencies within 2 km will appear here automatically."
                title="No nearby emergencies"
              />
            )}
          </div>
        </section>

        <section className="relative flex-1 bg-surface-dim">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: "radial-gradient(#8f6f6c 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute right-margin-mobile top-margin-mobile flex flex-col gap-stack-sm">
            {["my_location", "layers"].map((icon) => (
              <button
                key={icon}
                className="flex h-10 w-10 items-center justify-center rounded border border-surface-variant bg-surface-container-lowest shadow-sm transition-colors hover:bg-surface-container-high"
              >
                <MaterialIcon name={icon} />
              </button>
            ))}
          </div>
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <div className="mb-unit flex items-center gap-unit rounded bg-error px-2 py-1 text-label-sm text-on-error shadow-md">
              <MaterialIcon name="directions_car" className="text-[14px]" />
              1.2km
            </div>
            <div className="flex h-6 w-6 animate-pulse items-center justify-center rounded-full border-2 border-surface-container-lowest bg-error shadow-md" />
          </div>
          <div className="absolute left-[40%] top-[60%] -translate-x-1/2 -translate-y-1/2">
            <div className="h-4 w-4 rounded-full border-2 border-surface-container-lowest bg-tertiary shadow-sm" />
          </div>
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            <path d="M 40% 60% Q 45% 55% 50% 50%" fill="none" stroke="#11651d" strokeDasharray="6 4" strokeWidth="3" opacity="0.6" />
          </svg>
        </section>
      </main>

      <BottomNav items={[{ label: "Nearby", icon: "dashboard", to: "/cfr/dashboard", active: true }]} />
    </div>
  );
}
