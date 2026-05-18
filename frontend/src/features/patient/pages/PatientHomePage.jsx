import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TopBar } from "../../../components/layout/TopBar";
import { BottomNav } from "../../../components/layout/BottomNav";
import { MapStage } from "../../../components/shared/MapStage";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { getPatientBottomNav, patientData } from "../../../data/appData";
import { getCurrentCoordinates } from "../../../lib/geolocation";
import { getApiErrorMessage } from "../../../services/apiClient";
import { userApi } from "../../../services/appApi";

export default function PatientHomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState({
    lat: 19.1973,
    lng: 72.9644,
  });
  const [isSyncingLocation, setIsSyncingLocation] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [locationError, setLocationError] = useState("");

  const locationLabel = useMemo(() => {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }, [location.lat, location.lng]);

  async function syncLocation() {
    setIsSyncingLocation(true);
    setLocationError("");

    try {
      const coordinates = await getCurrentCoordinates();
      setLocation(coordinates);
    } catch (error) {
      setLocationError(getApiErrorMessage(error, "Could not access your live location."));
    } finally {
      setIsSyncingLocation(false);
    }
  }

  useEffect(() => {
    syncLocation();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function checkActiveTrip() {
      try {
        const response = await userApi.getActiveTrip();
        const trip = response.data;

        if (!mounted || !trip) {
          return;
        }

        if (trip.status === "SEARCHING") {
          navigate(`/patient/matching/${trip.id}`, { replace: true });
          return;
        }

        navigate(`/patient/tracking/${trip.id}`, { replace: true });
      } catch {
        // Ignore active trip probe failures on initial page load.
      }
    }

    checkActiveTrip();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleRequestAmbulance() {
    setIsBooking(true);

    try {
      const response = await userApi.bookTrip(location);
      toast.success("Ambulance request created.");
      navigate(`/patient/matching/${response.data.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create your ambulance request."));
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        links={[
          { label: "Map", to: "/patient/home", active: true },
          { label: "Missions", to: "/patient/history" },
          { label: "Chat", to: "/patient/tracking" },
          { label: "Profile", to: "/patient/profile" },
        ]}
      />

      <main className="relative flex min-h-[calc(100vh-56px)] flex-col pb-20 md:min-h-[calc(100vh-64px)] md:pb-0">
        <div className="bg-error p-stack-sm text-center text-on-error">
          <p className="text-label-md uppercase">
            For Immediate Life-Threatening Emergencies, Call Local Services If Unresponsive Here
          </p>
        </div>

        <MapStage
          image={patientData.images.patientHomeMap}
          imageClassName="opacity-60"
          className="relative min-h-[512px] flex-1"
        >
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
              <div className="z-10 h-4 w-4 rounded-full border-2 border-surface-container-lowest bg-primary" />
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-tertiary" />
              <span className="text-label-sm text-on-surface">GPS Active: High Accuracy</span>
            </div>
          </div>

          <div className="absolute left-margin-mobile right-margin-mobile top-margin-mobile z-10 rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-panel md:left-auto md:right-margin-desktop md:w-96">
            <h2 className="mb-1 text-label-md text-secondary">CURRENT LOCATION</h2>
            <div className="flex items-start gap-3">
              <MaterialIcon name="location_on" filled className="mt-1 text-primary" />
              <div>
                <p className="text-headline-sm">{isSyncingLocation ? "Syncing your GPS..." : "Live GPS Coordinates"}</p>
                <p className="text-body-md text-secondary">{locationLabel}</p>
                {locationError ? <p className="mt-2 text-label-sm text-error">{locationError}</p> : null}
              </div>
            </div>
            <button
              className="mt-stack-sm flex items-center gap-1 text-label-md text-primary hover:underline"
              onClick={syncLocation}
              type="button"
            >
              <MaterialIcon name="edit" className="text-[16px]" />
              {isSyncingLocation ? "Refreshing..." : "Refresh Location"}
            </button>
          </div>
        </MapStage>

        <div className="relative z-20 w-full border-t border-outline-variant bg-surface-container-lowest p-margin-mobile shadow-[0_-4px_16px_rgba(0,0,0,0.05)] md:absolute md:bottom-0 md:left-0 md:flex md:justify-center md:border-none md:bg-transparent md:p-margin-desktop md:shadow-none">
          <div className="w-full md:max-w-xl md:rounded-xl md:border md:border-outline-variant md:bg-surface-container-lowest md:p-stack-lg md:shadow-panel">
            <div className="mb-stack-md hidden text-center md:block">
              <p className="text-headline-md">Need immediate assistance?</p>
              <p className="text-body-md text-secondary">
                Your exact location will be sent to the nearest available unit.
              </p>
            </div>
            <Button
              className="w-full py-4 text-headline-md"
              disabled={isSyncingLocation}
              icon="ambulance"
              iconFilled
              loading={isBooking}
              onClick={handleRequestAmbulance}
            >
              REQUEST AMBULANCE NOW
            </Button>
            <p className="mt-stack-sm text-center text-label-sm text-secondary">
              {isSyncingLocation ? "Confirming your location for dispatch..." : "Estimated response time in your area:"}{" "}
              <span className="font-semibold text-on-surface">5-8 mins</span>
            </p>
          </div>
        </div>
      </main>

      <BottomNav items={getPatientBottomNav("Map")} />
    </div>
  );
}
