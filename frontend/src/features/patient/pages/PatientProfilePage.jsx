import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BottomNav } from "../../../components/layout/BottomNav";
import { TopBar } from "../../../components/layout/TopBar";
import { Panel } from "../../../components/ui/Panel";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { PageError, PageLoader } from "../../../components/ui/PageState";
import { TextField } from "../../../components/ui/TextField";
import { getPatientBottomNav, patientData } from "../../../data/appData";
import { getApiErrorMessage } from "../../../services/apiClient";
import { userApi } from "../../../services/appApi";
import { useAuthStore } from "../../../store/useAuthStore";

export default function PatientProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const sessionUser = useAuthStore((state) => state.user);
  const { images } = patientData;
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const allergyItems = useMemo(() => {
    if (!profile?.allergies) {
      return [];
    }

    return String(profile.allergies)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [profile?.allergies]);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      setIsLoading(true);
      setError("");

      try {
        const response = await userApi.getProfile();

        if (!mounted) {
          return;
        }

        setProfile(response.data);
        setDraft({
          fullName: response.data.fullName ?? "",
          email: response.data.email ?? "",
          phone: response.data.phone ?? "",
          bloodType: response.data.bloodType ?? "",
          allergies: response.data.allergies ?? "",
          emergencyContact: response.data.emergencyContact ?? "",
        });
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(getApiErrorMessage(requestError, "Unable to load your profile."));
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

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!draft) {
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (draft.email.trim() && !emailRegex.test(draft.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Validate phone format (basic: at least 10 digits)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (draft.phone.trim() && !phoneRegex.test(draft.phone.trim())) {
      toast.error("Please enter a valid phone number (at least 10 digits).");
      return;
    }

    setIsSaving(true);

    try {
      const response = await userApi.updateProfile({
        fullName: draft.fullName.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        bloodType: draft.bloodType.trim() || null,
        allergies: draft.allergies.trim() || null,
        emergencyContact: draft.emergencyContact.trim() || null,
      });

      setProfile(response.data);
      setDraft({
        fullName: response.data.fullName ?? "",
        email: response.data.email ?? "",
        phone: response.data.phone ?? "",
        bloodType: response.data.bloodType ?? "",
        allergies: response.data.allergies ?? "",
        emergencyContact: response.data.emergencyContact ?? "",
      });
      setIsEditing(false);
      toast.success("Profile updated.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Could not update your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar sticky />
        <PageLoader label="Loading your profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar sticky />
        <PageError actionLabel="Back to Login" message={error} onAction={() => navigate("/login")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopBar sticky />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-stack-lg px-margin-mobile py-stack-lg md:px-margin-desktop">
        <div className="flex flex-col gap-stack-md md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-1 text-headline-lg-mobile md:text-headline-lg">Patient Profile</h1>
            <p className="text-body-md text-secondary">Verified records for active dispatch context.</p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={() => {
                  setDraft({...profile});
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
                <Button icon="save" loading={isSaving} onClick={handleSave}>
                  Save Profile
                </Button>
              </>
            ) : (
              <button
                className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-label-md text-secondary transition-colors hover:bg-surface-container-high"
                onClick={() => setIsEditing(true)}
                type="button"
              >
                <MaterialIcon name="edit" className="text-[18px]" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <Panel className="relative flex flex-col items-center gap-stack-lg overflow-hidden p-stack-md md:flex-row md:items-start md:p-stack-lg">
          <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
          <div
            className="h-24 w-24 shrink-0 rounded-full border-4 border-surface bg-surface-container bg-cover bg-center md:h-32 md:w-32"
            style={{ backgroundImage: `url(${images.patientAvatar})` }}
          />
          <div className="flex w-full flex-1 flex-col items-center text-center md:items-start md:text-left">
            <h2 className="mb-1 text-headline-md">{profile.fullName}</h2>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded border border-surface-variant bg-surface-container px-2 py-1 text-label-md text-secondary">
                ID: {profile.id}
              </span>
              <span className="flex items-center gap-1 rounded bg-tertiary-container/20 px-2 py-1 text-label-md text-tertiary">
                <MaterialIcon name="verified" className="text-[14px]" />
                Validated
              </span>
              <span className="rounded border border-outline-variant bg-surface-container-low px-2 py-1 text-label-md text-secondary">
                {profile.role}
              </span>
            </div>
            <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Email", profile.email],
                ["Phone", profile.phone],
                ["Blood Type", profile.bloodType || "Not set"],
                ["Emergency", profile.emergencyContact || "Not set"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="mb-1 text-label-sm uppercase text-secondary">{label}</span>
                  <span className="text-body-md">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <section className="grid grid-cols-1 gap-stack-md md:grid-cols-3">
          <Panel className="flex flex-col items-center justify-center p-stack-md text-center md:aspect-square">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/10 text-primary">
              <MaterialIcon name="bloodtype" className="text-3xl" />
            </div>
            <span className="mb-1 text-label-sm uppercase text-secondary">Blood Type</span>
            <span className="text-display-lg text-primary">{profile.bloodType || "--"}</span>
            <span className="mt-2 rounded border border-error/30 bg-error/5 px-2 py-0.5 text-label-md text-error">
              {profile.bloodType ? "Medical ID Ready" : "Needs Update"}
            </span>
          </Panel>

          <Panel className="flex flex-col p-stack-md md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <MaterialIcon name="coronavirus" className="text-error" />
              <h3 className="text-headline-sm">Critical Allergies</h3>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              {allergyItems.length ? allergyItems.map((allergy, index) => (
                <div
                  key={allergy}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                    index === 0
                      ? "border-error/20 bg-error-container text-on-error-container"
                      : "border-surface-variant bg-surface-container text-on-surface"
                  }`}
                >
                  <MaterialIcon
                    name={index === 0 ? "vaccines" : index === 1 ? "nutrition" : "medication"}
                    className="text-[18px]"
                  />
                  <span className="text-label-md">{allergy}</span>
                </div>
              )) : <p className="text-body-md text-secondary">No allergies have been added yet.</p>}
            </div>
            <p className="mt-4 text-sm text-secondary">Keep allergy details current so responders can triage safely.</p>
          </Panel>

          <Panel className="p-stack-md md:col-span-3">
            <div className="mb-4 flex items-center gap-2">
              <MaterialIcon name="contact_phone" className="text-primary" />
              <h3 className="text-headline-sm">Emergency Contacts</h3>
            </div>
            <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
              <div className="group flex items-center justify-between rounded-lg border border-surface-variant p-3 transition-colors hover:bg-surface-container-lowest">
                <div className="flex flex-col">
                  <span className="text-label-md text-on-surface transition-colors group-hover:text-primary">
                    {profile.emergencyContact || "No emergency contact added"}
                  </span>
                  <span className="text-label-sm text-secondary">Primary contact for responders</span>
                </div>
                <div className="flex items-center justify-center rounded-full bg-surface-container p-2 transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <MaterialIcon name="call" className="text-[20px]" />
                </div>
              </div>
              <div className="group flex items-center justify-between rounded-lg border border-surface-variant p-3 transition-colors hover:bg-surface-container-lowest">
                <div className="flex flex-col">
                  <span className="text-label-md text-on-surface transition-colors group-hover:text-primary">
                    {profile.email}
                  </span>
                  <span className="text-label-sm text-secondary">Account recovery contact</span>
                </div>
                <div className="flex items-center justify-center rounded-full bg-surface-container p-2 transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
                  <MaterialIcon name="mail" className="text-[20px]" />
                </div>
              </div>
            </div>
          </Panel>
        </section>

        {isEditing && draft ? (
          <Panel className="grid grid-cols-1 gap-stack-md p-stack-md md:grid-cols-2">
            <TextField
              id="profile-full-name"
              icon="person"
              label="Full Name"
              onChange={(event) => updateDraft("fullName", event.target.value)}
              value={draft.fullName}
            />
            <TextField
              id="profile-phone"
              icon="call"
              label="Phone"
              onChange={(event) => updateDraft("phone", event.target.value)}
              value={draft.phone}
            />
            <TextField
              id="profile-email"
              icon="mail"
              label="Email"
              onChange={(event) => updateDraft("email", event.target.value)}
              type="email"
              value={draft.email}
            />
            <TextField
              id="profile-blood-type"
              icon="bloodtype"
              label="Blood Type"
              onChange={(event) => updateDraft("bloodType", event.target.value)}
              value={draft.bloodType}
            />
            <TextField
              className="md:col-span-2"
              id="profile-allergies"
              icon="warning"
              label="Allergies"
              onChange={(event) => updateDraft("allergies", event.target.value)}
              placeholder="Comma separated allergies"
              value={draft.allergies}
            />
            <TextField
              className="md:col-span-2"
              id="profile-emergency-contact"
              icon="contact_phone"
              label="Emergency Contact"
              onChange={(event) => updateDraft("emergencyContact", event.target.value)}
              placeholder="Name and phone number"
              value={draft.emergencyContact}
            />
          </Panel>
        ) : null}

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
      </main>

      <BottomNav items={getPatientBottomNav("Profile")} />
    </div>
  );
}
