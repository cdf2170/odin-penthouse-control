import { Mic, Wifi } from "lucide-react";
import { Panel, Label, SectionHead, StatusDot } from "../primitives";

const sats = [
  { name: "Odin Voice — Living Room", state: "Listening", status: "active" as const, signal: "Excellent", uptime: "14d 02h", lastWake: "Just now" },
  { name: "Odin Voice — Office", state: "Standby", status: "idle" as const, signal: "Excellent", uptime: "14d 02h", lastWake: "2h 14m ago" },
  { name: "Odin Voice — Kitchen", state: "Standby", status: "idle" as const, signal: "Good", uptime: "9d 18h", lastWake: "5h ago" },
  { name: "Odin Voice — Primary Suite", state: "Muted", status: "idle" as const, signal: "Excellent", uptime: "14d 02h", lastWake: "Yesterday" },
];

const intents = [
  { t: "Just now", room: "Living Room", q: "Set the lights to evening", r: "Scene engaged · Living Room" },
  { t: "12m ago", room: "Living Room", q: "What's the temperature in the bedroom", r: "69 degrees" },
  { t: "1h 02m", room: "Office", q: "Play Arvo Pärt in the main group", r: "Playing on Sonos · Main" },
  { t: "2h 18m", room: "Kitchen", q: "Lock the front door", r: "Front door locked" },
  { t: "3h 41m", room: "Living Room", q: "Goodnight", r: "Goodnight scene engaged" },
];

export default function VoiceView() {
  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between">
          <div>
            <Label>Voice · Odin Satellites</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">4 satellites online</div>
            <div className="text-[12px] text-foreground-dim mt-1">On-premise wake word · Local intent processing · No cloud audio</div>
          </div>
          <Mic className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
      </Panel>

      <div className="grid grid-cols-[1fr_1fr] gap-6">
        <Panel>
          <SectionHead title="Satellites" meta="4 DEVICES" />
          <div className="space-y-4">
            {sats.map(s => (
              <div key={s.name} className="flex items-center gap-4 py-3 border-b border-hairline/60">
                <div className="w-12 h-12 border border-hairline-strong grid place-items-center relative">
                  <Mic className={`w-4 h-4 ${s.status === "active" ? "text-odin-accent" : "text-foreground-dim"}`} strokeWidth={1.5} />
                  {s.status === "active" && (
                    <div className="absolute inset-0 border border-odin-accent" style={{ boxShadow: "0 0 16px hsl(var(--accent) / 0.4) inset" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] truncate">{s.name}</span>
                    <StatusDot state={s.status} />
                  </div>
                  <div className="mono text-[10px] text-foreground-mute mt-0.5">
                    {s.state.toUpperCase()} · {s.lastWake.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Wifi className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
                    <span className="mono text-[10px] text-foreground-dim">{s.signal.toUpperCase()}</span>
                  </div>
                  <div className="mono text-[10px] text-foreground-mute mt-1 num">UP {s.uptime}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Recent Intents" meta="LAST 24H" />
          <ul className="space-y-4">
            {intents.map((it, i) => (
              <li key={i} className="border-b border-hairline/60 pb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="mono text-[10px] text-foreground-mute uppercase tracking-[0.14em]">{it.room}</span>
                  <span className="mono text-[10px] text-foreground-mute num">{it.t}</span>
                </div>
                <div className="text-[13px] text-foreground">"{it.q}"</div>
                <div className="text-[11px] text-odin-accent mt-1.5 mono uppercase tracking-[0.12em]">→ {it.r}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
