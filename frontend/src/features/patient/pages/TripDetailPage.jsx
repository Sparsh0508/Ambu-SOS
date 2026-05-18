import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { PageError, PageLoader } from "../../../components/ui/PageState";
import { Panel } from "../../../components/ui/Panel";
import { patientData } from "../../../data/appData";
import { formatDateTime, formatStatusLabel } from "../../../lib/formatters";
import { getApiErrorMessage } from "../../../services/apiClient";
import { userApi } from "../../../services/appApi";

export default function TripDetailPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { images } = patientData;
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchTrip() {
      setIsLoading(true);
      setError("");

      try {
        const response = await userApi.getTrip(tripId);

        if (mounted) {
          setTrip(response.data);
        }
      } catch (requestError) {
        if (mounted) {
          setError(getApiErrorMessage(requestError, "Unable to load trip details."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchTrip();

    return () => {
      mounted = false;
    };
  }, [tripId]);

  const timeline = useMemo(() => {
    if (!trip) {
      return [];
    }

    return [
      ["Requested", trip.requestedAt],
      ["Accepted", trip.acceptedAt],
      ["Picked Up", trip.pickedUpAt],
      ["Completed", trip.completedAt],
    ].filter(([, value]) => value);
  }, [trip]);

  if (isLoading) {
    return <PageLoader label="Loading trip details..." />;
  }

  if (!trip) {
    return <PageError actionLabel="Back to History" message={error} onAction={() => navigate("/patient/history")} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile shadow-sm md:px-margin-desktop">
        <div className="flex items-center gap-stack-md">
          <button className="rounded-full p-2 text-secondary transition-colors hover:bg-surface-container" onClick={() => navigate("/patient/history")} type="button">
            <MaterialIcon name="arrow_back" />
          </button>
          <div>
            <h1 className="text-headline-md font-bold tracking-tight">Mission #{trip.id.slice(0, 8).toUpperCase()}</h1>
            <p className="mt-0.5 text-label-sm uppercase tracking-widest text-secondary">{formatStatusLabel(trip.status)}</p>
          </div>
        </div>
        <div className="flex items-center gap-stack-sm">
          <div className="hidden items-center gap-2 rounded-full bg-surface-container-highest px-3 py-1.5 md:flex">
            <MaterialIcon name="schedule" className="text-[18px] text-secondary" />
            <span className="text-label-md text-on-surface-variant">Requested: {formatDateTime(trip.requestedAt)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-4 py-1.5 text-label-md">
            <div className={`h-2 w-2 rounded-full ${trip.status === "COMPLETED" ? "bg-tertiary" : "bg-secondary"}`} />
            {formatStatusLabel(trip.status)}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop">
        <div className="mx-auto max-w-screen-panel space-y-stack-lg pb-margin-desktop">
          <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-12">
            <Panel className="relative overflow-hidden p-margin-mobile shadow-sm lg:col-span-8 md:p-margin-desktop">
              <div className="absolute left-0 top-0 h-full w-2 bg-secondary-container" />
              <div className="flex flex-col gap-stack-lg md:flex-row md:items-start md:justify-between">
                <div className="pl-2">
                  <h2 className="mb-1 text-label-sm uppercase tracking-widest text-secondary">Patient Details</h2>
                  <div className="flex items-center gap-3 text-headline-lg-mobile font-bold md:text-headline-lg">
                    {trip.passenger?.fullName || "Patient"}
                    <span className="rounded border border-outline-variant bg-surface-container px-2 py-0.5 text-label-md text-on-surface-variant">
                      {trip.passenger?.phone || "Contact unavailable"}
                    </span>
                  </div>
                  <div className="mt-stack-md flex flex-wrap gap-stack-md">
                    <div className="flex items-center gap-2 text-on-surface">
                      <MaterialIcon name="badge" className="text-on-surface-variant" />
                      <span className="text-label-md">ID: {trip.passenger?.id || trip.passengerId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface">
                      <MaterialIcon name="bloodtype" className="text-on-surface-variant" />
                      <span className="text-label-md">{trip.passenger?.bloodType || "Blood type not recorded"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start pl-2 md:items-end md:pl-0">
                  <h2 className="mb-2 text-label-sm uppercase tracking-widest text-secondary">Severity Level</h2>
                  <div className="flex items-center gap-2 rounded border border-outline-variant bg-secondary-container px-4 py-2 text-on-secondary-container">
                    <MaterialIcon name="priority" />
                    <span className="text-label-md uppercase tracking-wider">{trip.medicalReport?.severity || "Pending"}</span>
                  </div>
                </div>
              </div>
              <hr className="my-stack-lg ml-2 border-outline-variant" />
              <div className="ml-2 grid grid-cols-2 gap-stack-md md:grid-cols-4">
                {timeline.map(([label, value]) => (
                  <div key={label}>
                    <span className="mb-1 block text-label-sm uppercase text-secondary">{label}</span>
                    <span className="text-label-md text-on-surface">{formatDateTime(value)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="flex flex-col p-margin-mobile shadow-sm lg:col-span-4 md:p-margin-desktop">
              <h2 className="mb-stack-lg flex items-center gap-2 text-label-sm uppercase tracking-widest text-secondary">
                <MaterialIcon name="ambulance" className="text-[18px]" />
                Assigned Unit
              </h2>
              <div className="mb-stack-lg flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low p-stack-sm">
                <span className="text-headline-md font-bold tracking-widest">{trip.driver?.ambulance?.plateNumber || "Pending Assignment"}</span>
              </div>
              <div className="space-y-stack-md">
                {trip.driver ? (
                  <div className="flex items-center gap-stack-sm">
                    <img src={images.driverAvatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    <div>
                      <div className="text-label-md font-semibold">{trip.driver.user?.fullName || "Assigned Driver"}</div>
                      <div className="text-label-sm text-secondary">
                        {trip.driver.ambulance?.type || "Ambulance"} • {trip.driver.user?.phone || "No phone"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-body-md text-secondary">A driver has not been assigned yet.</p>
                )}
              </div>
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-12">
            <Panel className="flex flex-col p-stack-md shadow-sm lg:col-span-5">
              <h2 className="mb-stack-sm flex items-center gap-2 px-2 pt-2 text-label-sm uppercase tracking-widest text-secondary">
                <MaterialIcon name="route" className="text-[18px]" />
                Transit Route
              </h2>
              <div className="relative mb-stack-md h-48 overflow-hidden rounded-lg border border-outline-variant bg-surface-container">
                <img src={images.tripMap} alt="" className="h-full w-full object-cover opacity-80" />
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M 20 80 Q 50 60 40 40 T 80 20" fill="none" stroke="#af101a" strokeDasharray="4 2" strokeWidth="2" />
                  <circle cx="20" cy="80" r="3" fill="#191c1e" />
                  <circle cx="80" cy="20" r="3" fill="#af101a" />
                </svg>
              </div>
              <div className="flex flex-1 flex-col justify-center px-2">
                <div className="relative pb-stack-lg pl-6">
                  <div className="absolute left-1.5 top-1.5 h-full w-0.5 bg-outline-variant" />
                  <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-on-surface bg-surface" />
                  <div className="mb-0.5 text-label-sm uppercase text-secondary">Pickup Location</div>
                  <div className="text-label-md">{trip.pickupAddress}</div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-primary shadow-sm" />
                  <div className="mb-0.5 text-label-sm uppercase text-secondary">Destination</div>
                  <div className="text-label-md">{trip.hospital?.name || trip.destAddress || "Pending hospital assignment"}</div>
                </div>
              </div>
            </Panel>

            <Panel className="flex flex-col overflow-hidden shadow-sm lg:col-span-7">
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-margin-mobile py-stack-sm">
                <h2 className="flex items-center gap-2 text-label-sm uppercase tracking-widest text-secondary">
                  <MaterialIcon name="monitor_heart" className="text-[18px]" />
                  Medical Summary
                </h2>
                <span className="text-label-sm text-secondary">Last updated: 14:40:00</span>
              </div>
              <div className="flex flex-1 flex-col p-margin-mobile md:p-margin-desktop">
                <div className="mb-stack-lg">
                  <span className="mb-2 block text-label-sm uppercase text-secondary">Chief Complaint</span>
                  <p className="text-body-md">
                    {trip.medicalReport?.suspectedCondition || "No condition has been recorded yet."}
                  </p>
                </div>
                <div className="mb-stack-lg grid grid-cols-2 gap-stack-sm md:grid-cols-4">
                  {trip.medicalReport?.vitalsCheck && typeof trip.medicalReport.vitalsCheck === "object" ? (
                    Object.entries(trip.medicalReport.vitalsCheck).map(([label, value]) => (
                      <div key={label} className="rounded border border-outline-variant bg-surface p-stack-sm">
                        <span className="mb-1 block text-label-sm uppercase text-secondary">{label}</span>
                        <div className="text-label-md font-bold tracking-wider">{String(value)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded border border-outline-variant bg-surface p-stack-sm text-body-md text-secondary">
                      Vitals have not been uploaded for this trip.
                    </div>
                  )}
                </div>
                <div className="mt-auto border-t border-outline-variant pt-stack-md">
                  <span className="mb-2 block text-label-sm uppercase text-secondary">
                    Paramedic Notes &amp; Interventions
                  </span>
                  <div className="max-h-32 overflow-y-auto whitespace-pre-wrap rounded border border-outline-variant bg-surface-container-low p-stack-md text-label-md leading-relaxed text-on-surface-variant">
                    {trip.medicalReport?.paramedicNotes || "No paramedic notes were saved for this trip."}
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}
