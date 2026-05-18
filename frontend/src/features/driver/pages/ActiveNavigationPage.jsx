import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { MapStage } from "../../../components/shared/MapStage";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { Panel } from "../../../components/ui/Panel";
import { PageError, PageLoader } from "../../../components/ui/PageState";
import { TextField } from "../../../components/ui/TextField";
import { formatStatusLabel } from "../../../lib/formatters";
import { getCurrentCoordinates } from "../../../lib/geolocation";
import { getApiErrorMessage } from "../../../services/apiClient";
import { socket } from "../../../services/socketClient";
import { driverApi, tripApi } from "../../../services/appApi";

export default function ActiveNavigationPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState({
    severity: "MODERATE",
    suspectedCondition: "",
    vitalsCheck: "",
    paramedicNotes: "",
  });

  const routePhase = useMemo(() => {
    if (!trip) {
      return "TO_PICKUP";
    }

    return ["ARRIVED", "ON_BOARD"].includes(trip.status) ? "TO_HOSPITAL" : "TO_PICKUP";
  }, [trip]);

  useEffect(() => {
    if (!tripId) {
      return undefined;
    }

    let mounted = true;

    async function fetchTrip() {
      setIsLoading(true);

      try {
        const response = await driverApi.getTrip(tripId);

        if (!mounted) {
          return;
        }

        setTrip(response.data);
        setReport((current) => ({
          ...current,
          severity: response.data.medicalReport?.severity || current.severity,
          suspectedCondition: response.data.medicalReport?.suspectedCondition || current.suspectedCondition,
          paramedicNotes: response.data.medicalReport?.paramedicNotes || current.paramedicNotes,
          vitalsCheck: response.data.medicalReport?.vitalsCheck
            ? JSON.stringify(response.data.medicalReport.vitalsCheck, null, 2)
            : current.vitalsCheck,
        }));
      } catch (requestError) {
        if (mounted) {
          setError(getApiErrorMessage(requestError, "Unable to load this trip."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTrip();
    socket.connect();
    socket.emit("joinTrip", tripId);

    return () => {
      mounted = false;
      // Clean up socket listeners for this trip
      socket.off("tripStatusChanged");
      socket.off("driverLocationUpdated");
    };
  }, [tripId]);

  const syncDriverLocation = useCallback(async () => {
    try {
      const coordinates = await getCurrentCoordinates();
      socket.emit("driverLocationUpdate", {
        tripId,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });
    } catch {
      // Keep the flow usable even if live location is unavailable.
    }
  }, [tripId]);

  useEffect(() => {
    if (trip) {
      syncDriverLocation();
    }
  }, [syncDriverLocation, trip]);

  function updateReport(field, value) {
    setReport((current) => ({ ...current, [field]: value }));
  }

  async function handlePrimaryAction() {
    if (!trip) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (routePhase === "TO_PICKUP") {
        const response = await tripApi.arriveToPatient(trip.id);
        const updatedTrip = response.data.updatedTrip;

        socket.emit("updateTripStatus", {
          tripId: trip.id,
          status: updatedTrip.status,
          message: `Patient picked up. Heading to ${updatedTrip.hospital?.name || "assigned hospital"}.`,
          destLat: updatedTrip.destLat,
          destLng: updatedTrip.destLng,
        });

        setTrip((current) => ({
          ...current,
          ...updatedTrip,
          hospital: updatedTrip.hospital || current?.hospital,
        }));
        toast.success("Patient pickup confirmed.");
        return;
      }

      if (!showCompletionForm) {
        await tripApi.arriveAtHospital(trip.id);
        socket.emit("updateTripStatus", {
          tripId: trip.id,
          status: "ON_BOARD",
          message: "Arrived at hospital. Preparing handover.",
        });
        setShowCompletionForm(true);
        toast.success("Hospital arrival confirmed.");
        return;
      }

      let parsedVitals = null;

      if (report.vitalsCheck.trim()) {
        try {
          parsedVitals = JSON.parse(report.vitalsCheck);
        } catch (parseError) {
          setIsSubmitting(false);
          toast.error("Vitals must be valid JSON before completing handover.");
          return;
        }
      }

      await tripApi.complete(trip.id, {
        severity: report.severity,
        suspectedCondition: report.suspectedCondition,
        vitalsCheck: parsedVitals,
        paramedicNotes: report.paramedicNotes,
      });

      socket.emit("updateTripStatus", {
        tripId: trip.id,
        status: "COMPLETED",
        message: "Handover completed successfully.",
      });

      toast.success("Trip completed and medical report saved.");
      navigate("/driver/dashboard", { replace: true });
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Could not update trip status."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <PageLoader label="Loading navigation..." />;
  }

  if (!trip) {
    return <PageError actionLabel="Back to Dashboard" message={error} onAction={() => navigate("/driver/dashboard")} />;
  }

  return (
    <DashboardShell
      sideTitle="AmbuSOS Driver"
      sideSubtitle={trip.driver?.ambulance?.plateNumber || "Mission"}
      sideItems={[
        { label: "Dashboard", icon: "dashboard", to: "/driver/dashboard" },
        { label: "Navigation", icon: "emergency", to: `/driver/navigation/${trip.id}`, active: true },
      ]}
      sideCta={<Button className="mt-auto w-full" icon="dashboard" onClick={() => navigate("/driver/dashboard")}>Back to Dashboard</Button>}
      bottomItems={[
        { label: "Dashboard", icon: "dashboard", to: "/driver/dashboard" },
        { label: "Mission", icon: "emergency", to: `/driver/navigation/${trip.id}`, active: true },
      ]}
      mainClassName="flex-1 overflow-hidden"
    >
      <div className="flex h-[calc(100vh-56px)] flex-col md:h-[calc(100vh-64px)] md:flex-row">
        <MapStage className="relative flex-1">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent md:hidden" />
          <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
            <path d="M 20 80 Q 150 120 200 300 T 400 450" fill="none" opacity="0.6" stroke="#af101a" strokeDasharray="10,10" strokeWidth="6" />
            <circle cx="20" cy="80" r="8" fill="#af101a" stroke="#fff" strokeWidth="2">
              <animate attributeName="r" dur="2s" repeatCount="indefinite" values="8;16;8" />
              <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="1;0;1" />
            </circle>
            <circle cx="400" cy="450" r="10" fill="#11651d" stroke="#fff" strokeWidth="2" />
          </svg>

          <Panel className="absolute left-margin-mobile right-margin-mobile top-margin-mobile z-10 overflow-hidden bg-inverse-surface text-inverse-on-surface md:left-auto md:right-margin-desktop md:w-96">
            <div className="flex items-center justify-between border-b border-outline-variant/20 bg-inverse-surface p-stack-md">
              <div className="flex items-center gap-3">
                <MaterialIcon name="turn_right" filled className="text-[32px] text-tertiary-fixed" />
                <div>
                  <div className="text-display-lg text-on-primary">
                    {routePhase === "TO_PICKUP" ? "SCENE" : "ER"}
                  </div>
                  <div className="text-headline-sm text-secondary-fixed-dim">
                    {routePhase === "TO_PICKUP" ? trip.pickupAddress : trip.hospital?.name || trip.destAddress || "Assigned Hospital"}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-surface-container-highest p-stack-md text-on-surface">
              <div>
                <div className="text-label-sm uppercase tracking-widest text-secondary">ETA</div>
                <div className="text-headline-lg-mobile text-primary">{routePhase === "TO_PICKUP" ? "Pickup" : "Hospital"}</div>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div>
                <div className="text-label-sm uppercase tracking-widest text-secondary">Distance</div>
                <div className="text-headline-lg-mobile">{trip.distanceKm ? `${trip.distanceKm} km` : "Live"}</div>
              </div>
              <div className="h-8 w-px bg-outline-variant" />
              <div>
                <div className="text-label-sm uppercase tracking-widest text-secondary">Phase</div>
                <div className="rounded bg-tertiary-fixed-dim/20 px-2 py-1 text-label-md font-bold text-tertiary">
                  {routePhase === "TO_PICKUP" ? "Route to Patient" : showCompletionForm ? "Handover" : "Route to Hospital"}
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="absolute bottom-margin-mobile left-margin-mobile right-margin-mobile z-10 p-stack-md md:bottom-auto md:left-margin-mobile md:right-auto md:top-margin-desktop md:w-80">
            <div className="mb-2 flex items-start justify-between">
              <div className="text-label-md uppercase text-secondary">Mission #{trip.id.slice(0, 8).toUpperCase()}</div>
              <MaterialIcon name="fiber_manual_record" filled className="animate-soft-pulse text-[16px] text-primary" />
            </div>
            <h3 className="text-headline-md">{trip.medicalReport?.suspectedCondition || "Emergency Response"}</h3>
            <p className="mt-1 flex items-center gap-2 text-body-md text-secondary">
              <MaterialIcon name="location_on" className="text-[18px]" />
              {routePhase === "TO_PICKUP" ? trip.pickupAddress : trip.hospital?.address || trip.destAddress || "Hospital destination"}
            </p>
            <p className="mt-2 text-label-sm uppercase tracking-wider text-secondary">{formatStatusLabel(trip.status)}</p>
            {showCompletionForm ? (
              <div className="mt-4 border-t border-surface-variant pt-4">
                <div className="grid gap-stack-sm">
                  <TextField
                    id="severity"
                    label="Severity"
                    onChange={(event) => updateReport("severity", event.target.value)}
                    value={report.severity}
                  />
                  <TextField
                    id="suspected-condition"
                    label="Suspected Condition"
                    onChange={(event) => updateReport("suspectedCondition", event.target.value)}
                    value={report.suspectedCondition}
                  />
                  <TextField
                    id="paramedic-notes"
                    label="Paramedic Notes"
                    onChange={(event) => updateReport("paramedicNotes", event.target.value)}
                    rows={4}
                    type="textarea"
                    value={report.paramedicNotes}
                  />
                  <TextField
                    helper='Optional JSON object, for example {"bp":"120/80","spo2":"98%"}'
                    id="vitals"
                    label="Vitals JSON"
                    onChange={(event) => updateReport("vitalsCheck", event.target.value)}
                    rows={4}
                    type="textarea"
                    value={report.vitalsCheck}
                  />
                </div>
                <Button className="mt-4 w-full px-6 py-2" icon="check_circle" iconSide="right" loading={isSubmitting} onClick={handlePrimaryAction}>
                  Complete Handover
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between border-t border-surface-variant pt-4">
                <Button variant="soft" className="px-4 py-2" icon="call" onClick={syncDriverLocation}>
                  Sync Location
                </Button>
                <Button className="px-6 py-2" icon="check_circle" iconSide="right" loading={isSubmitting} onClick={handlePrimaryAction}>
                  {routePhase === "TO_PICKUP" ? "Arrived at Patient" : "Arrived at Hospital"}
                </Button>
              </div>
            )}
          </Panel>
        </MapStage>
      </div>
    </DashboardShell>
  );
}
