import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { DashboardShell } from "../../../components/layout/DashboardShell";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { PageError, PageLoader } from "../../../components/ui/PageState";
import { Panel } from "../../../components/ui/Panel";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../services/apiClient";
import { hospitalApi } from "../../../services/appApi";
import { useAuthStore } from "../../../store/useAuthStore";

export default function HospitalProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
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

    // Validate phone format (basic: at least 10 digits)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (draft.phone.trim() && !phoneRegex.test(draft.phone.trim())) {
      toast.error("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    // Validate coordinates
    const latitude = Number(draft.latitude);
    const longitude = Number(draft.longitude);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      toast.error("Latitude must be a number between -90 and 90.");
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      toast.error("Longitude must be a number between -180 and 180.");
      return;
    }

    const beds = Number(draft.availableBeds);
    const icu = Number(draft.icuAvailable);
    const ventilators = Number(draft.ventilators);

    if (isNaN(beds) || beds < 0 || !Number.isInteger(beds)) {
      toast.error("Available beds must be a non-negative whole number.");
      return;
    }

    if (isNaN(icu) || icu < 0 || !Number.isInteger(icu)) {
      toast.error("ICU beds must be a non-negative whole number.");
      return;
    }

    if (isNaN(ventilators) || ventilators < 0 || !Number.isInteger(ventilators)) {
      toast.error("Ventilators must be a non-negative whole number.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await hospitalApi.updateProfile({
        name: draft.name.trim(),
        address: draft.address.trim(),
        phone: draft.phone.trim(),
        latitude,
        longitude,
        availableBeds: beds,
        icuAvailable: icu,
        ventilators,
      });

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
      toast.success("Hospital profile updated.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Could not save hospital profile."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return <PageLoader label="Loading hospital profile..." />;
  }

  if (!profile || !draft) {
    return <PageError actionLabel="Retry" message={error} onAction={() => navigate(0)} />;
  }

  return (
    <DashboardShell
      sideTitle="AmbuSOS Admin"
      sideSubtitle="Hospital Command"
      sideItems={[
        { label: "Dashboard", icon: "dashboard", to: "/hospital/dashboard" },
        { label: "Profile", icon: "local_hospital", to: "/hospital/profile", active: true },
      ]}
      sideCta={<div className="mt-auto flex w-full gap-2"><Button variant="secondary" className="flex-1" onClick={() => setDraft({name: profile.name ?? "", address: profile.address ?? "", phone: profile.phone ?? "", latitude: String(profile.latitude ?? ""), longitude: String(profile.longitude ?? ""), availableBeds: String(profile.availableBeds ?? 0), icuAvailable: String(profile.icuAvailable ?? 0), ventilators: String(profile.ventilators ?? 0)})}>Reset</Button><Button icon="save" className="flex-1" loading={isSaving} onClick={handleSave}>Save Updates</Button></div>}
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

        <div className="mt-8 flex justify-center border-t border-surface-variant pt-6">
          <button
            className="flex items-center gap-2 rounded-lg px-6 py-3 text-label-md text-error transition-colors hover:bg-error/10"
            onClick={handleLogout}
            type="button"
          >
            <MaterialIcon name="logout" />
            Logout / Exit Profile
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
