import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Button } from "../../../components/ui/Button";
import { PageError, PageLoader } from "../../../components/ui/PageState";
import { Panel } from "../../../components/ui/Panel";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { formatDateTime } from "../../../lib/formatters";
import { getApiErrorMessage } from "../../../services/apiClient";
import { hospitalApi } from "../../../services/appApi";

export default function IncomingPatientPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchTrip() {
      try {
        const response = await hospitalApi.getTrip(tripId);

        if (mounted) {
          setTrip(response.data);
        }
      } catch (requestError) {
        if (mounted) {
          setError(getApiErrorMessage(requestError, "Unable to load patient intake details."));
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

  if (isLoading) {
    return <PageLoader label="Loading patient intake..." />;
  }

  if (!trip) {
    return <PageError actionLabel="Back to Dashboard" message={error} onAction={() => navigate("/hospital/dashboard")} />;
  }

  return (
    <DashboardShell
      sideTitle="AmbuSOS Admin"
      sideSubtitle="Hospital Command"
      sideItems={[
        { label: "Dashboard", icon: "dashboard", to: "/hospital/dashboard" },
        { label: "Profile", icon: "local_hospital", to: "/hospital/profile" },
      ]}
      bottomItems={[
        { label: "Dashboard", icon: "dashboard", to: "/hospital/dashboard" },
        { label: "Profile", icon: "local_hospital", to: "/hospital/profile" },
      ]}
      mainClassName="min-h-screen bg-background p-margin-mobile pb-24 md:p-margin-desktop"
    >
      <div className="mx-auto max-w-screen-panel space-y-stack-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-sm uppercase tracking-wider text-secondary">Live Intake</p>
            <h1 className="mt-1 text-headline-lg-mobile md:text-headline-lg">Patient Arrival Detail</h1>
          </div>
          <Button icon="arrow_back" onClick={() => navigate("/hospital/dashboard")} variant="secondary">
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-12">
          <Panel className="p-stack-md lg:col-span-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary-container p-3 text-on-primary-container">
                <MaterialIcon name="personal_injury" filled />
              </div>
              <div>
                <h2 className="text-headline-sm">{trip.passenger?.fullName || "Unknown Patient"}</h2>
                <p className="text-body-md text-secondary">{trip.passenger?.phone || "No phone on record"}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-label-sm uppercase tracking-wider text-secondary">Pickup Address</p>
                <p className="mt-1 text-body-md">{trip.pickupAddress}</p>
              </div>
              <div>
                <p className="text-label-sm uppercase tracking-wider text-secondary">Requested At</p>
                <p className="mt-1 text-body-md">{formatDateTime(trip.requestedAt)}</p>
              </div>
              <div>
                <p className="text-label-sm uppercase tracking-wider text-secondary">Driver</p>
                <p className="mt-1 text-body-md">{trip.driver?.user?.fullName || "Not assigned"}</p>
              </div>
              <div>
                <p className="text-label-sm uppercase tracking-wider text-secondary">Ambulance</p>
                <p className="mt-1 text-body-md">{trip.driver?.ambulance?.plateNumber || "Pending"}</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-stack-md lg:col-span-5">
            <p className="text-label-sm uppercase tracking-wider text-secondary">Clinical Snapshot</p>
            <h2 className="mt-2 text-headline-sm">{trip.medicalReport?.suspectedCondition || "Emergency Intake"}</h2>
            <p className="mt-3 text-body-md text-secondary">{trip.medicalReport?.paramedicNotes || "No paramedic notes shared yet."}</p>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-label-sm uppercase tracking-wider text-secondary">Severity</p>
                <p className="mt-1 text-body-md">{trip.medicalReport?.severity || "Pending"}</p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-label-sm uppercase tracking-wider text-secondary">Vitals</p>
                <pre className="mt-2 whitespace-pre-wrap text-label-sm text-on-surface-variant">
                  {trip.medicalReport?.vitalsCheck ? JSON.stringify(trip.medicalReport.vitalsCheck, null, 2) : "No vitals uploaded"}
                </pre>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
