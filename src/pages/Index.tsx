import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowUpFromLine, Bell, ChevronRight, DoorClosed, Fan, Fingerprint,
  Home, Lightbulb, Lock, Mic, Music2, Pause, Play, Power,
  Settings, Shield, SkipBack, SkipForward, Snowflake, Sun, Thermometer,
  Video, Volume2, Wind, Car, X, Pencil, EyeOff, Eye, Check
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import doorbellFeed from "@/assets/doorbell-feed.jpg";
import { Hairline, Label, StatusDot, Panel, SectionHead, TactileButton } from "@/components/odin/primitives";

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
  const { states, connected, error } = useHa();

  // Find first weather.* entity
  const weather = Object.values(states).find((s) => s.entity_id.startsWith("weather."));
  const wTemp = (weather?.attributes?.temperature as number | undefined);
  const wUnit = (weather?.attributes?.temperature_unit as string | undefined) ?? "°";
  const wCond = weather?.state ?? "—";

  const alarm = Object.values(states).find((s) => s.entity_id.startsWith("alarm_control_panel."));
  const triggered = alarm?.state === "triggered" || alarm?.state === "pending";
  const systemStatus = !connected
    ? { text: error ? "Cloud Link Down" : "Connecting…", cls: "text-odin-alert" }
    : triggered
    ? { text: "Alarm Triggered", cls: "text-odin-alert" }
    : { text: "All Systems Nominal", cls: "text-foreground-mute" };

  return (
    <header className="h-16 border-b border-hairline px-8 flex items-center justify-between bg-surface-inset/40">
      <div className="flex items-baseline gap-6">
        <h1 className="text-[18px] font-medium tracking-[0.04em]">{view}</h1>
        <span className={`text-[12px] uppercase tracking-[0.18em] ${systemStatus.cls}`}>{systemStatus.text}</span>
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <Sun className="w-4 h-4 text-foreground-dim" strokeWidth={1.5} />
          <span className="mono text-[12px] text-foreground-dim num">
            {wTemp != null ? `${Math.round(wTemp)}${wUnit} EXT · ${wCond.toUpperCase()}` : "WEATHER UNAVAIL"}
          </span>
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
  onOpenDetails,
}: {
  room: RoomLive;
  accent?: boolean;
  onOpenDetails: () => void;
}) => {
  const { callService } = useHa();
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
  const anyOn = onLights.length > 0;

  const toggleAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (room.lights.length === 0) return;
    callService("light", anyOn ? "turn_off" : "turn_on", {
      entity_id: room.lights.map((l) => l.entity_id),
    });
  };

  return (
    <div className={`panel ${accent ? "panel-accent" : ""} p-5 transition-colors hover:border-hairline-strong`}>
      <div className="flex items-start justify-between mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-medium tracking-[0.04em] truncate">{room.room}</h3>
            <StatusDot state={occupied ? "active" : "idle"} />
          </div>
          <div className="label mt-1.5">
            {occupied ? "Occupied" : "Vacant"} · {onLights.length}/{room.lights.length} fixtures
            {playing ? " · Audio" : ""}
          </div>
        </div>
        <button
          onClick={onOpenDetails}
          className="flex items-center gap-1.5 text-foreground-mute hover:text-odin-accent transition-colors shrink-0"
          aria-label={`Open ${room.room} details`}
        >
          <span className="mono text-[10px] uppercase tracking-[0.14em]">Details</span>
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <button
        onClick={toggleAll}
        disabled={room.lights.length === 0}
        className={`btn-tactile w-full px-3 py-2.5 text-[11px] tracking-[0.14em] uppercase flex items-center justify-center gap-2 mb-3 ${anyOn ? "active" : "text-foreground-dim"} disabled:opacity-40`}
      >
        <Power className="w-3.5 h-3.5" strokeWidth={1.5} />
        {room.lights.length === 0 ? "No lights" : anyOn ? "All On · Tap to Off" : "All Off · Tap to On"}
      </button>

      <div className="h-1 bg-surface-inset relative overflow-hidden">
        <div className="h-full transition-[width] duration-300" style={{
          width: `${avgLevel}%`,
          background: "linear-gradient(90deg, hsl(var(--accent-dim)), hsl(var(--accent)))",
          boxShadow: avgLevel > 0 ? "0 0 12px hsl(var(--accent) / 0.5)" : "none",
        }} />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="label">Avg Brightness</span>
        <span className="mono text-[10px] text-foreground-dim num">{avgLevel}%</span>
      </div>
    </div>
  );
};

/* ——— Full room details tray (scenes + per-fixture controls + media) ——— */

const RoomDetailsTray = ({
  room,
  onClose,
}: {
  room: RoomLive | null;
  onClose: () => void;
}) => {
  const { callService } = useHa();
  if (!room) return null;

  const onLights = room.lights.filter(isOn);
  const anyOn = onLights.length > 0;

  const toggleAll = () =>
    callService("light", anyOn ? "turn_off" : "turn_on", {
      entity_id: room.lights.map((l) => l.entity_id),
    });

  const toggleOne = (entity_id: string, on: boolean) =>
    callService("light", on ? "turn_off" : "turn_on", { entity_id });

  const setLevel = (entity_id: string, pct: number) =>
    callService("light", "turn_on", { entity_id, brightness_pct: pct });

  const engageScene = (entity: string) =>
    callService("scene", "turn_on", { entity_id: entity });

  const mp = room.mediaPlayer;
  const mpVol = mp ? Math.round(((mp.attributes?.volume_level as number) ?? 0) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/60" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[460px] bg-background border-l border-hairline-strong shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-hairline shrink-0">
          <div>
            <Label>Room Controls</Label>
            <div className="text-[16px] font-medium mt-1 tracking-[0.04em]">{room.room}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 grid place-items-center text-foreground-dim hover:text-foreground border border-hairline-strong">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-5 border-b border-hairline">
            <div className="flex items-center justify-between mb-3">
              <Label>All Fixtures</Label>
              <span className="mono text-[10px] text-foreground-mute num">{onLights.length}/{room.lights.length} ON</span>
            </div>
            <button
              onClick={toggleAll}
              disabled={room.lights.length === 0}
              className={`btn-tactile w-full px-3 py-3 text-[12px] tracking-[0.14em] uppercase flex items-center justify-center gap-2 ${anyOn ? "active" : "text-foreground-dim"} disabled:opacity-40`}
            >
              <Power className="w-4 h-4" strokeWidth={1.5} />
              {anyOn ? "Turn All Off" : "Turn All On"}
            </button>
          </div>

          {room.scenes.length > 0 && (
            <div className="px-6 py-5 border-b border-hairline">
              <SectionHead title="Scenes" meta={`${room.scenes.length} AVAILABLE`} />
              <div className="grid grid-cols-2 gap-2">
                {room.scenes.map((s) => (
                  <button
                    key={s.entity}
                    onClick={() => engageScene(s.entity)}
                    className="px-3 py-3 text-left text-[13px] border bg-surface border-hairline hover:border-odin-accent hover:text-odin-accent transition-colors"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {room.lights.length > 0 && (
            <div className="px-6 py-5 border-b border-hairline">
              <SectionHead title="Fixtures" meta="TAP TO TOGGLE · DRAG TO DIM" />
              <div className="space-y-4">
                {room.lights.map((l) => {
                  const on = isOn(l);
                  const level = on ? Math.round((((l.attributes?.brightness as number) ?? 0) / 255) * 100) : 0;
                  return (
                    <div key={l.entity_id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleOne(l.entity_id, on)}
                          className={`btn-tactile w-9 h-7 grid place-items-center ${on ? "active" : ""}`}
                        >
                          <Lightbulb className={`w-3 h-3 ${on ? "text-odin-accent" : "text-foreground-mute"}`} strokeWidth={1.5} />
                        </button>
                        <span className="text-[13px] flex-1 truncate">{friendly(l)}</span>
                        <span className="mono text-[10px] text-foreground-mute num w-9 text-right">{level}%</span>
                      </div>
                      <Slider
                        value={[level]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(v) => setLevel(l.entity_id, v[0])}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {mp && (
            <div className="px-6 py-5">
              <SectionHead title={`Audio · ${friendly(mp)}`} meta={mp.state.toUpperCase()} />
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => callService("media_player", "media_previous_track", { entity_id: mp.entity_id })} className="w-8 h-8 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
                  <SkipBack className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => callService("media_player", "media_play_pause", { entity_id: mp.entity_id })}
                  className={`w-10 h-10 grid place-items-center btn-tactile ${mp.state === "playing" ? "active" : ""}`}
                >
                  {mp.state === "playing"
                    ? <Pause className="w-4 h-4" strokeWidth={1.5} />
                    : <Play className="w-4 h-4" strokeWidth={1.5} />}
                </button>
                <button onClick={() => callService("media_player", "media_next_track", { entity_id: mp.entity_id })} className="w-8 h-8 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
                  <SkipForward className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
                <Slider
                  value={[mpVol]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) =>
                    callService("media_player", "volume_set", {
                      entity_id: mp.entity_id,
                      volume_level: v[0] / 100,
                    })
                  }
                  className="flex-1"
                />
                <span className="mono text-[10px] text-foreground-dim num w-8 text-right">{mpVol}</span>
              </div>
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
        <div className="flex items-center gap-3 flex-1 ml-6">
          <Volume2 className="w-3.5 h-3.5 text-foreground-mute shrink-0" strokeWidth={1.5} />
          <Slider
            value={[vol]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) =>
              callService("media_player", "volume_set", {
                entity_id: playing.entity_id,
                volume_level: v[0] / 100,
              })
            }
            className="flex-1"
          />
          <span className="mono text-[10px] text-foreground-dim num w-7 text-right">{vol}</span>
        </div>
      </div>
    </Panel>
  );
};

const Climate = () => {
  const { climateZones } = useDiscovery();
  const { callService } = useHa();
  const [zoneIdx, setZoneIdx] = useState(0);
  if (climateZones.length === 0) return null;
  const idx = Math.min(zoneIdx, climateZones.length - 1);
  const zone = climateZones[idx];
  const a = zone.state.attributes ?? {};
  const setpoint = (a.temperature as number) ?? 0;
  const current = (a.current_temperature as number) ?? 0;
  const minT = (a.min_temp as number) ?? 50;
  const maxT = (a.max_temp as number) ?? 90;
  const step = (a.target_temp_step as number) ?? 1;
  const mode = zone.state.state;
  const modes: string[] = (a.hvac_modes as string[]) ?? ["off", "heat", "cool", "auto"];

  const setTemp = (next: number) => {
    const clamped = Math.max(minT, Math.min(maxT, next));
    callService("climate", "set_temperature", {
      entity_id: zone.state.entity_id,
      temperature: clamped,
    });
  };

  const setMode = (m: string) => {
    callService("climate", "set_hvac_mode", {
      entity_id: zone.state.entity_id,
      hvac_mode: m,
    });
  };

  const quickModes: { key: string; label: string }[] = [
    { key: "heat", label: "Heat" },
    { key: "auto", label: modes.includes("auto") ? "Auto" : "Heat/Cool" },
    { key: "off", label: "Off" },
  ].filter((m) => modes.includes(m.key) || (m.key === "auto" && modes.includes("heat_cool")));

  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <Label>Climate</Label>
        <div className="flex items-center gap-1.5">
          <Snowflake className="w-3 h-3 text-foreground-dim" strokeWidth={1.5} />
          <span className="mono text-[10px] uppercase text-foreground-dim">{mode}</span>
        </div>
      </div>

      {climateZones.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {climateZones.map((z, i) => (
            <button
              key={z.state.entity_id}
              onClick={() => setZoneIdx(i)}
              className={`px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase border transition-colors ${i === idx ? "border-odin-accent text-foreground" : "border-hairline text-foreground-dim hover:border-hairline-strong"}`}
            >
              {z.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-stretch gap-1.5 mb-4">
        {quickModes.map((m) => {
          const target = m.key === "auto" && !modes.includes("auto") ? "heat_cool" : m.key;
          const active = mode === target;
          return (
            <button
              key={m.key}
              onClick={() => setMode(target)}
              className={`flex-1 py-2 mono text-[10px] tracking-[0.18em] uppercase border transition-colors ${
                active
                  ? "border-odin-accent/80 text-odin-accent bg-odin-accent/10"
                  : "border-hairline-strong text-foreground-mute hover:text-foreground"
              }`}
              style={active ? { boxShadow: "0 0 14px hsl(var(--accent) / 0.18) inset" } : undefined}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTemp(setpoint - step)}
          className="btn-tactile w-9 h-9 grid place-items-center text-foreground-dim text-[18px] leading-none"
          aria-label="Lower setpoint"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <div className="mono text-[36px] font-light leading-none num">
            {setpoint}<span className="text-[18px] text-foreground-dim">°</span>
          </div>
          <div className="label mt-1.5">{zone.name} · now {current}°</div>
        </div>
        <button
          onClick={() => setTemp(setpoint + step)}
          className="btn-tactile w-9 h-9 grid place-items-center text-foreground-dim text-[18px] leading-none"
          aria-label="Raise setpoint"
        >
          +
        </button>
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
  const isOff = airPurifier.state === "off";
  const preset = (a.preset_mode as string | undefined)?.toLowerCase();
  // Normalize to On / Off / Auto only
  const current: "off" | "auto" | "on" = isOff ? "off" : preset === "auto" ? "auto" : "on";

  const setMode = (mode: "off" | "auto" | "on") => {
    if (mode === "off") {
      callService("fan", "turn_off", { entity_id: airPurifier.entity_id });
    } else if (mode === "auto") {
      callService("fan", "turn_on", { entity_id: airPurifier.entity_id });
      callService("fan", "set_preset_mode", { entity_id: airPurifier.entity_id, preset_mode: "Auto" });
    } else {
      callService("fan", "turn_on", { entity_id: airPurifier.entity_id });
    }
  };

  const modes: { key: "off" | "on" | "auto"; label: string }[] = [
    { key: "off", label: "Off" },
    { key: "on", label: "On" },
    { key: "auto", label: "Auto" },
  ];

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
        {modes.map((m) => (
          <TactileButton
            key={m.key}
            active={current === m.key}
            onClick={() => setMode(m.key)}
            className="!flex-1 !py-2"
          >
            {m.label}
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

const SCENE_PREFS_KEY = "odin.residenceScenes.v1";
type ScenePrefs = { enabled: boolean; selected: string[] };

const loadScenePrefs = (): ScenePrefs => {
  try {
    const raw = localStorage.getItem(SCENE_PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: true, selected: [] };
};

const GlobalScenes = () => {
  const { scenes: allScenes } = useDiscovery();
  const { callService } = useHa();
  const [prefs, setPrefs] = useState<ScenePrefs>(loadScenePrefs);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(SCENE_PREFS_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs]);

  // Initialize selection on first load if empty
  useEffect(() => {
    if (prefs.selected.length === 0 && allScenes.length > 0) {
      setPrefs((p) => ({ ...p, selected: allScenes.slice(0, 6).map((s) => s.entity_id) }));
    }
  }, [allScenes.length]);

  const visible = useMemo(
    () => allScenes.filter((s) => prefs.selected.includes(s.entity_id)),
    [allScenes, prefs.selected],
  );

  if (!prefs.enabled && !editing) {
    return (
      <Panel accent>
        <div className="flex items-center justify-between">
          <div>
            <Label>Residence Scenes</Label>
            <div className="text-[13px] text-foreground-dim mt-1.5">Hidden · enable to show shortcuts</div>
          </div>
          <button
            onClick={() => setPrefs((p) => ({ ...p, enabled: true }))}
            className="btn-tactile px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase text-foreground-dim flex items-center gap-2"
          >
            <Eye className="w-3 h-3" strokeWidth={1.5} /> Enable
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel accent>
      <div className="flex items-start justify-between mb-5">
        <div>
          <Label>Residence Scenes</Label>
          <div className="text-[16px] font-medium mt-2 tracking-[0.04em]">
            {editing ? `${prefs.selected.length} selected` : `${visible.length} pinned`}
          </div>
          <div className="text-[12px] text-foreground-dim mt-1">
            {editing ? "Tap to pin / unpin · live via Home Assistant" : "Tap to engage · pin your favorites"}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {editing && (
            <button
              onClick={() => setPrefs((p) => ({ ...p, enabled: !p.enabled }))}
              className="btn-tactile px-2.5 py-1.5 text-[10px] tracking-[0.14em] uppercase text-foreground-dim flex items-center gap-1.5"
              title={prefs.enabled ? "Hide widget" : "Show widget"}
            >
              {prefs.enabled ? <EyeOff className="w-3 h-3" strokeWidth={1.5} /> : <Eye className="w-3 h-3" strokeWidth={1.5} />}
              {prefs.enabled ? "Disable" : "Enable"}
            </button>
          )}
          <button
            onClick={() => setEditing((e) => !e)}
            className={`btn-tactile px-2.5 py-1.5 text-[10px] tracking-[0.14em] uppercase flex items-center gap-1.5 ${editing ? "active" : "text-foreground-dim"}`}
          >
            {editing ? <Check className="w-3 h-3" strokeWidth={1.5} /> : <Pencil className="w-3 h-3" strokeWidth={1.5} />}
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {editing ? (
        allScenes.length === 0 ? (
          <div className="text-[12px] text-foreground-mute">No scenes found</div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 max-h-[260px] overflow-auto pr-1">
            {allScenes.map((s) => {
              const picked = prefs.selected.includes(s.entity_id);
              return (
                <button
                  key={s.entity_id}
                  onClick={() =>
                    setPrefs((p) => ({
                      ...p,
                      selected: picked
                        ? p.selected.filter((e) => e !== s.entity_id)
                        : [...p.selected, s.entity_id],
                    }))
                  }
                  className={`flex items-center justify-between gap-2 px-3 py-2 text-left text-[12px] border transition-colors ${picked ? "border-odin-accent text-foreground bg-surface-raised" : "border-hairline text-foreground-dim hover:border-hairline-strong"}`}
                >
                  <span className="truncate">{friendly(s)}</span>
                  {picked && <Check className="w-3 h-3 text-odin-accent shrink-0" strokeWidth={2} />}
                </button>
              );
            })}
          </div>
        )
      ) : visible.length === 0 ? (
        <div className="text-[12px] text-foreground-mute">No scenes pinned · tap Edit to add</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {visible.map((s) => (
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

/* ——— Quick Controls grid (one-tap tiles, themed to ODIN) ——— */

type Tone = "amber" | "ok" | "alert" | "neutral";

const QuickTile = ({
  icon: Icon,
  label,
  status,
  active,
  tone = "amber",
  onClick,
  disabled,
}: {
  icon: any;
  label: string;
  status: string;
  active?: boolean;
  tone?: Tone;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const toneCls = {
    amber: "border-odin-accent/70 text-foreground",
    ok: "border-odin-ok/70 text-foreground",
    alert: "border-odin-alert/70 text-foreground",
    neutral: "border-hairline-strong text-foreground",
  }[tone];
  const iconCls = active
    ? {
        amber: "text-odin-accent",
        ok: "text-odin-ok",
        alert: "text-odin-alert",
        neutral: "text-foreground",
      }[tone]
    : "text-foreground-mute";
  const glow = active
    ? {
        amber: "0 0 24px hsl(var(--accent) / 0.18) inset",
        ok: "0 0 24px hsl(var(--ok) / 0.18) inset",
        alert: "0 0 24px hsl(var(--alert) / 0.18) inset",
        neutral: "none",
      }[tone]
    : "none";
  const bg = active
    ? {
        amber: "linear-gradient(180deg, hsl(32 88% 58% / 0.06), hsl(32 88% 58% / 0.02))",
        ok: "linear-gradient(180deg, hsl(152 40% 48% / 0.06), hsl(152 40% 48% / 0.02))",
        alert: "linear-gradient(180deg, hsl(358 70% 56% / 0.06), hsl(358 70% 56% / 0.02))",
        neutral: "var(--grad-panel)",
      }[tone]
    : "var(--grad-panel)";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`panel p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-colors disabled:opacity-40 ${active ? toneCls : "hover:border-hairline-strong"}`}
      style={{ background: bg, boxShadow: glow }}
    >
      <Icon className={`w-6 h-6 transition-colors ${iconCls}`} strokeWidth={1.25} />
      <div className="text-[12px] font-medium tracking-[0.04em] mt-1">{label}</div>
      <div className="mono text-[10px] text-foreground-mute uppercase tracking-[0.14em] num">
        {status}
      </div>
    </button>
  );
};

/* ——— Detailed quick cards (Garage, Air Purifier) ——— */

const GarageQuickCard = () => {
  const { garageCover } = useDiscovery();
  const { callService } = useHa();
  if (!garageCover) return null;
  const open = garageCover.state === "open" || garageCover.state === "opening";
  const moving = garageCover.state === "opening" || garageCover.state === "closing";
  const last = garageCover.last_changed
    ? new Date(garageCover.last_changed).toLocaleString("en-US", {
        hour: "2-digit", minute: "2-digit", hour12: false, month: "short", day: "numeric",
      })
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
      <div className="px-4 pb-4 flex items-center gap-4">
        <div className="w-14 h-14 border border-hairline-strong grid place-items-center bg-surface-inset relative shrink-0">
          <Car className={`w-6 h-6 ${open ? "text-odin-accent" : "text-foreground-dim"}`} strokeWidth={1.25} />
          {open && (
            <div
              className="absolute inset-0 border border-odin-accent/60"
              style={{ boxShadow: "0 0 14px hsl(var(--accent) / 0.3) inset" }}
            />
          )}
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

const AirPurifierQuickCard = () => {
  const { airPurifier } = useDiscovery();
  const { callService } = useHa();
  if (!airPurifier) return null;
  const a = airPurifier.attributes ?? {};
  const off = airPurifier.state === "off";
  const preset = (a.preset_mode as string | undefined)?.toLowerCase();
  const mode: "off" | "on" | "auto" = off ? "off" : preset === "auto" ? "auto" : "on";

  const setMode = (m: "off" | "on" | "auto") => {
    if (m === "off") {
      callService("fan", "turn_off", { entity_id: airPurifier.entity_id });
    } else if (m === "auto") {
      callService("fan", "turn_on", { entity_id: airPurifier.entity_id });
      callService("fan", "set_preset_mode", {
        entity_id: airPurifier.entity_id,
        preset_mode: "Auto",
      });
    } else {
      callService("fan", "turn_on", { entity_id: airPurifier.entity_id });
    }
  };

  const seg = (m: "off" | "on" | "auto", label: string) => {
    const active = mode === m;
    return (
      <button
        key={m}
        onClick={() => setMode(m)}
        className={`flex-1 py-3 mono text-[11px] tracking-[0.18em] uppercase border transition-colors ${
          active
            ? "border-odin-accent/80 text-odin-accent bg-odin-accent/10"
            : "border-hairline-strong text-foreground-mute hover:text-foreground"
        }`}
        style={active ? { boxShadow: "0 0 18px hsl(var(--accent) / 0.18) inset" } : undefined}
      >
        {label}
      </button>
    );
  };

  return (
    <Panel padding="p-0">
      <div className="flex items-center justify-between p-4 pb-3">
        <Label>Air · {friendly(airPurifier)}</Label>
        <div className="flex items-center gap-2">
          <Wind className={`w-3.5 h-3.5 ${mode !== "off" ? "text-odin-accent" : "text-foreground-mute"}`} strokeWidth={1.5} />
          <span className={`mono text-[10px] uppercase ${mode !== "off" ? "text-odin-accent" : "text-foreground-mute"}`}>
            {mode === "off" ? "Off" : mode === "auto" ? "Auto" : "On"}
          </span>
        </div>
      </div>
      <div className="px-4 pb-4 flex items-stretch gap-2">
        {seg("off", "Off")}
        {seg("on", "On")}
        {seg("auto", "Auto")}
      </div>
    </Panel>
  );
};

/* ——— Quick Controls section ——— */

const QuickControls = () => {
  const { rooms, bedroomFan, garageCover, airPurifier, lights } = useDiscovery();
  const { callService } = useHa();

  // Fallback matcher in case the room bundle missed (e.g. friendly_name based grouping)
  const findRoomLights = (room: string) => {
    const r = rooms.find((x) => x.room === room);
    if (r && r.lights.length > 0) return r.lights;
    const slug = room.toLowerCase().replace(/\s+/g, "_");
    const compact = room.toLowerCase().replace(/\s+/g, "");
    return lights.filter((l) => {
      const id = l.entity_id.toLowerCase();
      const name = (l.attributes?.friendly_name ?? "").toString().toLowerCase();
      return (
        id.includes(slug) ||
        id.includes(compact) ||
        name.includes(room.toLowerCase())
      );
    });
  };

  const lightsTile = (room: string, label: string, icon: any) => {
    const roomLights = findRoomLights(room);
    if (roomLights.length === 0) return null;
    const onLights = roomLights.filter(isOn);
    const active = onLights.length > 0;
    const totalBrightness = onLights.reduce(
      (acc, l) => acc + ((l.attributes?.brightness as number) ?? 0),
      0,
    );
    const avgLevel = onLights.length
      ? Math.round((totalBrightness / onLights.length / 255) * 100)
      : 0;
    return (
      <QuickTile
        key={room}
        icon={icon}
        label={label}
        status={active ? `${avgLevel}%` : "Off"}
        active={active}
        tone="amber"
        onClick={() =>
          callService("light", active ? "turn_off" : "turn_on", {
            entity_id: roomLights.map((l) => l.entity_id),
          })
        }
      />
    );
  };

  const fanTile = bedroomFan
    ? (() => {
        const on = bedroomFan.state === "on";
        return (
          <QuickTile
            key="bedroom-fan"
            icon={Fan}
            label="Bedroom Fan"
            status={on ? "On" : "Off"}
            active={on}
            tone="ok"
            onClick={() =>
              callService("fan", on ? "turn_off" : "turn_on", {
                entity_id: bedroomFan.entity_id,
              })
            }
          />
        );
      })()
    : null;

  const garageTile = garageCover
    ? (() => {
        const open = garageCover.state === "open" || garageCover.state === "opening";
        return (
          <QuickTile
            key="garage"
            icon={Car}
            label="Garage"
            status={garageCover.state}
            active={open}
            tone={open ? "alert" : "neutral"}
            onClick={() =>
              callService("cover", open ? "close_cover" : "open_cover", {
                entity_id: garageCover.entity_id,
              })
            }
          />
        );
      })()
    : null;

  const purifierTile = airPurifier
    ? (() => {
        const off = airPurifier.state === "off";
        const preset = (airPurifier.attributes?.preset_mode as string | undefined)?.toLowerCase();
        const status = off ? "Off" : preset === "auto" ? "Auto" : "On";
        return (
          <QuickTile
            key="purifier"
            icon={Wind}
            label="Air Purifier"
            status={status}
            active={!off}
            tone="ok"
            onClick={() =>
              callService("fan", off ? "turn_on" : "turn_off", {
                entity_id: airPurifier.entity_id,
              })
            }
          />
        );
      })()
    : null;

  // Order requested by user
  const tiles = [
    fanTile,
    garageTile,
    purifierTile,
    lightsTile("Kitchen", "Kitchen Lights", Lightbulb),
    lightsTile("Living Room", "Living Room Lights", Lightbulb),
  ].filter(Boolean);

  if (tiles.length === 0) return null;

  return (
    <div>
      <SectionHead title="Quick Controls" meta={`${tiles.length} TILES · TAP TO TOGGLE`} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {tiles}
      </div>
    </div>
  );
};

const OverviewView = () => {
  const { rooms } = useDiscovery();
  const [activeRoom, setActiveRoom] = useState<RoomLive | null>(null);

  // Keep tray in sync with live discovery updates
  const liveActiveRoom = useMemo(
    () => (activeRoom ? rooms.find((r) => r.room === activeRoom.room) ?? null : null),
    [rooms, activeRoom],
  );

  return (
    <div className="flex-1 flex min-h-0">
      <section className="flex-1 p-8 space-y-6 overflow-auto">
        <QuickControls />
        {rooms.length > 0 && (
          <div>
            <SectionHead title="Rooms" meta={`${rooms.length} ZONES · TAP DETAILS FOR FULL CONTROL`} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rooms.map((r, i) => (
                <RoomPanel
                  key={r.room}
                  room={r}
                  accent={i === 0}
                  onOpenDetails={() => setActiveRoom(r)}
                />
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Doorbell />
          <Security />
        </div>
      </section>

      <RoomDetailsTray room={liveActiveRoom} onClose={() => setActiveRoom(null)} />

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
            {view === "Diagnostics" && <DiagnosticsView />}
            {view === "Configuration" && <ConfigurationView />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
