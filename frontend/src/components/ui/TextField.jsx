import { cn } from "../../lib/utils";
import { MaterialIcon } from "./MaterialIcon";

export function TextField({
  id,
  label,
  placeholder,
  icon,
  type = "text",
  helper,
  action,
  className = "",
  inputClassName = "",
  error,
  value,
  onChange,
  name,
  disabled = false,
  required = false,
  autoComplete,
  rows,
}) {
  const Component = type === "textarea" ? "textarea" : "input";

  return (
    <label className={cn("flex flex-col gap-unit", className)} htmlFor={id}>
      {label ? <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</span> : null}
      <div className="relative">
        {icon ? (
          <MaterialIcon
            name={icon}
            className={cn(
              "pointer-events-none absolute left-3 text-[20px] text-secondary",
              type === "textarea" ? "top-3" : "top-1/2 -translate-y-1/2",
            )}
          />
        ) : null}
        <Component
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          rows={rows}
          className={cn(
            "w-full rounded-lg border bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition-shadow focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-surface-container-low",
            error ? "border-error" : "border-surface-variant",
            icon && "pl-10",
            action && "pr-12",
            type === "textarea" && "min-h-28 resize-y",
            inputClassName,
          )}
        />
        {action}
      </div>
      {error ? <span className="text-label-sm text-error">{error}</span> : null}
      {!error && helper ? <span className="text-label-sm text-secondary">{helper}</span> : null}
    </label>
  );
}
