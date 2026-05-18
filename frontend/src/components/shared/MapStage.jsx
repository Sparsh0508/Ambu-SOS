import { cn } from "../../lib/utils";

export function MapStage({
  className = "",
  image,
  imageClassName = "",
  tone = "light",
  children,
  overlayClassName = "",
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        tone === "dark" ? "map-grid-dark bg-inverse-surface" : "map-grid-light bg-surface-container",
        className,
      )}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className={cn("absolute inset-0 h-full w-full object-cover", imageClassName)}
        />
      ) : null}
      <div className={cn("absolute inset-0", overlayClassName)} />
      {children}
    </div>
  );
}
