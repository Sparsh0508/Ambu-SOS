import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getRoleHomePath } from "../../../app/route-config";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { TextField } from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../services/apiClient";
import { useAuthStore } from "../../../store/useAuthStore";

const roles = [
  {
    label: "Patient",
    icon: "personal_injury",
    value: "USER",
    copy: "Request rapid assistance and track EMS.",
  },
  { label: "Driver", icon: "ambulance", value: "DRIVER", copy: "Navigate routes and update unit status." },
  {
    label: "Hospital Admin",
    icon: "local_hospital",
    value: "HOSPITAL_ADMIN",
    copy: "Manage dispatch and hospital resources.",
  },
  { label: "CFR", icon: "medical_services", value: "CFR", copy: "Community First Responder network." },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [selectedRole, setSelectedRole] = useState("USER");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.password) {
      toast.error("Full name, phone, email, and password are required.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      const user = await signup({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        passwordHash: form.password,
        role: selectedRole,
      });

      toast.success("Registration completed successfully.");
      navigate(getRoleHomePath(user?.role ?? selectedRole), { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Registration failed."));
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <div className="flex bg-surface-container-low p-stack-lg md:w-5/12 md:p-[48px]">
        <div className="relative flex h-full w-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-lg shadow-panel md:p-margin-desktop">
          <div className="flex items-center gap-stack-sm">
            <MaterialIcon name="emergency" filled className="text-[32px] text-primary" />
            <span className="text-headline-md font-bold uppercase tracking-tighter text-primary">AmbuSOS</span>
          </div>

          <div className="mt-auto md:mb-auto">
            <h1 className="mb-stack-md text-headline-lg-mobile md:text-headline-lg">Join the Network</h1>
            <p className="max-w-sm text-body-md text-secondary">
              Register to access the unified dispatch and emergency management platform. Select your
              operational role to begin.
            </p>
          </div>

          <div className="mt-auto hidden flex-col gap-stack-sm md:flex">
            <div className="flex items-center gap-stack-sm text-secondary">
              <MaterialIcon name="verified_user" className="text-[20px]" />
              <span className="text-label-sm uppercase">Secure &amp; Encrypted</span>
            </div>
            <div className="flex items-center gap-stack-sm text-secondary">
              <MaterialIcon name="speed" className="text-[20px]" />
              <span className="text-label-sm uppercase">Zero Latency Ops</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-surface-container-lowest p-stack-lg md:w-7/12 md:p-[48px]">
        <div className="mb-stack-lg flex items-center justify-between">
          <span className="text-label-sm uppercase tracking-widest text-secondary">Step 1 of 2</span>
          <Link to="/login" className="text-label-sm uppercase text-primary transition-colors hover:text-primary-container">
            Already registered? Log In
          </Link>
        </div>

        <h2 className="mb-stack-md text-headline-sm">Select Operational Role</h2>
        <div className="mb-stack-lg grid grid-cols-2 gap-stack-sm">
          {roles.map((roleOption) => (
            <button
              key={roleOption.label}
              type="button"
              onClick={() => setSelectedRole(roleOption.value)}
              className={`relative rounded-lg border p-stack-md transition-all ${
                roleOption.value === selectedRole
                  ? "border-2 border-primary bg-primary-container/10"
                  : "border-surface-variant bg-surface hover:bg-surface-container-high"
              }`}
            >
              <MaterialIcon
                name={roleOption.icon}
                filled={roleOption.value === selectedRole}
                className={`mb-stack-sm block text-[28px] ${roleOption.value === selectedRole ? "text-primary" : "text-secondary"}`}
              />
              <div className={`mb-1 text-label-md ${roleOption.value === selectedRole ? "text-primary" : "text-on-surface"}`}>
                {roleOption.label}
              </div>
              <div className="hidden text-label-sm leading-tight text-secondary md:block">{roleOption.copy}</div>
              {roleOption.value === selectedRole ? (
                <div className="absolute right-3 top-3 text-primary">
                  <MaterialIcon name="check_circle" filled className="text-[20px]" />
                </div>
              ) : null}
            </button>
          ))}
        </div>

        <form className="flex flex-1 flex-col gap-stack-md" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
            <TextField
              autoComplete="name"
              disabled={isLoading}
              icon="person"
              id="full-name"
              label="Full Name"
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Jane Doe"
              required
              value={form.fullName}
            />
            <TextField
              autoComplete="tel"
              disabled={isLoading}
              icon="call"
              id="phone"
              label="Phone Number"
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              type="tel"
              value={form.phone}
            />
          </div>
          <TextField
            autoComplete="email"
            disabled={isLoading}
            icon="mail"
            id="email"
            label="Email Address"
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="jane.doe@example.com"
            required
            type="email"
            value={form.email}
          />
          <TextField
            autoComplete="new-password"
            disabled={isLoading}
            id="password"
            label="Password"
            icon="lock"
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="••••••••"
            required
            type="password"
            value={form.password}
            helper="Must be at least 6 characters long."
          />

          <div className="mt-auto pt-stack-lg">
            <Button
              className="w-full py-4 uppercase tracking-wider"
              icon="arrow_forward"
              iconSide="right"
              loading={isLoading}
              type="submit"
            >
              {isLoading ? "Creating Account" : "Continue Registration"}
            </Button>
            <p className="mt-stack-md text-center text-label-sm text-secondary">
              By registering, you agree to the{" "}
              <a className="text-primary hover:underline" href="/">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="text-primary hover:underline" href="/">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
