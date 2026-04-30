import { useMemo, useState } from "react";
import { Lightbulb, Power, Sun } from "lucide-react";
import { Panel, Label, SectionHead, TactileButton, StatusDot } from "../primitives";
import { useHa } from "@/lib/ha-client";
import { useDiscovery } from "@/lib/ha-discovery";
import { friendly, isOn } from "@/lib/ha-discovery";
import type { HaState } from "@/lib/ha-client";

const FixtureRow = ({
  f,
  onToggle,
  onLevel,
}: {
  f: HaState;
  onToggle: () => void;
  onLevel: (pct: number) => void;
}) => {
  const on = isOn(f);
  const brightness = (f.attributes?.brightness as number) ?? 0;
  const level = on ? Math.round((brightness / 255) * 100) : 0;
  const kelvin = f.attributes?.color_temp_kelvin ?? f.attributes?.min_color_temp_kelvin;

  return (
    <div className="grid grid-cols-[1fr_auto_120px_auto] items-center gap-4 py-3 border-b border-hairline/60">
      <div className="flex items-center gap-3">
        <Lightbulb
          className={`w-3.5 h-3.5 ${on ? "text-odin-accent" : "text-foreground-mute"}`}
          strokeWidth={1.5}
        />
        <span className="text-[13px] truncate">{friendly(f)}</span>
      </div>
      <span className="mono text-[10px] text-foreground-mute num">
        {kelvin ? `${kelvin}K` : "—"}
      </span>
      <div
        className="h-1 bg-surface-inset relative cursor-pointer"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const pct = Math.round(((e.clientX - r.left) / r.width) * 100);
          onLevel(Math.max(0, Math.min(100, pct)));
        }}
      >
        <div
          className="h-full"
          style={{
            width: `${level}%`,
            background: "linear-gradient(90deg, hsl(var(--accent-dim)), hsl(var(--accent)))",
            boxShadow: level > 0 ? "0 0 10px hsl(var(--accent) / 0.5)" : "none",
          }}
        />
      </div>
      <button
        onClick={onToggle}
        className={`btn-tactile w-10 h-7 grid place-items-center ${on ? "active" : ""}`}
      >
        <Power className="w-3 h-3" strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default function LightingView() {
  const { callService } = useHa();
  const { rooms, lights } = useDiscovery();
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);

  // Fall back to single "All" room if no per-room grouping found
  const effectiveRooms = useMemo(() => {
    if (rooms.length === 0 && lights.length > 0) {
      return [{ room: "All Lighting", lights, scenes: [], occupancy: undefined as any, mediaPlayer: undefined as any, switches: [], fans: [], covers: [] }];
    }
    return rooms;
  }, [rooms, lights]);

  const room = effectiveRooms[activeRoomIdx] ?? effectiveRooms[0];
  const totalOn = effectiveRooms.reduce<number>((acc, r) => acc + r.lights.filter(isOn).length, 0);
  const totalFix = effectiveRooms.reduce<number>((acc, r) => acc + r.lights.length, 0);

  if (!room) {
    return (
      <Panel accent>
        <Label>Lighting</Label>
        <div className="text-[14px] text-foreground-dim mt-2">
          No light entities discovered. Check your HA install or add overrides in src/lib/ha-mapping.ts.
        </div>
      </Panel>
    );
  }

  const toggle = (e: HaState) =>
    callService("light", isOn(e) ? "turn_off" : "turn_on", { entity_id: e.entity_id });
  const setLevel = (e: HaState, pct: number) =>
    callService("light", "turn_on", {
      entity_id: e.entity_id,
      brightness_pct: pct,
    });
  const engageScene = (entity_id: string) =>
    callService("scene", "turn_on", { entity_id });

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between mb-1">
          <div>
            <Label>Lighting</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">
              {totalOn} of {totalFix} fixtures engaged
            </div>
            <div className="text-[12px] text-foreground-dim mt-1">
              {effectiveRooms.length} zone{effectiveRooms.length === 1 ? "" : "s"} · live via Home Assistant
            </div>
          </div>
          <Sun className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
      </Panel>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        <Panel padding="p-3">
          <Label className="px-2 py-2 block">Rooms</Label>
          <ul className="space-y-px">
            {effectiveRooms.map((r, i) => {
              const onCount = r.lights.filter(isOn).length;
              return (
                <li key={r.room}>
                  <button
                    onClick={() => setActiveRoomIdx(i)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors ${
                      i === activeRoomIdx
                        ? "bg-surface-raised text-foreground border-l-2 border-odin-accent pl-[10px]"
                        : "text-foreground-dim hover:bg-surface-raised/40"
                    }`}
                  >
                    <StatusDot state={onCount > 0 ? "active" : "idle"} />
                    <span className="flex-1 text-left truncate">{r.room}</span>
                    <span className="mono text-[10px] text-foreground-mute num">
                      {onCount}/{r.lights.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-6">
          {room.scenes.length > 0 && (
            <Panel>
              <SectionHead title={`${room.room} · Scenes`} meta="TAP TO ENGAGE" />
              <div className="flex flex-wrap gap-1.5">
                {room.scenes.map((s) => (
                  <TactileButton key={s.entity} onClick={() => engageScene(s.entity)}>
                    {s.name}
                  </TactileButton>
                ))}
              </div>
            </Panel>
          )}

          <Panel>
            <SectionHead
              title="Fixtures"
              meta={`${room.lights.filter(isOn).length} ENGAGED`}
            />
            <div>
              {room.lights.map((f) => (
                <FixtureRow
                  key={f.entity_id}
                  f={f}
                  onToggle={() => toggle(f)}
                  onLevel={(pct) => setLevel(f, pct)}
                />
              ))}
              {room.lights.length === 0 && (
                <div className="text-[12px] text-foreground-mute py-6 text-center">
                  No fixtures in this zone.
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
