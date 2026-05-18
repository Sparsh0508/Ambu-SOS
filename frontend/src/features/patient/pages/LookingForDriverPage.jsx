import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { TopBar } from "../../../components/layout/TopBar";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { patientData } from "../../../data/appData";
import { PageError, PageLoader } from "../../../components/ui/PageState";
import { getApiErrorMessage } from "../../../services/apiClient";
import { socket } from "../../../services/socketClient";
import { tripApi, userApi } from "../../../services/appApi";

export default function LookingForDriverPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId) {
      return undefined;
    }

    let intervalId = null;

    async function syncTripStatus() {
      try {
        const response = await userApi.getTrip(tripId);
        const nextTrip = response.data;
        setTrip(nextTrip);
        setError("");

        if (["ASSIGNED", "EN_ROUTE", "ARRIVED", "ON_BOARD"].includes(nextTrip.status)) {
          navigate(`/patient/tracking/${tripId}`, { replace: true });
        }
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load the current request."));
      } finally {
        setIsLoading(false);
      }
    }

    function joinRoom() {
      socket.emit("joinTrip", tripId);
    }

    function handleTripAccepted() {
      navigate(`/patient/tracking/${tripId}`, { replace: true });
    }

    function handleTripStatusChanged(payload) {
      if (["ASSIGNED", "EN_ROUTE", "ARRIVED", "ON_BOARD"].includes(payload.status)) {
        navigate(`/patient/tracking/${tripId}`, { replace: true });
      }
    }

    function handleCfrAlert(payload) {
      toast.info(payload.message);
    }

    socket.connect();
    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);
    socket.on("tripAccepted", handleTripAccepted);
    socket.on("tripStatusChanged", handleTripStatusChanged);
    socket.on("cfrAlert", handleCfrAlert);

    syncTripStatus();
    intervalId = window.setInterval(syncTripStatus, 3000);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }

      socket.off("connect", joinRoom);
      socket.off("tripAccepted", handleTripAccepted);
      socket.off("tripStatusChanged", handleTripStatusChanged);
      socket.off("cfrAlert", handleCfrAlert);
    };
  }, [navigate, tripId]);

  async function handleCancel() {
    setIsCancelling(true);

    try {
      await tripApi.cancel(tripId);
      toast.success("Trip request cancelled.");
      navigate("/patient/home", { replace: true });
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Could not cancel this request."));
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return <PageLoader label="Searching for the nearest available unit..." />;
  }

  if (!trip) {
    return <PageError actionLabel="Back Home" message={error} onAction={() => navigate("/patient/home")} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar rightSlot={<MaterialIcon name="help" className="text-primary" />} />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-margin-mobile md:p-margin-desktop">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${patientData.images.scanningMap})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative z-10 flex w-full max-w-lg flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-overlay md:p-margin-desktop">
          <div className="relative mb-stack-lg flex h-32 w-32 items-center justify-center">
            <div className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-primary" />
            <div className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-primary [animation-delay:0.5s]" />
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-panel">
              <MaterialIcon name="ambulance" filled className="text-[32px] text-on-primary" />
            </div>
          </div>

          <h1 className="mb-stack-sm text-center text-headline-lg-mobile md:text-headline-lg">
            Scanning for Units
          </h1>
          <p className="mb-stack-lg text-center text-body-md text-secondary">
            Locating the nearest available emergency responder.
          </p>

          <div className="mb-stack-lg w-full rounded-lg border border-outline-variant bg-surface-container-low p-stack-md">
            <div className="mb-stack-sm flex items-center justify-between">
              <span className="text-label-sm uppercase tracking-wider text-secondary">Trip ID</span>
              <span className="text-label-md text-on-surface">#{trip.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="mb-stack-sm flex items-start gap-stack-sm">
              <MaterialIcon name="my_location" className="mt-1 text-[20px] text-secondary" />
              <div>
                <div className="text-label-sm text-secondary">Pickup</div>
                <div className="text-body-md">{trip.pickupAddress}</div>
              </div>
            </div>
            <div className="flex items-start gap-stack-sm">
              <MaterialIcon name="local_hospital" className="mt-1 text-[20px] text-primary" />
              <div>
                <div className="text-label-sm text-secondary">Destination</div>
                <div className="text-body-md">{trip.hospital?.name || trip.destAddress || "Nearest hospital pending"}</div>
              </div>
            </div>
          </div>

          <div className="relative mb-stack-lg flex w-full items-center justify-between px-4">
            <div className="absolute left-8 right-8 top-1/2 h-[2px] -translate-y-1/2 bg-outline-variant" />
            {[
              ["Requested", true, "check"],
              ["Matching", "active", ""],
              ["En Route", false, "local_shipping"],
            ].map(([label, state, icon]) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    state === true
                      ? "bg-primary text-on-primary"
                      : state === "active"
                        ? "border-2 border-primary bg-surface-container-lowest"
                        : "border-2 border-outline-variant bg-surface-container-low text-outline-variant"
                  }`}
                >
                  {state === "active" ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  ) : (
                    <MaterialIcon name={icon} className="text-[16px]" />
                  )}
                </div>
                <span className={`text-label-sm ${state === "active" ? "font-semibold text-primary" : state ? "text-on-surface" : "text-secondary"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full border-t border-outline-variant pt-stack-md">
            <Button variant="secondary" className="w-full" icon="close" loading={isCancelling} onClick={handleCancel}>
              CANCEL REQUEST
            </Button>
            {error ? <p className="mt-3 text-center text-label-sm text-error">{error}</p> : null}
          </div>
        </div>
      </main>
    </div>
  );
}
