import { useState } from "react";
import { Snowflake, Flame, Wind, Minus, Plus, Droplets } from "lucide-react";
import { Panel, Label, SectionHead, TactileButton } from "../primitives";

type Zone = { name: string; current: number; setpoint: number; humidity: number; mode: "Cool" | "Heat" | "Auto" | "Off" };

export default function ClimateView() {
  const [zones, setZones] = useState<Zone[]>([
    { name: "Main Level", current: 72, setpoint: 71, humidity: 42, mode: "Cool" },
    { name: "Upper Level", current: 70, setpoint: 70, humidity: 44, mode: "Cool" },
    { name: "Primary Suite", current: 69, setpoint: 69, humidity: 41, mode: "Cool" },
    { name: "Guest Wing", current: 73, setpoint: 74, humidity: 45, mode: "Auto" },
  ]);
  const [active, setActive] = useState(0);
  const z = zones[active];

  const adjust = (delta: number) => setZones(zs => zs.map((zo, i) => i === active ? { ...zo, setpoint: zo.setpoint + delta } : zo));
  const setMode = (mode: Zone["mode"]) => setZones(zs => zs.map((zo, i) => i === active ? { ...zo, mode } : zo));

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between">
          <div>
            <Label>Climate · Resideo T10 Plus</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">4 zones · all nominal</div>
            <div className="text-[12px] text-foreground-dim mt-1">Outdoor 68° · Forecast clear · System: Cooling</div>
          </div>
          <div className="text-right">
            <div className="mono text-[28px] font-light num">68<span className="text-[14px] text-foreground-dim">°</span></div>
            <Label className="mt-1 block">Outdoor</Label>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        <Panel padding="p-3">
          <Label className="px-2 py-2 block">Zones</Label>
          <ul className="space-y-px">
            {zones.map((zo, i) => (
              <li key={zo.name}>
                <button onClick={() => setActive(i)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-[13px] transition-colors ${
                    i === active
                      ? "bg-surface-raised text-foreground border-l-2 border-odin-accent pl-[10px]"
                      : "text-foreground-dim hover:bg-surface-raised/40"
                  }`}>
                  <div className="text-left">
                    <div>{zo.name}</div>
                    <div className="mono text-[10px] text-foreground-mute mt-0.5 num">{zo.mode.toUpperCase()} · {zo.setpoint}°</div>
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
                <div className="text-[12px] text-foreground-dim mt-1">Currently {z.current}° · {z.mode}</div>
              </div>
              <div className="flex gap-1.5">
                {(["Cool", "Heat", "Auto", "Off"] as const).map(m => (
                  <TactileButton key={m} active={z.mode === m} onClick={() => setMode(m)}>{m}</TactileButton>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-12 py-6">
              <button onClick={() => adjust(-1)} className="btn-tactile w-14 h-14 grid place-items-center">
                <Minus className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <div className="text-center">
                <div className="mono text-[88px] font-extralight leading-none num"
                  style={{ textShadow: "0 0 30px hsl(var(--accent) / 0.2)" }}>
                  {z.setpoint}<span className="text-[40px] text-foreground-dim">°</span>
                </div>
                <Label className="mt-3 block">Setpoint</Label>
              </div>
              <button onClick={() => adjust(1)} className="btn-tactile w-14 h-14 grid place-items-center">
                <Plus className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-hairline">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Droplets className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
                  <Label>Humidity</Label>
                </div>
                <div className="mono text-[20px] num">{z.humidity}<span className="text-[12px] text-foreground-dim ml-1">%</span></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Wind className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
                  <Label>Fan</Label>
                </div>
                <div className="mono text-[20px] num">Auto</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  {z.mode === "Heat" ? <Flame className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} /> : <Snowflake className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />}
                  <Label>Demand</Label>
                </div>
                <div className="mono text-[20px] num">{Math.abs(z.current - z.setpoint) > 0 ? "Active" : "Idle"}</div>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionHead title="24h Trend" meta="ALL ZONES" />
            <div className="h-32 relative">
              <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[20, 50, 80].map(y => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="hsl(var(--hairline))" strokeWidth="0.5" />)}
                <path d="M0,70 C50,60 80,55 120,50 S200,40 240,45 S320,55 400,42 L400,120 L0,120 Z" fill="url(#trendGrad)" />
                <path d="M0,70 C50,60 80,55 120,50 S200,40 240,45 S320,55 400,42" fill="none" stroke="hsl(var(--accent))" strokeWidth="1.2" />
              </svg>
            </div>
            <div className="flex justify-between mono text-[10px] text-foreground-mute mt-2 num">
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
