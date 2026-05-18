import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { BottomNav } from "../../../components/layout/BottomNav";
import { TopBar } from "../../../components/layout/TopBar";
import { MapStage } from "../../../components/shared/MapStage";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { PageError, PageLoader } from "../../../components/ui/PageState";
import { getPatientBottomNav, patientData } from "../../../data/appData";
import { getDriverLatLng } from "../../../lib/geolocation";
import { formatStatusLabel, formatTime } from "../../../lib/formatters";
import { getApiErrorMessage } from "../../../services/apiClient";
import { socket } from "../../../services/socketClient";
import { userApi } from "../../../services/appApi";

export default function LiveTripTrackingPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Ambulance is en route.");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const driverSummary = useMemo(() => {
    if (!trip?.driver) {
      return "Awaiting driver assignment";
    }

    const unit = trip.driver.ambulance?.plateNumber || "Live Unit";
    const type = trip.driver.ambulance?.type || "Ambulance";
    return `${unit} - ${type}`;
  }, [trip?.driver]);

  useEffect(() => {
    if (!tripId) {
      return undefined;
    }

    async function fetchTrip() {
      try {
        const response = await userApi.getTrip(tripId);
        setTrip(response.data);
        setDriverLocation(getDriverLatLng(response.data.driver));
        setStatusMessage(formatStatusLabel(response.data.status));
        setError("");
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load live trip status."));
      } finally {
        setIsLoading(false);
      }
    }

    function joinRoom() {
      socket.emit("joinTrip", tripId);
    }

    function handleTripStatusChanged(payload) {
      setStatusMessage(payload.message || formatStatusLabel(payload.status));

      if (payload.status === "COMPLETED") {
        navigate(`/patient/trip/${tripId}`, { replace: true });
      }

      fetchTrip();
    }

    function handleDriverLocationUpdated(payload) {
      setDriverLocation([payload.lat, payload.lng]);
    }

    function handleCfrAlert(payload) {
      toast.info(payload.message);
    }

    socket.connect();
    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);
    socket.on("tripStatusChanged", handleTripStatusChanged);
    socket.on("driverLocationUpdated", handleDriverLocationUpdated);
    socket.on("cfrAlert", handleCfrAlert);

    fetchTrip();

    return () => {
      socket.off("connect", joinRoom);
      socket.off("tripStatusChanged", handleTripStatusChanged);
      socket.off("driverLocationUpdated", handleDriverLocationUpdated);
      socket.off("cfrAlert", handleCfrAlert);
    };
  }, [navigate, tripId]);

  if (isLoading) {
    return <PageLoader label="Loading live tracking..." />;
  }

  if (!trip) {
    return <PageError actionLabel="Back Home" message={error} onAction={() => navigate("/patient/home")} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />

      <main className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        <MapStage className="flex-1" image={patientData.images.patientHomeMap} imageClassName="opacity-65">
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest p-2 shadow-panel">
              <MaterialIcon name="ambulance" filled className="text-primary" />
            </div>
          </div>
          <div className="absolute left-3/4 top-1/4 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
              <MaterialIcon name="local_hospital" filled className="text-tertiary" />
            </div>
          </div>
          <div className="absolute left-0 top-0 z-20 w-full p-margin-mobile md:hidden">
            <div className="flex items-center justify-between rounded-lg bg-primary px-stack-md py-stack-sm text-on-primary shadow-panel">
              <div className="flex items-center gap-stack-sm">
                <MaterialIcon name="emergency" className="text-on-primary" />
                <span className="text-headline-sm">{formatStatusLabel(trip.status)}</span>
              </div>
              <div className="text-right">
                <span className="block text-label-md text-on-primary-container">ETA</span>
                <span className="block text-headline-sm">{trip.completedAt ? "ARRIVED" : "LIVE"}</span>
              </div>
            </div>
          </div>
        </MapStage>

        <div className="relative z-20 max-h-[614px] w-full shrink-0 border-t border-outline-variant bg-surface-container-lowest shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:max-h-full md:w-[400px] md:border-l md:border-t-0 md:shadow-none">
          <div className="flex h-8 items-center justify-center md:hidden">
            <div className="h-1 w-12 rounded-full bg-outline-variant" />
          </div>
          <div className="flex flex-1 flex-col gap-stack-lg overflow-y-auto p-margin-mobile md:p-margin-desktop">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="mb-1 block text-label-md uppercase tracking-wider text-secondary">
                    Current Status
                  </span>
                  <div className="flex items-center gap-stack-sm text-primary">
                    <div className="h-3 w-3 rounded-full bg-primary animate-pulse-ring" />
                    <h2 className="text-headline-md">{statusMessage}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="mb-1 block text-label-md uppercase tracking-wider text-secondary">
                    Last Update
                  </span>
                  <span className="block text-headline-lg">{formatTime(trip.completedAt || trip.pickedUpAt || trip.acceptedAt || trip.requestedAt)}</span>
                  <span className="text-label-sm text-tertiary">
                    {driverLocation ? `${driverLocation[0].toFixed(3)}, ${driverLocation[1].toFixed(3)}` : "Awaiting location"}
                  </span>
                </div>
              </div>
              <div className="my-stack-sm h-px bg-outline-variant" />
              <div className="flex items-center gap-stack-md">
                <div className="rounded-lg bg-surface-container p-2">
                  <MaterialIcon name="directions_car" filled className="text-secondary" />
                </div>
                <div>
                  <span className="block font-semibold">{driverSummary}</span>
                  <span className="block text-[14px] text-secondary">
                    Driver: {trip.driver?.user?.fullName || "Pending assignment"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md">
              <div className="mb-stack-sm flex items-center gap-stack-md">
                <div className="rounded-lg bg-tertiary-container p-2 text-on-tertiary-container">
                  <MaterialIcon name="local_hospital" filled />
                </div>
                <div>
                  <h3 className="text-headline-sm">{trip.hospital?.name || "Destination pending"}</h3>
                  <span className="text-body-md text-secondary">Emergency Department</span>
                </div>
              </div>
              <span className="mt-stack-sm block text-body-md text-secondary">
                {trip.destAddress || "Hospital destination will appear once the driver arrives at the patient."}
              </span>
            </div>

            <div className="mt-auto flex flex-col gap-stack-md">
              <Button variant="soft" className="w-full py-3 text-headline-sm" icon="share">
                Share Live Status
              </Button>
              <Button variant="soft" className="w-full py-3 text-headline-sm" icon="call">
                Contact Dispatch
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav items={getPatientBottomNav("Map")} />
    </div>
  );
}
