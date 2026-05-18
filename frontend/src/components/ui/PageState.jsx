import { Button } from "./Button";
import { MaterialIcon } from "./MaterialIcon";

export function PageLoader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface px-5 py-4 shadow-sm">
        <div className="h-3 w-3 animate-soft-pulse rounded-full bg-primary" />
        <span className="text-body-md text-on-surface">{label}</span>
      </div>
    </div>
  );
}

export function PageError({ title = "Something went wrong", message, actionLabel, onAction }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-4">
      <div className="max-w-lg rounded-2xl border border-error/20 bg-surface p-6 shadow-panel">
        <div className="mb-4 flex items-center gap-3 text-error">
          <MaterialIcon name="error" filled />
          <h2 className="text-headline-sm">{title}</h2>
        </div>
        <p className="text-body-md text-on-surface-variant">{message}</p>
        {actionLabel && onAction ? (
          <Button className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({ title, message, actionLabel, onAction, icon = "inbox" }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center px-4">
      <div className="max-w-xl rounded-2xl border border-outline-variant bg-surface p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-primary">
          <MaterialIcon name={icon} filled />
        </div>
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">{message}</p>
        {actionLabel && onAction ? (
          <Button className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
