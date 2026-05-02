import { forwardRef, ReactNode } from "react";

export const Hairline = forwardRef<HTMLDivElement, { className?: string }>(
  ({ className = "" }, ref) => <div ref={ref} className={`h-px w-full bg-hairline ${className}`} />
);
Hairline.displayName = "Hairline";

export const Label = forwardRef<HTMLSpanElement, { children: ReactNode; className?: string }>(
  ({ children, className = "" }, ref) => (
    <span ref={ref} className={`label ${className}`}>{children}</span>
  )
);
Label.displayName = "Label";

export type DotState = "active" | "idle" | "alert" | "ok" | "info" | "warn";
export const StatusDot = forwardRef<HTMLSpanElement, { state?: DotState }>(
  ({ state = "idle" }, ref) => {
    const color = {
      active: "text-odin-accent",
      idle: "text-odin-idle",
      alert: "text-odin-alert",
      ok: "text-odin-ok",
      info: "text-odin-info",
      warn: "text-odin-accent",
    }[state];
    return <span ref={ref} className={`dot ${color}`} />;
  }
);
StatusDot.displayName = "StatusDot";

export const Panel = ({
  children, accent = false, className = "", padding = "p-5",
}: { children: ReactNode; accent?: boolean; className?: string; padding?: string }) => (
  <div className={`panel ${accent ? "panel-accent" : ""} ${padding} ${className}`}>{children}</div>
);

export const SectionHead = ({ title, meta }: { title: string; meta?: string }) => (
  <div className="flex items-center justify-between mb-4">
    <Label>{title}</Label>
    {meta && <span className="mono text-[10px] text-foreground-mute">{meta}</span>}
  </div>
);

export const TactileButton = ({
  children, active = false, onClick, className = "",
}: { children: ReactNode; active?: boolean; onClick?: () => void; className?: string }) => (
  <button
    onClick={onClick}
    className={`btn-tactile px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase ${active ? "active" : "text-foreground-dim"} ${className}`}
  >
    {children}
  </button>
);
