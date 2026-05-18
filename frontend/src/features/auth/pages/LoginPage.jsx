import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getRoleHomePath } from "../../../app/route-config";
import { Button } from "../../../components/ui/Button";
import { MaterialIcon } from "../../../components/ui/MaterialIcon";
import { TextField } from "../../../components/ui/TextField";
import { marketingData } from "../../../data/appData";
import { getApiErrorMessage } from "../../../services/apiClient";
import { useAuthStore } from "../../../store/useAuthStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const fromPath = useMemo(() => location.state?.from?.pathname, [location.state]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      const user = await login({
        email: form.email.trim(),
        passwordHash: form.password,
      });

      toast.success("Login successful.");
      navigate(fromPath || getRoleHomePath(user?.role), { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid email or password."));
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <div className="relative hidden w-[55%] overflow-hidden border-r border-outline-variant bg-inverse-surface lg:flex">
        <img
          src={marketingData.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/40 to-transparent" />
        <div className="relative z-10 flex h-full w-full max-w-3xl flex-col justify-end p-margin-desktop text-on-primary">
          <div className="mb-stack-lg inline-flex items-center gap-stack-sm rounded border border-surface-variant/30 bg-surface/10 p-stack-sm backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-fixed opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="text-label-md uppercase tracking-wider">System Live: Sector 7</span>
          </div>
          <MaterialIcon name="emergency" filled className="mb-stack-md text-[64px] text-primary" />
          <h1 className="mb-stack-sm text-display-lg tracking-tighter">AmbuSOS Command</h1>
          <p className="max-w-xl border-l-4 border-primary pl-stack-md text-body-lg text-inverse-on-surface">
            Mission-critical resource coordination and real-time incident management platform.
            Authorized dispatchers and medical personnel only.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface px-margin-mobile py-10 sm:px-margin-desktop lg:px-24">
        <div className="w-full max-w-[420px] space-y-stack-lg">
          <div className="flex items-center gap-stack-sm border-b border-outline-variant pb-stack-md lg:hidden">
            <MaterialIcon name="emergency" filled className="text-[32px] text-primary" />
            <span className="text-headline-lg-mobile font-bold uppercase tracking-tighter">AmbuSOS</span>
          </div>

          <div className="space-y-stack-sm">
            <div className="mb-stack-sm flex flex-wrap items-center gap-stack-sm">
              <span className="inline-flex items-center gap-unit rounded border border-outline-variant bg-surface-container-high px-2 py-1">
                <MaterialIcon name="lock" className="text-[14px] text-tertiary" />
                <span className="text-label-sm uppercase tracking-wider">Secure Portal</span>
              </span>
              <span className="inline-flex items-center gap-unit rounded border border-outline bg-surface-container-lowest px-2 py-1">
                <MaterialIcon name="visibility" className="text-[14px] text-secondary" />
                <span className="text-label-sm uppercase tracking-wider text-secondary">Monitored Session</span>
              </span>
            </div>
            <h2 className="text-headline-lg tracking-tight">Operator Login</h2>
            <p className="text-body-md text-secondary">
              Enter your assigned credentials to access the operational dashboard.
            </p>
          </div>

          <form className="space-y-stack-lg" onSubmit={handleSubmit}>
            <TextField
              id="operator-id"
              autoComplete="email"
              disabled={isLoading}
              icon="badge"
              label="Operator ID"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="ID-Number or Email"
              required
              type="email"
              value={form.email}
            />
            <div className="space-y-unit">
              <div className="flex items-end justify-between">
                <span className="text-label-md uppercase tracking-widest text-on-surface">Passcode</span>
                <button
                  type="button"
                  className="text-label-sm text-secondary underline decoration-outline-variant underline-offset-2 hover:text-primary transition-colors"
                  onClick={() => {
                    updateField("password", "");
                    toast.info("Passcode cleared. Contact system administrator for full reset.");
                  }}
                >
                  Reset Access
                </button>
              </div>
              <TextField
                id="passcode"
                autoComplete="current-password"
                disabled={isLoading}
                label=""
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="••••••••••••"
                required
                type="password"
                value={form.password}
              />
            </div>

            <div className="flex items-start gap-stack-sm rounded-r border-l-2 border-primary bg-surface-container p-stack-sm">
              <MaterialIcon name="policy" className="mt-0.5 text-[20px] text-secondary" />
              <p className="text-label-sm leading-relaxed text-secondary">
                Unauthorized access is strictly prohibited. All activities are logged and subject to
                audit in accordance with regional medical data compliance protocols.
              </p>
            </div>

            <Button
              className="mt-stack-sm w-full py-4 uppercase tracking-widest"
              icon="arrow_forward"
              iconSide="right"
              loading={isLoading}
              type="submit"
            >
              {isLoading ? "Initiating Session" : "Initiate Session"}
            </Button>
          </form>

          <div className="flex items-center justify-between border-t border-outline-variant pt-stack-md">
            <a className="flex items-center gap-unit text-label-sm text-secondary hover:text-on-surface" href="/">
              <MaterialIcon name="headset_mic" className="text-[16px]" />
              Dispatch Support
            </a>
            <div className="flex items-center gap-unit text-label-sm text-secondary">
              System Status:
              <span className="flex items-center gap-1 text-tertiary">
                <MaterialIcon name="check_circle" className="text-[14px]" />
                Nominal
              </span>
            </div>
          </div>

          <p className="text-label-sm text-secondary">
            Need access provisioning?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register here
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
