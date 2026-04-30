import { useEffect, useState } from "react";
import {
  Activity, AirVent, Bell, ChevronRight, DoorClosed, Fingerprint, Flame,
  Gauge, Home, Lightbulb, Lock, Mic, Music2, Pause, Play, Power,
  Settings, Shield, SkipBack, SkipForward, Snowflake, Sun, Thermometer,
  Video, Volume2, Wind, Car
} from "lucide-react";
import doorbellFeed from "@/assets/doorbell-feed.jpg";

/* ——— atomic primitives ——— */

const Hairline = ({ className = "" }: { className?: string }) => (
  <div className={`h-px w-full bg-hairline ${className}`} />
);

const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`label ${className}`}>{children}</span>
);

const StatusDot = ({
  state = "idle",
}: { state?: "active" | "idle" | "alert" | "ok" }) => {
  const color = {
    active: "text-odin-accent",
    idle: "text-odin-idle",
    alert: "text-odin-alert",
    ok: "text-odin-ok",
  }[state];
  return <span className={`dot ${color}`} />;
};

/* ——— left rail ——— */

const navItems = [
  { icon: Home, label: "Overview", active: true },
  { icon: Lightbulb, label: "Lighting" },
  { icon: Thermometer, label: "Climate" },
  { icon: Shield, label: "Security" },
  { icon: Music2, label: "Audio" },
  { icon: Video, label: "Cameras" },
  { icon: Mic, label: "Voice" },
];

const LeftRail = () => (
  <aside className="w-[232px] shrink-0 border-r border-hairline bg-surface-inset/60 flex flex-col">
    <div className="px-6 pt-7 pb-8">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 grid place-items-center border border-hairline-strong relative">
          <div className="w-1.5 h-1.5 bg-odin-accent" style={{ boxShadow: "0 0 10px hsl(var(--accent))" }} />
        </div>
        <div>
          <div className="text-[15px] font-semibold tracking-[0.2em] leading-none">ODIN</div>
          <div className="label mt-1.5">Residence 01</div>
        </div>
      </div>
    </div>

    <Hairline />

    <nav className="px-3 py-4 flex-1">
      <Label className="px-3 mb-3 block">Control</Label>
      <ul className="space-y-px">
        {navItems.map((it) => (
          <li key={it.label}>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors ${
                it.active
                  ? "bg-surface-raised text-foreground border-l-2 border-odin-accent pl-[10px]"
                  : "text-foreground-dim hover:text-foreground hover:bg-surface-raised/40"
              }`}
            >
              <it.icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="tracking-wide">{it.label}</span>
              {it.active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </button>
          </li>
        ))}
      </ul>

      <Label className="px-3 mt-8 mb-3 block">System</Label>
      <ul className="space-y-px">
        {[
          { icon: Activity, label: "Diagnostics" },
          { icon: Settings, label: "Configuration" },
        ].map((it) => (
          <li key={it.label}>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] text-foreground-dim hover:text-foreground hover:bg-surface-raised/40 transition-colors">
              <it.icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="tracking-wide">{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>

    <Hairline />
    <div className="px-6 py-5 space-y-3">
      <div className="flex items-center justify-between">
        <Label>Network</Label>
        <div className="flex items-center gap-2">
          <StatusDot state="ok" />
          <span className="mono text-[11px] text-foreground-dim">ONLINE</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label>Devices</Label>
        <span className="mono text-[11px] text-foreground-dim num">187 / 187</span>
      </div>
      <div className="flex items-center justify-between">
        <Label>Latency</Label>
        <span className="mono text-[11px] text-foreground-dim num">12 ms</span>
      </div>
    </div>
  </aside>
);

/* ——— top bar ——— */

const TopBar = ({ now }: { now: Date }) => {
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <header className="h-16 border-b border-hairline px-8 flex items-center justify-between bg-surface-inset/40">
      <div className="flex items-baseline gap-6">
        <h1 className="text-[18px] font-medium tracking-[0.04em]">Overview</h1>
        <span className="text-[12px] text-foreground-mute uppercase tracking-[0.18em]">All Systems Nominal</span>
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <Sun className="w-4 h-4 text-foreground-dim" strokeWidth={1.5} />
          <span className="mono text-[12px] text-foreground-dim num">68° EXT · CLEAR</span>
        </div>
        <div className="text-right">
          <div className="mono text-[15px] num leading-none">{time}</div>
          <div className="label mt-1">{date}</div>
        </div>
        <div className="w-9 h-9 border border-hairline-strong grid place-items-center">
          <Fingerprint className="w-4 h-4 text-foreground-dim" strokeWidth={1.5} />
        </div>
      </div>
    </header>
  );
};

/* ——— scenes (global) ——— */

const scenes = ["Welcome", "Entertain", "Dine", "Cinema", "Evening", "Goodnight", "Away"];
const RoomScenes = ({ active, options = scenes }: { active: string; options?: string[] }) => {
  const [a, setA] = useState(active);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((s) => (
        <button
          key={s}
          onClick={() => setA(s)}
          className={`btn-tactile px-3 py-1.5 text-[11px] tracking-[0.12em] uppercase ${a === s ? "active" : "text-foreground-dim"}`}
        >
          {s}
        </button>
      ))}
    </div>
  );
};

/* ——— room panel ——— */

type RoomProps = {
  name: string;
  temp: number;
  occupancy: "occupied" | "vacant";
  lights: { on: number; total: number; level: number };
  scenes?: string[];
  activeScene: string;
  accent?: boolean;
};

const RoomPanel = ({ name, temp, occupancy, lights, scenes: rs, activeScene, accent }: RoomProps) => (
  <div className={`panel ${accent ? "panel-accent" : ""} p-5`}>
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-medium tracking-[0.04em]">{name}</h3>
          <StatusDot state={occupancy === "occupied" ? "active" : "idle"} />
        </div>
        <div className="label mt-1.5">{occupancy === "occupied" ? "Occupied" : "Vacant"} · {lights.on}/{lights.total} fixtures</div>
      </div>
      <div className="text-right">
        <div className="mono text-[20px] num leading-none">{temp}°</div>
        <div className="label mt-1.5">Ambient</div>
      </div>
    </div>

    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Lighting</Label>
          <span className="mono text-[11px] text-foreground-dim num">{lights.level}%</span>
        </div>
        <div className="h-1 bg-surface-inset relative overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${lights.level}%`,
              background: "linear-gradient(90deg, hsl(var(--accent-dim)), hsl(var(--accent)))",
              boxShadow: lights.level > 0 ? "0 0 12px hsl(var(--accent) / 0.5)" : "none",
            }}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Scene</Label>
        <RoomScenes active={activeScene} options={rs} />
      </div>
    </div>
  </div>
);

/* ——— now playing (Sonos) ——— */

const NowPlaying = () => {
  const [playing, setPlaying] = useState(true);
  const [vol, setVol] = useState(38);
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <Label>Now Playing · Sonos</Label>
        <span className="mono text-[10px] text-odin-accent">ARC ULTRA + ERA 100 ×2</span>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 bg-surface-inset border border-hairline-strong shrink-0 relative overflow-hidden">
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg, hsl(28 60% 35%), hsl(220 30% 12%))",
          }} />
          <div className="absolute inset-0 scanline" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium truncate">Spiegel im Spiegel</div>
          <div className="text-[12px] text-foreground-dim truncate">Arvo Pärt · Alina</div>
          <div className="mono text-[10px] text-foreground-mute mt-1.5 num">02:14 / 09:33</div>
        </div>
      </div>

      <div className="h-px bg-surface-inset mb-1">
        <div className="h-px bg-odin-accent" style={{ width: "24%", boxShadow: "0 0 8px hsl(var(--accent))" }} />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
            <SkipBack className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="w-10 h-10 grid place-items-center btn-tactile active"
          >
            {playing ? <Pause className="w-4 h-4" strokeWidth={1.5} /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
          </button>
          <button className="w-8 h-8 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
            <SkipForward className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 ml-6">
          <Volume2 className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
          <div className="flex-1 h-px bg-surface-inset relative">
            <div className="h-px bg-foreground-dim" style={{ width: `${vol}%` }} />
          </div>
          <span className="mono text-[10px] text-foreground-dim num w-6 text-right">{vol}</span>
        </div>
      </div>
    </div>
  );
};

/* ——— climate (T10) ——— */

const Climate = () => {
  const setpoint = 71;
  const current = 72;
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-5">
        <Label>Climate · Resideo T10 Plus</Label>
        <div className="flex items-center gap-2">
          <Snowflake className="w-3 h-3 text-foreground-dim" strokeWidth={1.5} />
          <span className="mono text-[10px] text-foreground-dim">COOLING</span>
        </div>
      </div>

      <div className="flex items-end gap-6 mb-6">
        <div>
          <div className="mono text-[44px] font-light leading-none num">{setpoint}<span className="text-[20px] text-foreground-dim">°</span></div>
          <Label className="mt-2 block">Setpoint</Label>
        </div>
        <div className="pb-1">
          <div className="mono text-[16px] num text-foreground-dim">{current}°</div>
          <Label className="mt-1 block">Current</Label>
        </div>
        <div className="ml-auto pb-1 text-right">
          <div className="mono text-[16px] num text-foreground-dim">42<span className="text-foreground-mute">%</span></div>
          <Label className="mt-1 block">Humidity</Label>
        </div>
      </div>

      {/* zone bar */}
      <div className="space-y-2.5">
        {[
          { z: "Main Level", v: 71 },
          { z: "Upper Level", v: 70 },
          { z: "Primary Suite", v: 69 },
        ].map((z) => (
          <div key={z.z} className="flex items-center gap-3">
            <span className="text-[11px] text-foreground-dim w-28">{z.z}</span>
            <div className="flex-1 h-px bg-surface-inset relative">
              <div className="h-px bg-foreground-dim/60" style={{ width: `${(z.v - 60) * 5}%` }} />
            </div>
            <span className="mono text-[11px] num w-10 text-right">{z.v}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ——— security / sensors ——— */

const sensors = [
  { name: "Front Door", state: "Closed", icon: DoorClosed, status: "ok" as const },
  { name: "Garage Pedestrian", state: "Closed", icon: DoorClosed, status: "ok" as const },
  { name: "Patio Slider", state: "Closed", icon: DoorClosed, status: "ok" as const },
  { name: "Foyer Motion", state: "Clear", icon: Activity, status: "idle" as const },
  { name: "Hallway Motion", state: "Active", icon: Activity, status: "active" as const },
  { name: "Mudroom Motion", state: "Clear", icon: Activity, status: "idle" as const },
];

const Security = () => (
  <div className="panel p-5">
    <div className="flex items-center justify-between mb-4">
      <Label>Perimeter · Aqara</Label>
      <div className="flex items-center gap-2">
        <Lock className="w-3 h-3 text-odin-ok" strokeWidth={1.5} />
        <span className="mono text-[10px] text-odin-ok">ARMED · STAY</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
      {sensors.map((s) => (
        <div key={s.name} className="flex items-center gap-2.5 py-1.5 border-b border-hairline/60">
          <s.icon className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
          <span className="text-[12px] flex-1">{s.name}</span>
          <StatusDot state={s.status} />
          <span className="mono text-[10px] text-foreground-dim w-12 text-right">{s.state.toUpperCase()}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ——— garage ——— */

const Garage = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <Label>Garage · LiftMaster / ratgdo32</Label>
        <StatusDot state={open ? "active" : "idle"} />
      </div>
      <div className="flex items-center gap-4">
        <Car className="w-8 h-8 text-foreground-dim" strokeWidth={1.25} />
        <div className="flex-1">
          <div className="text-[14px] font-medium">Bay 01 — {open ? "Open" : "Closed"}</div>
          <div className="mono text-[10px] text-foreground-mute mt-0.5">Last: 18:42 · Vehicle present</div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={`btn-tactile px-4 py-2 text-[11px] tracking-[0.14em] uppercase ${open ? "active" : "text-foreground-dim"}`}
        >
          {open ? "Close" : "Open"}
        </button>
      </div>
    </div>
  );
};

/* ——— doorbell ——— */

const Doorbell = () => (
  <div className="panel overflow-hidden">
    <div className="flex items-center justify-between p-4 pb-3">
      <Label>Front Entry · Nest Doorbell</Label>
      <div className="flex items-center gap-2">
        <span className="dot text-odin-alert" />
        <span className="mono text-[10px] text-odin-alert">LIVE</span>
      </div>
    </div>
    <div className="relative aspect-[16/10] bg-surface-inset border-t border-hairline">
      <img src={doorbellFeed} alt="Front entry doorbell live feed" className="w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0 scanline pointer-events-none" />
      <div className="absolute top-3 left-3 mono text-[10px] text-white/80 num bg-black/40 px-1.5 py-0.5">
        CAM·01 · 2160p · {new Date().toLocaleTimeString("en-US", { hour12: false })}
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="mono text-[10px] text-white/70 uppercase tracking-[0.16em]">No motion · 04:12 ago</span>
        <div className="flex gap-1.5">
          <button className="btn-tactile px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground-dim">Talk</button>
          <button className="btn-tactile px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-foreground-dim">Unlock</button>
        </div>
      </div>
    </div>
  </div>
);

/* ——— air ——— */

const AirPurifier = () => (
  <div className="panel p-5">
    <div className="flex items-center justify-between mb-4">
      <Label>Air · Primary Suite</Label>
      <div className="flex items-center gap-2">
        <Wind className="w-3 h-3 text-foreground-dim" strokeWidth={1.5} />
        <span className="mono text-[10px] text-foreground-dim">AUTO</span>
      </div>
    </div>
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="mono text-[28px] font-light leading-none num">12<span className="text-[14px] text-foreground-dim ml-1">PM2.5</span></div>
        <Label className="mt-2 block">Excellent</Label>
      </div>
      <div className="text-right">
        <div className="mono text-[14px] text-foreground-dim num">36<span className="text-foreground-mute">%</span></div>
        <Label className="mt-1 block">Filter</Label>
      </div>
    </div>
    <div className="flex gap-1.5">
      {["Sleep", "Auto", "Boost"].map((m, i) => (
        <button key={m} className={`btn-tactile flex-1 py-2 text-[11px] tracking-[0.12em] uppercase ${i === 1 ? "active" : "text-foreground-dim"}`}>
          {m}
        </button>
      ))}
    </div>
  </div>
);

/* ——— voice satellites ——— */

const Voice = () => {
  const sats = [
    { name: "Odin Voice — Living Room", status: "active" as const, state: "Listening" },
    { name: "Odin Voice — Office", status: "idle" as const, state: "Standby" },
  ];
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between mb-4">
        <Label>Voice Satellites</Label>
        <Mic className="w-3 h-3 text-foreground-dim" strokeWidth={1.5} />
      </div>
      <div className="space-y-3">
        {sats.map((s) => (
          <div key={s.name} className="flex items-center gap-3">
            <div className="w-9 h-9 border border-hairline-strong grid place-items-center relative">
              <Mic className="w-3.5 h-3.5 text-foreground-dim" strokeWidth={1.5} />
              {s.status === "active" && (
                <div className="absolute inset-0 border border-odin-accent" style={{ boxShadow: "0 0 12px hsl(var(--accent) / 0.4) inset" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] truncate">{s.name}</div>
              <div className="mono text-[10px] text-foreground-mute mt-0.5">{s.state.toUpperCase()}</div>
            </div>
            <StatusDot state={s.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ——— global scenes header ——— */

const GlobalScenes = () => {
  const [active, setActive] = useState("Evening");
  return (
    <div className="panel panel-accent p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <Label>Residence Scenes</Label>
          <div className="text-[16px] font-medium mt-2 tracking-[0.04em]">Currently — {active}</div>
          <div className="text-[12px] text-foreground-dim mt-1">Soft warm lighting · Climate 71° · Audio low · Perimeter armed</div>
        </div>
        <Power className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {scenes.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`btn-tactile px-4 py-2 text-[11px] tracking-[0.14em] uppercase ${active === s ? "active" : "text-foreground-dim"}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ——— main ——— */

const Index = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <LeftRail />

      <main className="flex-1 flex flex-col min-w-0">
        <TopBar now={now} />

        <div className="flex-1 flex min-h-0">
          {/* center grid */}
          <section className="flex-1 p-8 space-y-6 overflow-auto">
            <GlobalScenes />

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Rooms</Label>
                <span className="mono text-[10px] text-foreground-mute">03 ZONES · GROUND FLOOR</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <RoomPanel
                  name="Living Room"
                  temp={71}
                  occupancy="occupied"
                  lights={{ on: 6, total: 8, level: 42 }}
                  activeScene="Evening"
                  accent
                />
                <RoomPanel
                  name="Kitchen"
                  temp={72}
                  occupancy="vacant"
                  lights={{ on: 2, total: 6, level: 18 }}
                  activeScene="Dine"
                  scenes={["Bright", "Cook", "Dine", "Clean", "Off"]}
                />
                <RoomPanel
                  name="Primary Bedroom"
                  temp={69}
                  occupancy="vacant"
                  lights={{ on: 0, total: 5, level: 0 }}
                  activeScene="Off"
                  scenes={["Wake", "Read", "Relax", "Goodnight", "Off"]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Doorbell />
              <Garage />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Security />
              <AirPurifier />
            </div>
          </section>

          {/* right rail */}
          <aside className="w-[340px] shrink-0 border-l border-hairline bg-surface-inset/40 p-5 space-y-4 overflow-auto">
            <Climate />
            <NowPlaying />
            <Voice />

            <div className="panel p-5">
              <div className="flex items-center justify-between mb-3">
                <Label>Activity</Label>
                <Bell className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
              </div>
              <ul className="space-y-2.5">
                {[
                  { t: "18:42", e: "Garage Bay 01 closed" },
                  { t: "18:38", e: "Vehicle arrived · Driveway" },
                  { t: "18:21", e: "Scene: Evening engaged" },
                  { t: "17:55", e: "Climate setpoint → 71°" },
                  { t: "16:10", e: "Filter @ 36% — service in 21d" },
                ].map((i, idx) => (
                  <li key={idx} className="flex gap-3 text-[12px]">
                    <span className="mono text-foreground-mute num">{i.t}</span>
                    <span className="text-foreground-dim">{i.e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
