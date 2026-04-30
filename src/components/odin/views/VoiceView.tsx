import { Mic, Wifi } from "lucide-react";
import { Panel, Label, SectionHead, StatusDot } from "../primitives";
import { useDiscovery } from "@/lib/ha-discovery";

const STATE_COLOR: Record<string, "active" | "idle" | "alert" | "ok"> = {
  listening: "active",
  responding: "active",
  processing: "active",
  idle: "idle",
  unavailable: "alert",
};

export default function VoiceView() {
  const { voiceSatellites } = useDiscovery();

  if (voiceSatellites.length === 0) {
    return (
      <Panel accent>
        <Label>Voice</Label>
        <div className="text-[14px] text-foreground-dim mt-2">
          No voice satellites discovered. Add `assist_satellite.*` entities or
          set them in the mapping file.
        </div>
      </Panel>
    );
  }

  const onlineCount = voiceSatellites.filter(
    (s) => s.state.state !== "unavailable",
  ).length;

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between">
          <div>
            <Label>Voice · Odin Satellites</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">
              {onlineCount} of {voiceSatellites.length} satellites online
            </div>
            <div className="text-[12px] text-foreground-dim mt-1">
              On-premise wake word · Local intent processing · No cloud audio
            </div>
          </div>
          <Mic className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
      </Panel>

      <Panel>
        <SectionHead
          title="Satellites"
          meta={`${voiceSatellites.length} DEVICES`}
        />
        <div className="space-y-4">
          {voiceSatellites.map((s) => {
            const status = STATE_COLOR[s.state.state] ?? "idle";
            const active = status === "active";
            const lastChanged = s.state.last_changed
              ? new Date(s.state.last_changed).toLocaleTimeString("en-US", {
                  hour12: false,
                })
              : "—";
            return (
              <div
                key={s.state.entity_id}
                className="flex items-center gap-4 py-3 border-b border-hairline/60"
              >
                <div className="w-12 h-12 border border-hairline-strong grid place-items-center relative">
                  <Mic
                    className={`w-4 h-4 ${active ? "text-odin-accent" : "text-foreground-dim"}`}
                    strokeWidth={1.5}
                  />
                  {active && (
                    <div
                      className="absolute inset-0 border border-odin-accent"
                      style={{
                        boxShadow:
                          "0 0 16px hsl(var(--accent) / 0.4) inset",
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] truncate">{s.name}</span>
                    <StatusDot state={status} />
                  </div>
                  <div className="mono text-[10px] text-foreground-mute mt-0.5 uppercase">
                    {s.state.state} · since {lastChanged}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Wifi
                      className="w-3 h-3 text-foreground-mute"
                      strokeWidth={1.5}
                    />
                    <span className="mono text-[10px] text-foreground-dim">
                      {s.state.state === "unavailable" ? "OFFLINE" : "LINKED"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
