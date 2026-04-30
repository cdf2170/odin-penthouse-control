import { useEffect, useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowUpFromLine, Bell, ChevronRight, DoorClosed, Fingerprint,
  Home, Lightbulb, Lock, Mic, Music2, Pause, Play, Power,
  Settings, Shield, SkipBack, SkipForward, Snowflake, Sun, Thermometer,
  Video, Volume2, Wind, Car, X
} from "lucide-react";
import doorbellFeed from "@/assets/doorbell-feed.jpg";
import { Hairline, Label, StatusDot, Panel, SectionHead, TactileButton } from "@/components/odin/primitives";
import LiveInspector from "@/components/odin/LiveInspector";
import { useHa } from "@/lib/ha-client";
import { useAuth } from "@/lib/auth";
import LightingView from "@/components/odin/views/LightingView";
import ClimateView from "@/components/odin/views/ClimateView";
import SecurityView from "@/components/odin/views/SecurityView";
import AudioView from "@/components/odin/views/AudioView";
import CamerasView from "@/components/odin/views/CamerasView";
import VoiceView from "@/components/odin/views/VoiceView";
import DiagnosticsView from "@/components/odin/views/DiagnosticsView";
import ConfigurationView from "@/components/odin/views/ConfigurationView";

type ViewKey = "Overview" | "Lighting" | "Climate" | "Security" | "Audio" | "Cameras" | "Voice" | "Diagnostics" | "Configuration";

const navItems: { icon: any; label: ViewKey }[] = [
  { icon: Home, label: "Overview" },
  { icon: Lightbulb, label: "Lighting" },
  { icon: Thermometer, label: "Climate" },
  { icon: Shield, label: "Security" },
  { icon: Music2, label: "Audio" },
  { icon: Video, label: "Cameras" },
  { icon: Mic, label: "Voice" },
];

const LeftRail = ({ view, setView }: { view: ViewKey; setView: (v: ViewKey) => void }) => {
  const { connected, error, states } = useHa();
  const { user, signOut } = useAuth();
  const entityCount = Object.keys(states).length;
  return (
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
        {navItems.map((it) => {
          const active = view === it.label;
          return (
            <li key={it.label}>
              <button
                onClick={() => setView(it.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-surface-raised text-foreground border-l-2 border-odin-accent pl-[10px]"
                    : "text-foreground-dim hover:text-foreground hover:bg-surface-raised/40"
                }`}
              >
                <it.icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="tracking-wide">{it.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </button>
            </li>
          );
        })}
      </ul>

      <Label className="px-3 mt-8 mb-3 block">System</Label>
      <ul className="space-y-px">
        {[
          { icon: Activity, label: "Diagnostics" as ViewKey },
          { icon: Settings, label: "Configuration" as ViewKey },
        ].map((it) => {
          const active = view === it.label;
          return (
            <li key={it.label}>
              <button
                onClick={() => setView(it.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors ${
                  active
                    ? "bg-surface-raised text-foreground border-l-2 border-odin-accent pl-[10px]"
                    : "text-foreground-dim hover:text-foreground hover:bg-surface-raised/40"
                }`}
              >
                <it.icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="tracking-wide">{it.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>

    <Hairline />
    <div className="px-6 py-5 space-y-3">
      <div className="flex items-center justify-between">
        <Label>HA Link</Label>
        <div className="flex items-center gap-2">
          <StatusDot state={connected ? "active" : error ? "alert" : "idle"} />
          <span className="mono text-[11px] text-foreground-dim">
            {connected ? "LIVE" : error ? "OFFLINE" : "…"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label>Entities</Label>
        <span className="mono text-[11px] text-foreground-dim num">{entityCount}</span>
      </div>
      <div className="flex items-center justify-between">
        <Label>Operator</Label>
        <span className="mono text-[11px] text-foreground-dim truncate max-w-[120px]">
          {user?.email ?? "—"}
        </span>
      </div>
      <button
        onClick={signOut}
        className="w-full text-left label hover:text-odin-accent transition-colors pt-1"
      >
        Sign out →
      </button>
    </div>
  </aside>
  );
};

const TopBar = ({ now, view }: { now: Date; view: ViewKey }) => {
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <header className="h-16 border-b border-hairline px-8 flex items-center justify-between bg-surface-inset/40">
      <div className="flex items-baseline gap-6">
        <h1 className="text-[18px] font-medium tracking-[0.04em]">{view}</h1>
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

/* ——— Overview-only widgets (live) ——— */

import { useEntity } from "@/lib/ha-client";
import { useDiscovery, friendly, isOn } from "@/lib/ha-discovery";

type RoomLive = ReturnType<typeof useDiscovery>["rooms"][number];

const RoomPanel = ({
  room,
  accent,
  onOpenScenes,
}: {
  room: RoomLive;
  accent?: boolean;
  onOpenScenes?: () => void;
}) => {
  const onLights = room.lights.filter(isOn);
  const totalBrightness = onLights.reduce(
    (acc, l) => acc + ((l.attributes?.brightness as number) ?? 0),
    0,
  );
  const avgLevel = onLights.length
    ? Math.round((totalBrightness / onLights.length / 255) * 100)
    : 0;
  const occupied = room.occupancy?.state === "on";
  const playing = room.mediaPlayer?.state === "playing";

  return (
    <button onClick={onOpenScenes} className="text-left w-full group" disabled={!room.scenes.length}>
      <div className={`panel ${accent ? "panel-accent" : ""} p-5 transition-colors group-hover:border-hairline-strong`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-medium tracking-[0.04em] truncate">{room.room}</h3>
              <StatusDot state={occupied ? "active" : "idle"} />
            </div>
            <div className="label mt-1.5">
              {occupied ? "Occupied" : "Vacant"} · {onLights.length}/{room.lights.length} fixtures
              {playing ? " · Audio active" : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="mono text-[20px] num leading-none">{room.scenes.length}</div>
            <div className="label mt-1.5">Scenes</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <Label>{room.scenes.length ? "Scenes" : "Status"}</Label>
            <div className="text-[15px] font-medium mt-1.5 tracking-[0.02em]">
              {room.scenes.length ? `${room.scenes.length} available` : onLights.length ? "Lights on" : "Idle"}
            </div>
          </div>
          {room.scenes.length > 0 && (
            <div className="flex items-center gap-1.5 text-foreground-mute group-hover:text-odin-accent transition-colors">
              <span className="mono text-[10px] uppercase tracking-[0.14em]">Adjust</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="h-1 bg-surface-inset relative overflow-hidden">
          <div className="h-full" style={{
            width: `${avgLevel}%`,
            background: "linear-gradient(90deg, hsl(var(--accent-dim)), hsl(var(--accent)))",
            boxShadow: avgLevel > 0 ? "0 0 12px hsl(var(--accent) / 0.5)" : "none",
          }} />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="label">Lighting</span>
          <span className="mono text-[10px] text-foreground-dim num">{avgLevel}%</span>
        </div>
      </div>
    </button>
  );
};

type SceneTarget = { room: string; options: { name: string; entity: string }[] };

const SceneTray = ({
  target,
  onClose,
  onChoose,
}: {
  target: SceneTarget | null;
  onClose: () => void;
  onChoose: (entity: string) => void;
}) => {
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/60" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] bg-background border-l border-hairline-strong shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-hairline">
          <div>
            <Label>Scenes</Label>
            <div className="text-[16px] font-medium mt-1 tracking-[0.04em]">{target.room}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 grid place-items-center text-foreground-dim hover:text-foreground border border-hairline-strong">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-6 space-y-2 flex-1 overflow-auto">
          {target.options.map((s) => (
            <button
              key={s.entity}
              onClick={() => { onChoose(s.entity); onClose(); }}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors border bg-surface border-hairline hover:border-hairline-strong text-foreground-dim"
            >
              <span className="text-[15px] tracking-[0.02em]">{s.name}</span>
              <span className="mono text-[10px] text-foreground-mute uppercase tracking-[0.14em]">Engage</span>
            </button>
          ))}
          {target.options.length === 0 && (
            <div className="text-[12px] text-foreground-mute text-center py-6">
              No scenes for this room.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NowPlaying = () => {
  const { mediaPlayers } = useDiscovery();
  const { callService } = useHa();
  const playing = mediaPlayers.find((m) => m.state === "playing") ?? mediaPlayers[0];
  if (!playing) {
    return (
      <Panel>
        <Label>Now Playing</Label>
        <div className="text-[12px] text-foreground-mute mt-2">No media players</div>
      </Panel>
    );
  }
  const a = playing.attributes ?? {};
  const vol = Math.round(((a.volume_level as number) ?? 0) * 100);
  const isPlaying = playing.state === "playing";
  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <Label>Now Playing · {friendly(playing)}</Label>
        <span className="mono text-[10px] text-odin-accent uppercase">{playing.state}</span>
      </div>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 bg-surface-inset border border-hairline-strong shrink-0 relative overflow-hidden">
          {a.entity_picture ? (
            <img src={a.entity_picture as string} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(28 60% 35%), hsl(220 30% 12%))" }} />
          )}
          <div className="absolute inset-0 scanline" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium truncate">{(a.media_title as string) ?? "—"}</div>
          <div className="text-[12px] text-foreground-dim truncate">{(a.media_artist as string) ?? ""}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1">
          <button onClick={() => callService("media_player", "media_previous_track", { entity_id: playing.entity_id })} className="w-8 h-8 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
            <SkipBack className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button onClick={() => callService("media_player", "media_play_pause", { entity_id: playing.entity_id })} className={`w-10 h-10 grid place-items-center btn-tactile ${isPlaying ? "active" : ""}`}>
            {isPlaying ? <Pause className="w-4 h-4" strokeWidth={1.5} /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
          </button>
          <button onClick={() => callService("media_player", "media_next_track", { entity_id: playing.entity_id })} className="w-8 h-8 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
            <SkipForward className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-1 ml-6">
          <Volume2 className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
          <div
            className="flex-1 h-px bg-surface-inset relative cursor-pointer"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const pct = Math.round(((e.clientX - r.left) / r.width) * 100);
              callService("media_player", "volume_set", {
                entity_id: playing.entity_id,
                volume_level: Math.max(0, Math.min(100, pct)) / 100,
              });
            }}
          >
            <div className="h-px bg-foreground-dim" style={{ width: `${vol}%` }} />
          </div>
          <span className="mono text-[10px] text-foreground-dim num w-6 text-right">{vol}</span>
        </div>
      </div>
    </Panel>
  );
};

const Climate = () => {
  const { climateZones } = useDiscovery();
  if (climateZones.length === 0) return null;
  const primary = climateZones[0];
  const a = primary.state.attributes ?? {};
  const setpoint = (a.temperature as number) ?? 0;
  const current = (a.current_temperature as number) ?? 0;
  const humidity = (a.current_humidity as number) ?? 0;
  return (
    <Panel>
      <div className="flex items-center justify-between mb-5">
        <Label>Climate · {primary.name}</Label>
        <div className="flex items-center gap-2">
          <Snowflake className="w-3 h-3 text-foreground-dim" strokeWidth={1.5} />
          <span className="mono text-[10px] text-foreground-dim uppercase">{primary.state.state}</span>
        </div>
      </div>
      <div className="flex items-end gap-6 mb-6">
        <div>
          <div className="mono text-[44px] font-light leading-none num">
            {setpoint}<span className="text-[20px] text-foreground-dim">°</span>
          </div>
          <Label className="mt-2 block">Setpoint</Label>
        </div>
        <div className="pb-1">
          <div className="mono text-[16px] num text-foreground-dim">{current}°</div>
          <Label className="mt-1 block">Current</Label>
        </div>
        <div className="ml-auto pb-1 text-right">
          <div className="mono text-[16px] num text-foreground-dim">
            {humidity}<span className="text-foreground-mute">%</span>
          </div>
          <Label className="mt-1 block">Humidity</Label>
        </div>
      </div>
      <div className="space-y-2.5">
        {climateZones.slice(0, 4).map((z) => {
          const v = (z.state.attributes?.current_temperature as number) ?? 0;
          return (
            <div key={z.state.entity_id} className="flex items-center gap-3">
              <span className="text-[11px] text-foreground-dim w-28 truncate">{z.name}</span>
              <div className="flex-1 h-px bg-surface-inset relative">
                <div className="h-px bg-foreground-dim/60" style={{ width: `${Math.min(100, Math.max(0, (v - 60) * 5))}%` }} />
              </div>
              <span className="mono text-[11px] num w-10 text-right">{v}°</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

const Security = () => {
  const { alarm, doorSensors, motionSensors } = useDiscovery();
  const armState = alarm?.state ?? "unknown";
  const armed = armState.startsWith("armed");
  const all = [...doorSensors, ...motionSensors].slice(0, 6);
  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <Label>Perimeter</Label>
        <div className="flex items-center gap-2">
          <Lock className={`w-3 h-3 ${armed ? "text-odin-ok" : "text-foreground-dim"}`} strokeWidth={1.5} />
          <span className={`mono text-[10px] uppercase ${armed ? "text-odin-ok" : "text-foreground-dim"}`}>
            {armState.replace(/_/g, " ")}
          </span>
        </div>
      </div>
      {all.length === 0 ? (
        <div className="text-[12px] text-foreground-mute py-2">No sensors discovered</div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
          {all.map((s) => {
            const open = s.state === "on";
            const isMotion =
              s.attributes?.device_class === "motion" || s.attributes?.device_class === "occupancy";
            const Icon = isMotion ? Activity : DoorClosed;
            return (
              <div key={s.entity_id} className="flex items-center gap-2.5 py-1.5 border-b border-hairline/60">
                <Icon className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
                <span className="text-[12px] flex-1 truncate">{friendly(s)}</span>
                <StatusDot state={open ? (isMotion ? "active" : "alert") : "ok"} />
                <span className="mono text-[10px] text-foreground-dim w-14 text-right">
                  {isMotion ? (open ? "ACTIVE" : "CLEAR") : open ? "OPEN" : "CLOSED"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};

const Garage = () => {
  const { garageCover } = useDiscovery();
  const { callService } = useHa();
  if (!garageCover) {
    return (
      <Panel>
        <Label>Garage</Label>
        <div className="text-[12px] text-foreground-mute mt-2">No garage cover discovered</div>
      </Panel>
    );
  }
  const open = garageCover.state === "open" || garageCover.state === "opening";
  const moving = garageCover.state === "opening" || garageCover.state === "closing";
  const last = garageCover.last_changed
    ? new Date(garageCover.last_changed).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, month: "short", day: "numeric" })
    : "—";

  const toggle = () =>
    callService("cover", open ? "close_cover" : "open_cover", {
      entity_id: garageCover.entity_id,
    });

  return (
    <Panel padding="p-0">
      <div className="flex items-center justify-between p-4 pb-3">
        <Label>Garage · {friendly(garageCover)}</Label>
        <div className="flex items-center gap-2">
          <StatusDot state={open ? "active" : "idle"} />
          <span className={`mono text-[10px] uppercase ${open ? "text-odin-accent" : "text-foreground-mute"}`}>
            {garageCover.state}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-4 border-b border-hairline">
        <div className="w-14 h-14 border border-hairline-strong grid place-items-center bg-surface-inset relative">
          <Car className={`w-6 h-6 ${open ? "text-odin-accent" : "text-foreground-dim"}`} strokeWidth={1.25} />
          {open && <div className="absolute inset-0 border border-odin-accent/60" style={{ boxShadow: "0 0 14px hsl(var(--accent) / 0.3) inset" }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium capitalize">{garageCover.state}</div>
          <div className="mono text-[10px] text-foreground-mute mt-0.5">Last change · {last}</div>
        </div>
        <TactileButton active={open} onClick={toggle} className="!px-5 !py-3">
          {moving ? "…" : open ? "Close" : "Open"}
        </TactileButton>
      </div>
    </Panel>
  );
};

const Doorbell = () => {
  const { doorbell } = useDiscovery();
  const { cameraSnapshot } = useHa();
  const [src, setSrc] = useState<string | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!doorbell) return;
    let cancelled = false;
    const tick = async () => {
      const url = await cameraSnapshot(doorbell.entity_id);
      if (!cancelled && url) {
        setSrc(url);
        setUpdated(new Date());
      }
    };
    tick();
    const id = window.setInterval(tick, 4000);
    return () => { cancelled = true; clearInterval(id); };
  }, [doorbell?.entity_id, cameraSnapshot]);

  if (!doorbell) {
    return (
      <Panel>
        <Label>Front Entry</Label>
        <div className="text-[12px] text-foreground-mute mt-2">No doorbell camera discovered</div>
      </Panel>
    );
  }

  return (
    <Panel padding="p-0" className="overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-3">
        <Label>{friendly(doorbell)}</Label>
        <div className="flex items-center gap-2">
          <span className="dot text-odin-alert" />
          <span className="mono text-[10px] text-odin-alert">LIVE</span>
        </div>
      </div>
      <div className="relative aspect-[16/10] bg-surface-inset border-t border-hairline">
        {src ? (
          <>
            <img src={src} alt="" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 scanline pointer-events-none" />
            <div className="absolute top-3 left-3 mono text-[10px] text-white/80 num bg-black/40 px-1.5 py-0.5">
              SNAPSHOT · {updated?.toLocaleTimeString("en-US", { hour12: false }) ?? "—"}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <Video className="w-8 h-8 text-foreground-mute animate-pulse" strokeWidth={1} />
          </div>
        )}
      </div>
    </Panel>
  );
};

const AirPurifier = () => {
  const { airPurifier } = useDiscovery();
  const { callService } = useHa();
  if (!airPurifier) {
    return (
      <Panel>
        <Label>Air</Label>
        <div className="text-[12px] text-foreground-mute mt-2">No air purifier discovered</div>
      </Panel>
    );
  }
  const a = airPurifier.attributes ?? {};
  const modes: string[] = (a.preset_modes as string[]) ?? ["sleep", "auto", "boost"];
  const current = (a.preset_mode as string) ?? airPurifier.state;
  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <Label>Air · {friendly(airPurifier)}</Label>
        <div className="flex items-center gap-2">
          <Wind className="w-3 h-3 text-foreground-dim" strokeWidth={1.5} />
          <span className="mono text-[10px] text-foreground-dim uppercase">{current}</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {modes.slice(0, 4).map((m) => (
          <TactileButton
            key={m}
            active={current === m}
            onClick={() => callService("fan", "set_preset_mode", { entity_id: airPurifier.entity_id, preset_mode: m })}
            className="!flex-1 !py-2 capitalize"
          >
            {m}
          </TactileButton>
        ))}
      </div>
    </Panel>
  );
};

const Voice = () => {
  const { voiceSatellites } = useDiscovery();
  if (voiceSatellites.length === 0) return null;
  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <Label>Voice Satellites</Label>
        <Mic className="w-3 h-3 text-foreground-dim" strokeWidth={1.5} />
      </div>
      <div className="space-y-3">
        {voiceSatellites.slice(0, 4).map((s) => {
          const active = s.state.state === "listening" || s.state.state === "responding";
          return (
            <div key={s.state.entity_id} className="flex items-center gap-3">
              <div className="w-9 h-9 border border-hairline-strong grid place-items-center relative">
                <Mic className={`w-3.5 h-3.5 ${active ? "text-odin-accent" : "text-foreground-dim"}`} strokeWidth={1.5} />
                {active && <div className="absolute inset-0 border border-odin-accent" style={{ boxShadow: "0 0 12px hsl(var(--accent) / 0.4) inset" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] truncate">{s.name}</div>
                <div className="mono text-[10px] text-foreground-mute mt-0.5 uppercase">{s.state.state}</div>
              </div>
              <StatusDot state={active ? "active" : "idle"} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

const GlobalScenes = () => {
  const { scenes: allScenes } = useDiscovery();
  const { callService } = useHa();
  const top = allScenes.slice(0, 7);
  return (
    <Panel accent>
      <div className="flex items-start justify-between mb-5">
        <div>
          <Label>Residence Scenes</Label>
          <div className="text-[16px] font-medium mt-2 tracking-[0.04em]">{top.length} available</div>
          <div className="text-[12px] text-foreground-dim mt-1">Tap to engage · live via Home Assistant</div>
        </div>
        <Power className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
      </div>
      {top.length === 0 ? (
        <div className="text-[12px] text-foreground-mute">No global scenes found</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {top.map((s) => (
            <TactileButton
              key={s.entity_id}
              onClick={() => callService("scene", "turn_on", { entity_id: s.entity_id })}
              className="!px-4 !py-2"
            >
              {friendly(s)}
            </TactileButton>
          ))}
        </div>
      )}
    </Panel>
  );
};

const ActivityLog = () => {
  const { states } = useHa();
  const recent = Object.values(states)
    .filter((s) => s.last_changed)
    .sort((a, b) => new Date(b.last_changed!).getTime() - new Date(a.last_changed!).getTime())
    .slice(0, 8);
  return (
    <Panel>
      <div className="flex items-center justify-between mb-3">
        <Label>Activity</Label>
        <Bell className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
      </div>
      <ul className="space-y-2.5">
        {recent.map((s) => (
          <li key={s.entity_id} className="flex gap-3 text-[12px]">
            <span className="mono text-foreground-mute num shrink-0">
              {new Date(s.last_changed!).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-foreground-dim truncate">
              {friendly(s)} → <span className="mono">{s.state}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

const OverviewView = () => {
  const { rooms } = useDiscovery();
  const { callService } = useHa();
  const [tray, setTray] = useState<SceneTarget | null>(null);

  return (
    <div className="flex-1 flex min-h-0">
      <section className="flex-1 p-8 space-y-6 overflow-auto">
        <GlobalScenes />
        {rooms.length > 0 && (
          <div>
            <SectionHead title="Rooms" meta={`${rooms.length} ZONES · TAP TO ADJUST`} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rooms.map((r, i) => (
                <RoomPanel
                  key={r.room}
                  room={r}
                  accent={i === 0}
                  onOpenScenes={
                    r.scenes.length
                      ? () => setTray({ room: r.room, options: r.scenes.map((s) => ({ name: s.name, entity: s.entity })) })
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Doorbell /><Garage />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Security /><AirPurifier />
        </div>
        <LiveInspector />
      </section>

      <SceneTray
        target={tray}
        onClose={() => setTray(null)}
        onChoose={(entity) => callService("scene", "turn_on", { entity_id: entity })}
      />

      <aside className="w-[340px] shrink-0 border-l border-hairline bg-surface-inset/40 p-5 space-y-4 overflow-auto">
        <Climate /><NowPlaying /><Voice />
        <ActivityLog />
      </aside>
    </div>
  );
};

const Index = () => {
  const [now, setNow] = useState(new Date());
  const [view, setView] = useState<ViewKey>("Overview");

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <LeftRail view={view} setView={setView} />
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar now={now} view={view} />
        {view === "Overview" ? <OverviewView /> : (
          <div className="flex-1 overflow-auto p-8">
            {view === "Lighting" && <LightingView />}
            {view === "Climate" && <ClimateView />}
            {view === "Security" && <SecurityView />}
            {view === "Audio" && <AudioView />}
            {view === "Cameras" && <CamerasView />}
            {view === "Voice" && <VoiceView />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
