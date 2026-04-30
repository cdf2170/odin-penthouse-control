import { useMemo, useState } from "react";
import { Snowflake, Flame, Wind, Minus, Plus, Droplets } from "lucide-react";
import { Panel, Label, SectionHead, TactileButton } from "../primitives";
import { useHa } from "@/lib/ha-client";
import { useDiscovery } from "@/lib/ha-discovery";

const MODE_LABEL: Record<string, "Cool" | "Heat" | "Auto" | "Off"> = {
  cool: "Cool",
  heat: "Heat",
  heat_cool: "Auto",
  auto: "Auto",
  off: "Off",
};
const MODE_TO_HA: Record<string, string> = {
  Cool: "cool",
  Heat: "heat",
  Auto: "heat_cool",
  Off: "off",
};

export default function ClimateView() {
  const { callService } = useHa();
  const { climateZones } = useDiscovery();
  const [active, setActive] = useState(0);

  const zones = useMemo(
    () =>
      climateZones.map((z) => {
        const a = z.state.attributes ?? {};
        const setpoint =
          (a.temperature as number) ??
          (a.target_temp_high as number) ??
          (a.target_temp_low as number) ??
          0;
        return {
          name: z.name,
          entity: z.state.entity_id,
          current: (a.current_temperature as number) ?? 0,
          setpoint,
          humidity: (a.current_humidity as number) ?? 0,
          mode: MODE_LABEL[z.state.state] ?? "Off",
          fan: (a.fan_mode as string) ?? "Auto",
          unit: (a.temperature_unit as string) ?? "°",
        };
      }),
    [climateZones],
  );

  if (zones.length === 0) {
    return (
      <Panel accent>
        <Label>Climate</Label>
        <div className="text-[14px] text-foreground-dim mt-2">
          No climate entities discovered.
        </div>
      </Panel>
    );
  }

  const z = zones[Math.min(active, zones.length - 1)];

  const adjust = (delta: number) =>
    callService("climate", "set_temperature", {
      entity_id: z.entity,
      temperature: z.setpoint + delta,
    });
  const setMode = (mode: "Cool" | "Heat" | "Auto" | "Off") =>
    callService("climate", "set_hvac_mode", {
      entity_id: z.entity,
      hvac_mode: MODE_TO_HA[mode],
    });

  const allNominal = zones.every((zo) => Math.abs(zo.current - zo.setpoint) <= 1);

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between">
          <div>
            <Label>Climate · live</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">
              {zones.length} zone{zones.length === 1 ? "" : "s"} ·{" "}
              {allNominal ? "all nominal" : "adjusting"}
            </div>
            <div className="text-[12px] text-foreground-dim mt-1">
              Live via Home Assistant
            </div>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        <Panel padding="p-3">
          <Label className="px-2 py-2 block">Zones</Label>
          <ul className="space-y-px">
            {zones.map((zo, i) => (
              <li key={zo.entity}>
                <button
                  onClick={() => setActive(i)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-[13px] transition-colors ${
                    i === active
                      ? "bg-surface-raised text-foreground border-l-2 border-odin-accent pl-[10px]"
                      : "text-foreground-dim hover:bg-surface-raised/40"
                  }`}
                >
                  <div className="text-left">
                    <div className="truncate">{zo.name}</div>
                    <div className="mono text-[10px] text-foreground-mute mt-0.5 num">
                      {zo.mode.toUpperCase()} · {zo.setpoint}°
                    </div>
                  </div>
                  <span className="mono text-[14px] num">{zo.current}°</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel padding="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Label>Setpoint · {z.name}</Label>
                <div className="text-[12px] text-foreground-dim mt-1">
                  Currently {z.current}° · {z.mode}
                </div>
              </div>
              <div className="flex gap-1.5">
                {(["Cool", "Heat", "Auto", "Off"] as const).map((m) => (
                  <TactileButton
                    key={m}
                    active={z.mode === m}
                    onClick={() => setMode(m)}
                  >
                    {m}
                  </TactileButton>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-12 py-6">
              <button
                onClick={() => adjust(-1)}
                className="btn-tactile w-14 h-14 grid place-items-center"
              >
                <Minus className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <div className="text-center">
                <div
                  className="mono text-[88px] font-extralight leading-none num"
                  style={{ textShadow: "0 0 30px hsl(var(--accent) / 0.2)" }}
                >
                  {z.setpoint}
                  <span className="text-[40px] text-foreground-dim">°</span>
                </div>
                <Label className="mt-3 block">Setpoint</Label>
              </div>
              <button
                onClick={() => adjust(1)}
                className="btn-tactile w-14 h-14 grid place-items-center"
              >
                <Plus className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-hairline">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Droplets className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
                  <Label>Humidity</Label>
                </div>
                <div className="mono text-[20px] num">
                  {z.humidity}
                  <span className="text-[12px] text-foreground-dim ml-1">%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Wind className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
                  <Label>Fan</Label>
                </div>
                <div className="mono text-[20px] num capitalize">{z.fan}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {z.mode === "Heat" ? (
                    <Flame className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
                  ) : (
                    <Snowflake className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
                  )}
                  <Label>Demand</Label>
                </div>
                <div className="mono text-[20px] num">
                  {Math.abs(z.current - z.setpoint) > 0.5 ? "Active" : "Idle"}
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
