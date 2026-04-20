import { useEffect } from "react";
import "./AuthToast.css";

export default function AuthToast({ message, onClose }) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      onClose?.();
    }, 4500);

    return () => clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div className="sb-auth-toast" role="alert" aria-live="assertive">
      <div className="sb-auth-toast__icon" aria-hidden="true">
        !
      </div>
      <div className="sb-auth-toast__content">
        <div className="sb-auth-toast__title">Action Needed</div>
        <div className="sb-auth-toast__message">{message}</div>
      </div>
      <button
        type="button"
        className="sb-auth-toast__close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
