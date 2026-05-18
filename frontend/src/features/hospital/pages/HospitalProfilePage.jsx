import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Button } from "../../../components/ui/Button";
import { PageError, PageLoader } from "../../../components/ui/PageState";
import { Panel } from "../../../components/ui/Panel";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../services/apiClient";
import { hospitalApi } from "../../../services/appApi";

export default function HospitalProfilePage() {
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const response = await hospitalApi.getProfile();

        if (!mounted) {
          return;
        }

        setProfile(response.data);
        setDraft({
          name: response.data.name ?? "",
          address: response.data.address ?? "",
          phone: response.data.phone ?? "",
          latitude: String(response.data.latitude ?? ""),
          longitude: String(response.data.longitude ?? ""),
          availableBeds: String(response.data.availableBeds ?? 0),
          icuAvailable: String(response.data.icuAvailable ?? 0),
          ventilators: String(response.data.ventilators ?? 0),
        });
      } catch (requestError) {
        if (mounted) {
          setError(getApiErrorMessage(requestError, "Unable to load hospital profile."));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await hospitalApi.updateProfile({
        name: draft.name.trim(),
        address: draft.address.trim(),
        phone: draft.phone.trim(),
        latitude: Number(draft.latitude),
        longitude: Number(draft.longitude),
        availableBeds: Number(draft.availableBeds),
        icuAvailable: Number(draft.icuAvailable),
        ventilators: Number(draft.ventilators),
      });

      setProfile(response.data);
      toast.success("Hospital profile updated.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Could not save hospital profile."));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <PageLoader label="Loading hospital profile..." />;
  }

  if (!profile || !draft) {
    return <PageError actionLabel="Retry" message={error} onAction={() => window.location.reload()} />;
  }

  return (
    <DashboardShell
      sideTitle="AmbuSOS Admin"
      sideSubtitle="Hospital Command"
      sideItems={[
        { label: "Dashboard", icon: "dashboard", to: "/hospital/dashboard" },
        { label: "Profile", icon: "local_hospital", to: "/hospital/profile", active: true },
      ]}
      sideCta={<Button className="mt-auto w-full" icon="save" loading={isSaving} onClick={handleSave}>Save Updates</Button>}
      bottomItems={[
        { label: "Dashboard", icon: "dashboard", to: "/hospital/dashboard" },
        { label: "Profile", icon: "local_hospital", to: "/hospital/profile", active: true },
      ]}
      mainClassName="min-h-screen bg-background p-margin-mobile pb-24 md:p-margin-desktop"
    >
      <div className="mx-auto max-w-screen-panel space-y-stack-lg">
        <div>
          <h1 className="text-headline-lg-mobile md:text-headline-lg">Hospital Profile</h1>
          <p className="text-body-md text-secondary">Manage routing, address, and live capacity for your facility.</p>
        </div>

        <div className="grid grid-cols-1 gap-stack-lg lg:grid-cols-12">
          <Panel className="grid gap-stack-md p-stack-md lg:col-span-7">
            <TextField id="hospital-name" label="Hospital Name" onChange={(event) => updateField("name", event.target.value)} value={draft.name} />
            <TextField id="hospital-address" label="Address" onChange={(event) => updateField("address", event.target.value)} value={draft.address} />
            <TextField id="hospital-phone" label="Phone" onChange={(event) => updateField("phone", event.target.value)} value={draft.phone} />
            <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
              <TextField id="hospital-latitude" label="Latitude" onChange={(event) => updateField("latitude", event.target.value)} value={draft.latitude} />
              <TextField id="hospital-longitude" label="Longitude" onChange={(event) => updateField("longitude", event.target.value)} value={draft.longitude} />
            </div>
          </Panel>

          <Panel className="grid gap-stack-md p-stack-md lg:col-span-5">
            <TextField id="available-beds" label="Available Beds" onChange={(event) => updateField("availableBeds", event.target.value)} value={draft.availableBeds} />
            <TextField id="icu-available" label="ICU Beds" onChange={(event) => updateField("icuAvailable", event.target.value)} value={draft.icuAvailable} />
            <TextField id="ventilators" label="Ventilators" onChange={(event) => updateField("ventilators", event.target.value)} value={draft.ventilators} />

            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-label-sm uppercase tracking-wider text-secondary">Current Snapshot</p>
              <p className="mt-2 text-body-md">{profile.name}</p>
              <p className="mt-1 text-label-sm text-secondary">{profile.address}</p>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
