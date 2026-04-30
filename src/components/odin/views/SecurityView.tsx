import { useState } from "react";
import { Lock, Unlock, Shield, DoorClosed, Activity, AlertTriangle } from "lucide-react";
import { Panel, Label, SectionHead, TactileButton, StatusDot } from "../primitives";

const sensors = [
  { zone: "Perimeter", items: [
    { name: "Front Door", state: "Closed", icon: DoorClosed, status: "ok" as const },
    { name: "Garage Pedestrian", state: "Closed", icon: DoorClosed, status: "ok" as const },
    { name: "Patio Slider", state: "Closed", icon: DoorClosed, status: "ok" as const },
    { name: "Side Gate", state: "Closed", icon: DoorClosed, status: "ok" as const },
    { name: "Mudroom Door", state: "Closed", icon: DoorClosed, status: "ok" as const },
  ]},
  { zone: "Interior Motion", items: [
    { name: "Foyer", state: "Clear", icon: Activity, status: "idle" as const },
    { name: "Hallway", state: "Active", icon: Activity, status: "active" as const },
    { name: "Mudroom", state: "Clear", icon: Activity, status: "idle" as const },
    { name: "Office", state: "Clear", icon: Activity, status: "idle" as const },
    { name: "Stairs", state: "Clear", icon: Activity, status: "idle" as const },
  ]},
  { zone: "Windows", items: [
    { name: "Living — North", state: "Closed", icon: DoorClosed, status: "ok" as const },
    { name: "Living — East", state: "Closed", icon: DoorClosed, status: "ok" as const },
    { name: "Kitchen — West", state: "Closed", icon: DoorClosed, status: "ok" as const },
    { name: "Primary Suite", state: "Closed", icon: DoorClosed, status: "ok" as const },
  ]},
];

const events = [
  { t: "18:42", e: "Front Door · closed", who: "Manual" },
  { t: "18:38", e: "Driveway camera · vehicle detected", who: "Auto" },
  { t: "17:21", e: "Hallway motion · cleared", who: "Auto" },
  { t: "16:10", e: "System armed · Stay", who: "Lina B." },
  { t: "14:55", e: "Side Gate · closed", who: "Manual" },
  { t: "12:02", e: "Patio Slider · opened", who: "Manual" },
];

export default function SecurityView() {
  const [armState, setArmState] = useState<"Disarmed" | "Stay" | "Away" | "Night">("Stay");

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between mb-5">
          <div>
            <Label>Security</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em] flex items-center gap-3">
              {armState === "Disarmed" ? <Unlock className="w-5 h-5 text-foreground-dim" strokeWidth={1.5} /> : <Lock className="w-5 h-5 text-odin-ok" strokeWidth={1.5} />}
              System {armState}
            </div>
            <div className="text-[12px] text-foreground-dim mt-1">14 sensors monitored · Aqara mesh · Last event 18:42</div>
          </div>
          <Shield className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
        <div className="flex gap-1.5">
          {(["Disarmed", "Stay", "Night", "Away"] as const).map(m => (
            <TactileButton key={m} active={armState === m} onClick={() => setArmState(m)} className="!px-5 !py-2.5">{m}</TactileButton>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {sensors.map(group => (
            <Panel key={group.zone}>
              <SectionHead title={group.zone} meta={`${group.items.length} SENSORS`} />
              <div className="grid grid-cols-2 gap-x-6">
                {group.items.map(s => (
                  <div key={s.name} className="flex items-center gap-3 py-2.5 border-b border-hairline/60">
                    <s.icon className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
                    <span className="text-[13px] flex-1">{s.name}</span>
                    <StatusDot state={s.status} />
                    <span className="mono text-[10px] text-foreground-dim w-14 text-right">{s.state.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>

        <Panel>
          <SectionHead title="Event Log" meta="LAST 24H" />
          <ul className="space-y-3">
            {events.map((e, i) => (
              <li key={i} className="border-b border-hairline/60 pb-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="mono text-[11px] text-foreground-mute num">{e.t}</span>
                  <span className="mono text-[10px] text-foreground-mute uppercase">{e.who}</span>
                </div>
                <div className="text-[12px] text-foreground-dim">{e.e}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
