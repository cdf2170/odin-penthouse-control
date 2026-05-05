import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowUpFromLine, Bell, ChevronRight, DoorClosed, Fingerprint,
  Home, Lightbulb, Lock, Mic, Music2, Pause, Play, Power,
  Settings, Shield, SkipBack, SkipForward, Snowflake, Sun, Thermometer,
  Video, Volume2, VolumeX, Volume1, Wind, Car, X, Pencil, EyeOff, Eye, Check,
  Tv, ChevronUp, ChevronDown, ChevronLeft, ArrowLeft, CornerDownLeft, HeartPulse
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import doorbellFeed from "@/assets/doorbell-feed.jpg";
import { Hairline, Label, StatusDot, Panel, SectionHead, TactileButton } from "@/components/odin/primitives";

import { useHa, type HaState } from "@/lib/ha-client";
import { useAuth } from "@/lib/auth";
import LightingView from "@/components/odin/views/LightingView";
import ClimateView from "@/components/odin/views/ClimateView";
import SecurityView from "@/components/odin/views/SecurityView";
import AudioView from "@/components/odin/views/AudioView";
import CamerasView from "@/components/odin/views/CamerasView";
import VoiceView from "@/components/odin/views/VoiceView";
import DiagnosticsView from "@/components/odin/views/DiagnosticsView";
import ConfigurationView from "@/components/odin/views/ConfigurationView";
import HealthView from "@/components/odin/views/HealthView";

type ViewKey = "Overview" | "Lighting" | "Climate" | "Security" | "Audio" | "Cameras" | "Voice" | "Health" | "Diagnostics" | "Configuration";

const navItems: { icon: any; label: ViewKey }[] = [
  { icon: Home, label: "Overview" },
  { icon: Lightbulb, label: "Lighting" },
  { icon: Thermometer, label: "Climate" },
  { icon: Shield, label: "Security" },
  { icon: Music2, label: "Audio" },
  { icon: Video, label: "Cameras" },
  { icon: Mic, label: "Voice" },
  { icon: HeartPulse, label: "Health" },
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
      <div className="flex items-center justify-between gap-3">
        <Label>Operator</Label>
        <span className="mono text-[11px] text-foreground-dim truncate text-right">
          Chris Farrell
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
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
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
import { setActiveScene, clearActiveScene, useActiveScene } from "@/lib/active-scenes";

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
  const activeScene = useActiveScene(room.room);

  // Build a minimal stat line — only show what's actually happening
  const stats: string[] = [];
  if (anyOn) stats.push(`${onLights.length} light${onLights.length === 1 ? "" : "s"} on`);
  if (playing) stats.push("Audio");
  if (room.scenes.length > 0) stats.push(`${room.scenes.length} scenes`);
  const idleLabel = room.lights.length === 0 ? "No fixtures" : "Quiet";

  return (
    <button
      onClick={onOpenDetails}
      aria-label={`Open ${room.room} controls`}
      className={`panel ${accent ? "panel-accent" : ""} p-5 text-left w-full transition-colors hover:border-hairline-strong group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-medium tracking-[0.04em] truncate">{room.room}</h3>
            <StatusDot state={occupied ? "info" : "idle"} />
          </div>
          <div className="label mt-1.5 truncate">
            {occupied ? "Occupied" : "Vacant"}
          </div>
          {activeScene && (
            <div
              className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 border border-odin-accent/60 bg-odin-accent/5"
              style={{ boxShadow: "0 0 12px hsl(var(--accent) / 0.2) inset" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-odin-accent"
                style={{ boxShadow: "0 0 6px hsl(var(--accent))" }}
              />
              <span className="mono text-[9px] uppercase tracking-[0.18em] text-odin-accent truncate max-w-[140px]">
                {activeScene.sceneName}
              </span>
            </div>
          )}
        </div>
        <ChevronRight
          className="w-4 h-4 text-foreground-mute group-hover:text-odin-accent transition-colors shrink-0 mt-0.5"
          strokeWidth={1.5}
        />
      </div>

      {/* Minimal stat row — just enough to surface what's happening */}
      <div className="flex items-center justify-between gap-3">
        <div className="mono text-[10px] uppercase tracking-[0.14em] text-foreground-mute truncate">
          {stats.length > 0 ? stats.join(" · ") : idleLabel}
        </div>
        {anyOn && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-16 h-[3px] bg-surface-inset relative overflow-hidden">
              <div
                className="h-full transition-[width] duration-300"
                style={{
                  width: `${avgLevel}%`,
                  background: "linear-gradient(90deg, hsl(var(--accent-dim)), hsl(var(--accent)))",
                  boxShadow: avgLevel > 0 ? "0 0 8px hsl(var(--accent) / 0.5)" : "none",
                }}
              />
            </div>
            <span className="mono text-[10px] text-odin-accent num w-8 text-right">{avgLevel}%</span>
          </div>
        )}
      </div>
    </button>
  );
};

/* ——— Full room details tray (scenes + per-fixture controls + media) ——— */

/* ——— Premium room drill-down (full-screen overlay) ——— */

const DeviceCard = ({
  icon: Icon,
  name,
  on,
  level,
  onToggle,
  onLevelChange,
  unit,
}: {
  icon: any;
  name: string;
  on: boolean;
  level?: number; // 0-100, omit for non-dimmable
  onToggle: () => void;
  onLevelChange?: (pct: number) => void;
  unit?: string;
}) => {
  return (
    <div
      className={`relative panel p-5 transition-colors ${
        on ? "border-odin-accent/60" : "border-hairline hover:border-hairline-strong"
      }`}
      style={{
        background: on
          ? "linear-gradient(180deg, hsl(32 88% 58% / 0.05), hsl(32 88% 58% / 0.01))"
          : "var(--grad-panel)",
        boxShadow: on ? "0 0 32px hsl(var(--accent) / 0.10) inset" : undefined,
      }}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          aria-label={`Toggle ${name}`}
          className={`w-11 h-11 grid place-items-center border transition-colors shrink-0 ${
            on
              ? "border-odin-accent/70 text-odin-accent"
              : "border-hairline-strong text-foreground-mute hover:text-foreground"
          }`}
          style={
            on
              ? { boxShadow: "0 0 18px hsl(var(--accent) / 0.25) inset" }
              : undefined
          }
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.25} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium tracking-[0.02em] truncate">{name}</div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground-mute mt-1 num">
            {on ? (level !== undefined ? `${level}${unit ?? "%"}` : "On") : "Off"}
          </div>
        </div>
      </div>

      {onLevelChange && (
        <div className="mt-5">
          <Slider
            value={[level ?? 0]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => onLevelChange(v[0])}
          />
        </div>
      )}
    </div>
  );
};

const RoomDetailsTray = ({
  room,
  onClose,
}: {
  room: RoomLive | null;
  onClose: () => void;
}) => {
  const { callService, states } = useHa();
  const activeScene = useActiveScene(room?.room ?? "");
  if (!room) return null;

  const onLights = room.lights.filter(isOn);
  const anyOn = onLights.length > 0;
  const totalBrightness = onLights.reduce(
    (acc: number, l) => acc + ((l.attributes?.brightness as number) ?? 0),
    0,
  );
  const avgLevel = onLights.length
    ? Math.round((totalBrightness / onLights.length / 255) * 100)
    : 0;

  const occupied = room.occupancy?.state === "on";

  const toggleAll = () => {
    clearActiveScene(room.room);
    callService("light", anyOn ? "turn_off" : "turn_on", {
      entity_id: room.lights.map((l) => l.entity_id),
    });
  };

  const setMasterLevel = (pct: number) => {
    clearActiveScene(room.room);
    callService("light", "turn_on", {
      entity_id: room.lights.map((l) => l.entity_id),
      brightness_pct: pct,
    });
  };

  const toggleOne = (entity_id: string, on: boolean) => {
    clearActiveScene(room.room);
    callService("light", on ? "turn_off" : "turn_on", { entity_id });
  };

  const setLevel = (entity_id: string, pct: number) => {
    clearActiveScene(room.room);
    callService("light", "turn_on", { entity_id, brightness_pct: pct });
  };

  const engageScene = (entity: string, name: string) => {
    setActiveScene(room.room, entity, name);
    callService("scene", "turn_on", { entity_id: entity });
  };

  const mp = room.mediaPlayer;
  const mpVol = mp ? Math.round(((mp.attributes?.volume_level as number) ?? 0) * 100) : 0;
  const mpTitle = (mp?.attributes?.media_title as string | undefined) ?? friendly(mp ?? ({} as any));
  const mpArtist = (mp?.attributes?.media_artist as string | undefined) ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(14px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1280px] h-full bg-background flex flex-col border-x border-hairline-strong"
      >
        {/* Header — generous, editorial */}
        <div className="flex items-end justify-between px-12 pt-10 pb-8 border-b border-hairline shrink-0">
          <div className="min-w-0">
            <div className="mono text-[10px] uppercase tracking-[0.3em] text-foreground-mute">
              Room Control
            </div>
            <h1 className="text-[44px] font-light tracking-[-0.01em] mt-3 leading-none">
              {room.room}
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <StatusDot state={occupied ? "info" : "idle"} />
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute num">
                {occupied ? "Occupied" : "Vacant"} · {onLights.length}/{room.lights.length} fixtures · {avgLevel}% avg
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close room controls"
            className="w-11 h-11 grid place-items-center text-foreground-dim hover:text-foreground border border-hairline-strong hover:border-odin-accent transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-12 py-10 space-y-10">
            {/* Scenes — refined chips (top of drill-down for fast access) */}
            {room.scenes.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-5">
                  <Label>Scenes</Label>
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute num">
                    {room.scenes.length} curated
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {room.scenes.map((s) => {
                    const isActive = activeScene?.sceneEntity === s.entity;
                    return (
                    <button
                      key={s.entity}
                      onClick={() => engageScene(s.entity, s.name)}
                      className={`group panel p-5 text-left transition-colors ${isActive ? "border-odin-accent bg-odin-accent/5" : "hover:border-odin-accent"}`}
                      style={isActive ? { boxShadow: "0 0 24px hsl(var(--accent) / 0.25) inset" } : undefined}
                    >
                      <div className={`text-[10px] mono uppercase tracking-[0.24em] mb-3 transition-colors ${isActive ? "text-odin-accent" : "text-foreground-mute group-hover:text-odin-accent"}`}>
                        {isActive ? "● Active Scene" : "Scene"}
                      </div>
                      <div className="text-[15px] font-medium tracking-[0.02em] truncate">
                        {s.name}
                      </div>
                    </button>
                  );})}
                </div>
              </section>
            )}

            {/* Master row */}
            {room.lights.length > 0 && (
              <section>
                <div className="flex items-baseline justify-between mb-5">
                  <Label>Master</Label>
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute num">
                    Brightness · {avgLevel}%
                  </span>
                </div>
                <div
                  className="panel p-6 flex items-center gap-6"
                  style={{
                    background: anyOn
                      ? "linear-gradient(180deg, hsl(32 88% 58% / 0.06), hsl(32 88% 58% / 0.01))"
                      : "var(--grad-panel)",
                    boxShadow: anyOn ? "0 0 48px hsl(var(--accent) / 0.10) inset" : undefined,
                  }}
                >
                  <button
                    onClick={toggleAll}
                    className={`w-14 h-14 grid place-items-center border transition-colors shrink-0 ${
                      anyOn
                        ? "border-odin-accent/70 text-odin-accent"
                        : "border-hairline-strong text-foreground-mute hover:text-foreground"
                    }`}
                    style={
                      anyOn
                        ? { boxShadow: "0 0 22px hsl(var(--accent) / 0.30) inset" }
                        : undefined
                    }
                  >
                    <Power className="w-5 h-5" strokeWidth={1.25} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium tracking-[0.02em]">
                      {room.room} Lights
                    </div>
                    <div className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute mt-1 num">
                      {anyOn ? `${onLights.length} on` : "All off"}
                    </div>
                    <div className="mt-4">
                      <Slider
                        value={[avgLevel]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(v) => setMasterLevel(v[0])}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Fixtures grid — hidden when only a single fixture (Master already controls it) */}
            {(() => {
              const individualLights = room.lights.filter((l) => {
                const id = l.entity_id.toLowerCase();
                const fname = (l.attributes?.friendly_name ?? "").toLowerCase();
                const roomWords = room.room.toLowerCase().split(/\s+/);
                const roomSlug = room.room.toLowerCase().replace(/\s+/g, "_");
                const roomCompact = room.room.toLowerCase().replace(/\s+/g, "");
                const isAllSuffix = /(_all|_lights|_group)$/.test(id);
                const isRoomGroup =
                  id === `light.${roomSlug}` || id === `light.${roomCompact}`;
                // Also catch group entities matching any word in a multi-word room name
                // (e.g. "light.bathroom" inside "Upstairs Bathroom")
                const isWordGroup = roomWords.some((w) => id === `light.${w}`);
                const isFriendlyAll =
                  fname === `${room.room.toLowerCase()} lights` ||
                  fname === `${room.room.toLowerCase()} all` ||
                  fname.endsWith(" all") ||
                  roomWords.some((w) => fname === `${w} lights`);
                return !(isAllSuffix || isRoomGroup || isWordGroup || isFriendlyAll);
              });
              if (individualLights.length <= 1) return null;
              return (
                <section>
                  <div className="flex items-baseline justify-between mb-5">
                    <Label>Fixtures</Label>
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute num">
                      Tap icon · drag to dim
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {individualLights.map((l) => {
                      const on = isOn(l);
                      const rawBrightness = (l.attributes?.brightness as number) ?? 0;
                      const level = Math.round((rawBrightness / 255) * 100);
                      return (
                        <DeviceCard
                          key={l.entity_id}
                          icon={Lightbulb}
                          name={friendly(l)}
                          on={on}
                          level={on ? level : 0}
                          onToggle={() => toggleOne(l.entity_id, on)}
                          onLevelChange={(v) => setLevel(l.entity_id, v)}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })()}

            {/* Other devices */}
            {(() => {
              const isBedroom = room.room === "Bedroom";
              const isLivingRoom = room.room === "Living Room";
              const hideAuto = isBedroom || isLivingRoom;
              const fans = hideAuto ? [] : room.fans;
              const switches = hideAuto ? [] : room.switches;
              const covers = hideAuto ? [] : room.covers;

              // Bedroom: only show Bedroom Fan (switch) + Bedroom Speaker (media_player w/ volume)
              const bedroomFanSwitch = isBedroom
                ? states["switch.bedroom_fan_smart_plug"]
                : undefined;
              const bedroomSpeaker = isBedroom
                ? states["media_player.bedroom"]
                : undefined;

              const total =
                switches.length +
                fans.length +
                covers.length +
                (bedroomFanSwitch ? 1 : 0) +
                (bedroomSpeaker ? 1 : 0);

              if (total === 0) return null;

              return (
                <section>
                  <div className="flex items-baseline justify-between mb-5">
                    <Label>Other Devices</Label>
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute num">
                      {total} items
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {switches.map((s) => {
                      const on = s.state === "on";
                      return (
                        <DeviceCard
                          key={s.entity_id}
                          icon={Power}
                          name={friendly(s)}
                          on={on}
                          onToggle={() =>
                            callService("switch", on ? "turn_off" : "turn_on", {
                              entity_id: s.entity_id,
                            })
                          }
                        />
                      );
                    })}
                    {fans.map((f) => {
                      const on = f.state === "on";
                      const pct = (f.attributes?.percentage as number | undefined) ?? (on ? 100 : 0);
                      return (
                        <DeviceCard
                          key={f.entity_id}
                          icon={Wind}
                          name={friendly(f)}
                          on={on}
                          level={pct}
                          onToggle={() =>
                            callService("fan", on ? "turn_off" : "turn_on", {
                              entity_id: f.entity_id,
                            })
                          }
                          onLevelChange={(v) =>
                            callService("fan", "set_percentage", {
                              entity_id: f.entity_id,
                              percentage: v,
                            })
                          }
                        />
                      );
                    })}
                    {covers.map((c) => {
                      const open = c.state === "open" || c.state === "opening";
                      return (
                        <DeviceCard
                          key={c.entity_id}
                          icon={DoorClosed}
                          name={friendly(c)}
                          on={open}
                          onToggle={() =>
                            callService("cover", open ? "close_cover" : "open_cover", {
                              entity_id: c.entity_id,
                            })
                          }
                        />
                      );
                    })}
                    {bedroomFanSwitch && (() => {
                      const on = bedroomFanSwitch.state === "on";
                      return (
                        <DeviceCard
                          key={bedroomFanSwitch.entity_id}
                          icon={Wind}
                          name="Bedroom Fan"
                          on={on}
                          onToggle={() =>
                            callService("switch", on ? "turn_off" : "turn_on", {
                              entity_id: bedroomFanSwitch.entity_id,
                            })
                          }
                        />
                      );
                    })()}
                    {bedroomSpeaker && (() => {
                      const on =
                        bedroomSpeaker.state !== "off" &&
                        bedroomSpeaker.state !== "unavailable" &&
                        bedroomSpeaker.state !== "standby";
                      const vol = Math.round(
                        ((bedroomSpeaker.attributes?.volume_level as number) ?? 0) * 100,
                      );
                      return (
                        <DeviceCard
                          key={bedroomSpeaker.entity_id}
                          icon={Volume2}
                          name="Bedroom Speaker"
                          on={on}
                          level={vol}
                          onToggle={() =>
                            callService(
                              "media_player",
                              on ? "turn_off" : "turn_on",
                              { entity_id: bedroomSpeaker.entity_id },
                            )
                          }
                          onLevelChange={(v) =>
                            callService("media_player", "volume_set", {
                              entity_id: bedroomSpeaker.entity_id,
                              volume_level: v / 100,
                            })
                          }
                        />
                      );
                    })()}
                  </div>
                </section>
              );
            })()}

            {/* Sensors — door, motion, climate readings, cameras */}
            {(() => {
              const doors = (room as any).doorSensors ?? [];
              const motions = (room as any).motionSensors ?? [];
              const climateZones = (room as any).climates ?? [];
              const roomSensors = (room as any).sensors ?? [];
              const roomCameras = (room as any).cameras ?? [];
              const total =
                doors.length + motions.length + climateZones.length + roomSensors.length + roomCameras.length;
              if (total === 0) return null;

              const formatVal = (s: any) => {
                const unit = s.attributes?.unit_of_measurement ?? "";
                const v = s.state;
                if (v === "unavailable" || v === "unknown") return "—";
                const num = Number(v);
                return Number.isFinite(num) ? `${Math.round(num * 10) / 10}${unit}` : `${v}${unit ? " " + unit : ""}`;
              };

              return (
                <section>
                  <div className="flex items-baseline justify-between mb-5">
                    <Label>Sensors</Label>
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute num">
                      {total} reporting
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {doors.map((d: any) => {
                      const open = d.state === "on";
                      // Interior doors only in room drill-down → warn (yellow) when open, never red
                      return (
                        <div key={d.entity_id} className="panel p-4 flex items-center gap-3">
                          <DoorClosed className="w-4 h-4 text-foreground-mute shrink-0" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] truncate">{friendly(d)}</div>
                            <div className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute mt-0.5">
                              {open ? "Open" : "Closed"}
                            </div>
                          </div>
                          <StatusDot state={open ? "warn" : "ok"} />
                        </div>
                      );
                    })}
                    {motions.map((m: any) => {
                      const active = m.state === "on";
                      return (
                        <div key={m.entity_id} className="panel p-4 flex items-center gap-3">
                          <Activity className="w-4 h-4 text-foreground-mute shrink-0" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] truncate">{friendly(m)}</div>
                            <div className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute mt-0.5">
                              {active ? "Detected" : "Clear"}
                            </div>
                          </div>
                          <StatusDot state={active ? "info" : "idle"} />
                        </div>
                      );
                    })}
                    {climateZones.map((c: any) => {
                      const temp = c.attributes?.current_temperature;
                      const hum = c.attributes?.current_humidity;
                      return (
                        <div key={c.entity_id} className="panel p-4 flex items-center gap-3">
                          <Thermometer className="w-4 h-4 text-foreground-mute shrink-0" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] truncate">{friendly(c)}</div>
                            <div className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute mt-0.5 num">
                              {temp != null ? `${temp}°` : "—"}{hum != null ? ` · ${hum}% RH` : ""}
                            </div>
                          </div>
                          <StatusDot state={c.state === "off" ? "idle" : "active"} />
                        </div>
                      );
                    })}
                    {roomSensors.map((s: any) => (
                      <div key={s.entity_id} className="panel p-4 flex items-center gap-3">
                        <Activity className="w-4 h-4 text-foreground-mute shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] truncate">{friendly(s)}</div>
                          <div className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute mt-0.5 num">
                            {formatVal(s)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {roomCameras.map((cam: any) => (
                      <div key={cam.entity_id} className="panel p-4 flex items-center gap-3">
                        <Video className="w-4 h-4 text-foreground-mute shrink-0" strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] truncate">{friendly(cam)}</div>
                          <div className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute mt-0.5">
                            {cam.state}
                          </div>
                        </div>
                        <StatusDot state={cam.state === "recording" || cam.state === "streaming" ? "info" : "idle"} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}


            {mp && (
              <section>
                <div className="flex items-baseline justify-between mb-5">
                  <Label>Audio</Label>
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute num">
                    {mp.state}
                  </span>
                </div>
                <div className="panel p-6 flex items-center gap-6">
                  <div className="w-20 h-20 bg-surface-inset border border-hairline-strong shrink-0 relative overflow-hidden">
                    {(mp.attributes?.entity_picture as string) ? (
                      <img
                        src={mp.attributes?.entity_picture as string}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <Music2 className="w-7 h-7 text-foreground-mute" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium tracking-[0.02em] truncate">
                      {mpTitle}
                    </div>
                    {mpArtist && (
                      <div className="text-[12px] text-foreground-dim mt-0.5 truncate">
                        {mpArtist}
                      </div>
                    )}
                    <div className="mono text-[10px] uppercase tracking-[0.2em] text-foreground-mute mt-1 num">
                      {friendly(mp)}
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <Volume2 className="w-3.5 h-3.5 text-foreground-mute shrink-0" strokeWidth={1.5} />
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
                      <span className="mono text-[10px] text-foreground-dim num w-8 text-right">
                        {mpVol}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        callService("media_player", "media_previous_track", {
                          entity_id: mp.entity_id,
                        })
                      }
                      className="w-10 h-10 grid place-items-center text-foreground-dim hover:text-foreground border border-hairline-strong hover:border-odin-accent transition-colors"
                    >
                      <SkipBack className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() =>
                        callService("media_player", "media_play_pause", {
                          entity_id: mp.entity_id,
                        })
                      }
                      className={`w-12 h-12 grid place-items-center border transition-colors ${
                        mp.state === "playing"
                          ? "border-odin-accent text-odin-accent"
                          : "border-hairline-strong text-foreground hover:border-odin-accent"
                      }`}
                      style={
                        mp.state === "playing"
                          ? { boxShadow: "0 0 18px hsl(var(--accent) / 0.30) inset" }
                          : undefined
                      }
                    >
                      {mp.state === "playing" ? (
                        <Pause className="w-4 h-4" strokeWidth={1.5} />
                      ) : (
                        <Play className="w-4 h-4" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        callService("media_player", "media_next_track", {
                          entity_id: mp.entity_id,
                        })
                      }
                      className="w-10 h-10 grid place-items-center text-foreground-dim hover:text-foreground border border-hairline-strong hover:border-odin-accent transition-colors"
                    >
                      <SkipForward className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TV_ENTITY_ID = "media_player.tlc_smart_tv";

const NowPlaying = () => {
  const { mediaPlayers } = useDiscovery();
  const { states, callService } = useHa();
  const [showSources, setShowSources] = useState(false);

  // Prefer the configured TV entity; fall back to anything currently playing, then first available.
  const tv = states[TV_ENTITY_ID];
  const playing =
    tv ??
    mediaPlayers.find((m) => m.state === "playing") ??
    mediaPlayers[0];

  // Android Debug Bridge media_player provides richer metadata (active app, title,
  // artist, position, artwork) than the Sony TV remote-driven media_player.
  // Discover any media_player exposed by the ADB integration in the same area.
  const adb = useMemo(() => {
    const candidates = Object.values(states).filter(
      (s) =>
        s.entity_id.startsWith("media_player.") &&
        (/android[_ ]?tv/i.test(s.entity_id) ||
          /android[_ ]?tv/i.test((s.attributes?.friendly_name as string) ?? "") ||
          /androidtv/i.test((s.attributes?.integration as string) ?? "")),
    );
    // Prefer one that's actively reporting media or app info.
    return (
      candidates.find(
        (s) =>
          s.attributes?.media_title ||
          s.attributes?.app_name ||
          s.attributes?.app_id ||
          s.state === "playing",
      ) ?? candidates[0]
    );
  }, [states]);

  if (!playing) {
    return (
      <Panel>
        <Label>Now Playing</Label>
        <div className="text-[12px] text-foreground-mute mt-2">No media players</div>
      </Panel>
    );
  }

  const baseA = playing.attributes ?? {};
  const adbA = adb?.attributes ?? {};
  // Merge: ADB attributes win where present, falling back to the primary entity.
  const pick = <T,>(key: string): T | undefined =>
    (adbA[key] ?? baseA[key]) as T | undefined;
  const a: Record<string, any> = { ...baseA, ...adbA };

  const vol = Math.round((((pick<number>("volume_level")) ?? 0) as number) * 100);
  const muted = (pick<boolean>("is_volume_muted")) ?? false;
  // Playback state: prefer ADB (more accurate for active app), fall back to primary.
  const effectiveState =
    adb && (adb.state === "playing" || adb.state === "paused")
      ? adb.state
      : playing.state;
  const isPlaying = effectiveState === "playing";
  const isOff =
    playing.state === "off" ||
    playing.state === "standby" ||
    playing.state === "unavailable";
  const isTv =
    playing.entity_id === TV_ENTITY_ID ||
    (baseA.device_class as string) === "tv" ||
    !!adb;
  const sources = (baseA.source_list as string[] | undefined) ?? [];
  const currentSource =
    (pick<string>("app_name")) ??
    (pick<string>("source")) ??
    (pick<string>("app_id"));
  const supportedFeatures = (a.supported_features as number) ?? 0;
  // Bitmask helpers (HA media_player feature flags)
  const SUPPORT_PAUSE = 1, SUPPORT_PLAY = 16384, SUPPORT_STOP = 4096,
        SUPPORT_PREV = 16, SUPPORT_NEXT = 32, SUPPORT_TURN_ON = 128,
        SUPPORT_TURN_OFF = 256, SUPPORT_VOL_SET = 4, SUPPORT_VOL_STEP = 1024,
        SUPPORT_VOL_MUTE = 8, SUPPORT_SELECT_SOURCE = 2048;
  const has = (f: number) => (supportedFeatures & f) === f;

  // Android package → friendly app name mapping
  const APP_PACKAGES: Record<string, string> = {
    "com.google.android.youtube.tv": "YouTube",
    "com.google.android.youtube.tvkids": "YouTube Kids",
    "com.netflix.ninja": "Netflix",
    "com.disney.disneyplus": "Disney+",
    "com.amazon.amazonvideo.livingroom": "Prime Video",
    "com.plexapp.android": "Plex",
    "com.spotify.tv.android": "Spotify",
    "com.tcl.tv": "Live TV",
    "com.google.android.tvlauncher": "Home",
  };
  const friendlyApp = (raw?: string) => {
    if (!raw) return undefined;
    if (APP_PACKAGES[raw]) return APP_PACKAGES[raw];
    return /\./.test(raw) ? raw.split(".").slice(-1)[0] : raw;
  };

  const svc = (service: string, data: Record<string, unknown> = {}) =>
    callService("media_player", service, { entity_id: playing.entity_id, ...data });
  const remote = (command: string) =>
    callService("remote", "send_command", { entity_id: "remote.tlc_smart_tv", command });
  const launchApp = (pkg: string) => {
    if (adb) {
      callService("media_player", "play_media", {
        entity_id: adb.entity_id,
        media_content_type: "app",
        media_content_id: pkg,
      });
    } else {
      callService("remote", "turn_on", {
        entity_id: "remote.tlc_smart_tv",
        activity: pkg,
      });
    }
  };

  const appName = pick<string>("app_name") ?? friendlyApp(currentSource);
  const mediaTitle = pick<string>("media_title");
  const title = mediaTitle ?? appName ?? (isOff ? "Off" : "TCL Smart TV");
  const subtitle =
    (pick<string>("media_artist")) ??
    (pick<string>("media_series_title")) ??
    (mediaTitle && appName ? appName : "");

  const position = pick<number>("media_position");
  const duration = pick<number>("media_duration");
  const showProgress =
    typeof position === "number" && typeof duration === "number" && duration > 0;
  const progressPct = showProgress ? Math.min(100, (position! / duration!) * 100) : 0;
  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };
  const artwork = pick<string>("entity_picture");

  const APP_LAUNCHERS = [
    { name: "YouTube", pkg: "com.google.android.youtube.tv" },
    { name: "Netflix", pkg: "com.netflix.ninja" },
    { name: "Disney+", pkg: "com.disney.disneyplus" },
    { name: "Plex", pkg: "com.plexapp.android" },
    { name: "Spotify", pkg: "com.spotify.tv.android" },
  ];

  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <Label>{isTv ? "TV · " : "Now Playing · "}{friendly(playing)}</Label>
        <span className="mono text-[10px] text-odin-accent uppercase">{playing.state}</span>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 bg-surface-inset border border-hairline-strong shrink-0 relative overflow-hidden">
          {artwork ? (
            <img src={artwork} alt="" className="w-full h-full object-cover" />
          ) : isTv ? (
            <div className="absolute inset-0 grid place-items-center">
              <Tv className="w-6 h-6 text-foreground-mute" strokeWidth={1.25} />
            </div>
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(28 60% 35%), hsl(220 30% 12%))" }} />
          )}
          <div className="absolute inset-0 scanline" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium truncate">{title}</div>
          <div className="text-[12px] text-foreground-dim truncate">
            {subtitle || (isTv && !isOff ? `${appName ?? "TCL Smart TV"} · ${effectiveState}` : "")}
          </div>
        </div>
        {(has(SUPPORT_TURN_ON) || has(SUPPORT_TURN_OFF)) && (
          <button
            onClick={() => svc(isOff ? "turn_on" : "turn_off")}
            className={`w-9 h-9 grid place-items-center btn-tactile ${!isOff ? "active" : ""}`}
            title={isOff ? "Turn on" : "Turn off"}
          >
            <Power className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Progress bar — only when both position and duration are reported */}
      {showProgress && (
        <div className="mb-4">
          <div className="h-px bg-surface-inset relative">
            <div
              className="h-px bg-odin-accent"
              style={{ width: `${progressPct}%`, boxShadow: "0 0 8px hsl(var(--accent))" }}
            />
          </div>
          <div className="flex justify-between mono text-[10px] text-foreground-mute mt-1.5 num">
            <span>{fmtTime(position!)}</span>
            <span>{fmtTime(duration!)}</span>
          </div>
        </div>
      )}

      {/* Transport + volume */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {has(SUPPORT_PREV) && (
            <button onClick={() => svc("media_previous_track")} className="w-8 h-8 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
              <SkipBack className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
          {(has(SUPPORT_PLAY) || has(SUPPORT_PAUSE)) && (
            <button onClick={() => svc("media_play_pause")} className={`w-10 h-10 grid place-items-center btn-tactile ${isPlaying ? "active" : ""}`}>
              {isPlaying ? <Pause className="w-4 h-4" strokeWidth={1.5} /> : <Play className="w-4 h-4" strokeWidth={1.5} />}
            </button>
          )}
          {has(SUPPORT_NEXT) && (
            <button onClick={() => svc("media_next_track")} className="w-8 h-8 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
              <SkipForward className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 ml-4">
          {has(SUPPORT_VOL_MUTE) && (
            <button
              onClick={() => svc("volume_mute", { is_volume_muted: !muted })}
              className="w-7 h-7 grid place-items-center text-foreground-dim hover:text-foreground transition-colors"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Volume2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
            </button>
          )}
          {has(SUPPORT_VOL_STEP) && (
            <>
              <button onClick={() => svc("volume_down")} className="w-7 h-7 grid place-items-center text-foreground-dim hover:text-foreground border border-hairline-strong/60 transition-colors" title="Vol -">
                <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <button onClick={() => svc("volume_up")} className="w-7 h-7 grid place-items-center text-foreground-dim hover:text-foreground border border-hairline-strong/60 transition-colors" title="Vol +">
                <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </>
          )}
          {has(SUPPORT_VOL_SET) && (
            <Slider
              value={[vol]}
              min={0}
              max={100}
              step={1}
              onValueChange={(v) => svc("volume_set", { volume_level: v[0] / 100 })}
              className="flex-1"
            />
          )}
          <span className="mono text-[10px] text-foreground-dim num w-7 text-right">{muted ? "—" : vol}</span>
        </div>
      </div>

      {/* TV: source picker + d-pad */}
      {isTv && !isOff && (
        <>
          {has(SUPPORT_SELECT_SOURCE) && sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-hairline/60">
              <button
                onClick={() => setShowSources((s) => !s)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="label">Source</span>
                <span className="mono text-[11px] text-foreground-dim truncate max-w-[60%]">
                  {currentSource ?? "—"} {showSources ? "▴" : "▾"}
                </span>
              </button>
              {showSources && (
                <div className="mt-2 max-h-44 overflow-y-auto grid grid-cols-2 gap-1.5">
                  {sources.map((src) => (
                    <button
                      key={src}
                      onClick={() => {
                        svc("select_source", { source: src });
                        setShowSources(false);
                      }}
                      className={`text-[12px] px-2.5 py-1.5 border border-hairline-strong/60 hover:border-odin-accent text-left truncate transition-colors ${
                        src === currentSource ? "bg-surface-raised text-foreground" : "text-foreground-dim"
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-hairline/60 flex items-center justify-between gap-4">
            <span className="label">Remote</span>
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-[108px]">
              <div />
              <button onClick={() => remote("DPAD_UP")} className="w-8 h-8 grid place-items-center btn-tactile"><ChevronUp className="w-4 h-4" strokeWidth={1.5} /></button>
              <div />
              <button onClick={() => remote("DPAD_LEFT")} className="w-8 h-8 grid place-items-center btn-tactile"><ChevronLeft className="w-4 h-4" strokeWidth={1.5} /></button>
              <button onClick={() => remote("DPAD_CENTER")} className="w-8 h-8 grid place-items-center btn-tactile active"><CornerDownLeft className="w-3.5 h-3.5" strokeWidth={1.5} /></button>
              <button onClick={() => remote("DPAD_RIGHT")} className="w-8 h-8 grid place-items-center btn-tactile"><ChevronRight className="w-4 h-4" strokeWidth={1.5} /></button>
              <div />
              <button onClick={() => remote("DPAD_DOWN")} className="w-8 h-8 grid place-items-center btn-tactile"><ChevronDown className="w-4 h-4" strokeWidth={1.5} /></button>
              <div />
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => remote("BACK")} className="px-2.5 h-8 grid place-items-center btn-tactile text-[10px] tracking-[0.15em]"><ArrowLeft className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />BACK</button>
              <button onClick={() => remote("HOME")} className="px-2.5 h-8 grid place-items-center btn-tactile text-[10px] tracking-[0.15em]"><Home className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />HOME</button>
            </div>
          </div>

          {/* App launchers */}
          <div className="mt-4 pt-4 border-t border-hairline/60">
            <div className="label mb-2">Apps</div>
            <div className="grid grid-cols-5 gap-1.5">
              {APP_LAUNCHERS.map((app) => {
                const active = appName === app.name;
                return (
                  <button
                    key={app.pkg}
                    onClick={() => launchApp(app.pkg)}
                    className={`text-[11px] px-2 py-1.5 border border-hairline-strong/60 hover:border-odin-accent text-center truncate transition-colors ${
                      active ? "bg-surface-raised text-foreground border-odin-accent" : "text-foreground-dim"
                    }`}
                    title={`Launch ${app.name}`}
                  >
                    {app.name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
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
  const { alarm, doorSensors, garageCover } = useDiscovery();
  const armState = alarm?.state ?? "unknown";
  const armed = armState.startsWith("armed");
  const EXTERIOR_IDS = new Set([
    "binary_sensor.front_door_contact",
    "binary_sensor.back_door",
  ]);
  const doorsOnly = doorSensors.filter(
    (s) => s.attributes?.device_class === "door" || /door/i.test(friendly(s)),
  );
  const exteriorOrder = (id: string) => {
    if (id === "binary_sensor.front_door_contact") return 0;
    if (id === "binary_sensor.back_door") return 1;
    return 2; // garage last
  };
  const exteriorDoors = doorsOnly.filter((s) => EXTERIOR_IDS.has(s.entity_id));
  const exterior: Array<{
    id: string;
    name: string;
    open: boolean;
    label: string;
  }> = [
    ...exteriorDoors.map((s) => ({
      id: s.entity_id,
      name:
        friendly(s).replace(/\bsensors?\b/gi, "").replace(/\s{2,}/g, " ").trim() ||
        friendly(s),
      open: s.state === "on",
      label: s.state === "on" ? "OPEN" : "CLOSED",
    })),
  ];
  if (garageCover) {
    const open =
      garageCover.state === "open" || garageCover.state === "opening";
    exterior.push({
      id: garageCover.entity_id,
      name: "Garage",
      open,
      label: open ? "OPEN" : "CLOSED",
    });
  }
  exterior.sort((a, b) => exteriorOrder(a.id) - exteriorOrder(b.id));

  const interior = doorsOnly.filter((s) => !EXTERIOR_IDS.has(s.entity_id));

  const renderExterior = (e: (typeof exterior)[number]) => (
    <div
      key={e.id}
      className="flex items-center gap-2.5 py-1.5 border-b border-hairline/60"
    >
      <DoorClosed className="w-3.5 h-3.5 text-foreground-mute shrink-0" strokeWidth={1.5} />
      <span className="text-[12px] flex-1 min-w-0 truncate">{e.name}</span>
      <StatusDot state={e.open ? "alert" : "ok"} />
      <span className="mono text-[10px] text-foreground-dim w-16 text-right shrink-0">
        {e.label}
      </span>
    </div>
  );

  const renderInterior = (s: (typeof doorsOnly)[number]) => {
    const open = s.state === "on";
    const name =
      friendly(s).replace(/\bsensors?\b/gi, "").replace(/\s{2,}/g, " ").trim() ||
      friendly(s);
    return (
      <div
        key={s.entity_id}
        className="flex items-center gap-2.5 py-1.5 border-b border-hairline/60"
      >
        <DoorClosed className="w-3.5 h-3.5 text-foreground-mute shrink-0" strokeWidth={1.5} />
        <span className="text-[12px] flex-1 min-w-0 truncate">{name}</span>
        <StatusDot state={open ? "warn" : "ok"} />
        <span className="mono text-[10px] text-foreground-dim w-16 text-right shrink-0">
          {open ? "OPEN" : "CLOSED"}
        </span>
      </div>
    );
  };

  const sectionLabel = (text: string) => (
    <div
      key={`label-${text}`}
      className="mono text-[9px] tracking-[0.18em] text-foreground-mute uppercase pt-3 pb-1.5 first:pt-0"
    >
      {text}
    </div>
  );

  return (
    <Panel>
      <div className="flex items-center justify-between mb-2">
        <Label>Perimeter</Label>
        <div className="flex items-center gap-2">
          <Lock className={`w-3 h-3 ${armed ? "text-odin-ok" : "text-foreground-dim"}`} strokeWidth={1.5} />
          <span className={`mono text-[10px] uppercase ${armed ? "text-odin-ok" : "text-foreground-dim"}`}>
            {armState.replace(/_/g, " ")}
          </span>
        </div>
      </div>
      {exterior.length === 0 && interior.length === 0 ? (
        <div className="text-[12px] text-foreground-mute py-2">No door sensors discovered</div>
      ) : (
        <div className="grid grid-cols-1">
          {exterior.length > 0 && sectionLabel("Exterior")}
          {exterior.map(renderExterior)}
          {interior.length > 0 && sectionLabel("Interior")}
          {interior.map(renderInterior)}
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
    ? new Date(garageCover.last_changed).toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, month: "short", day: "numeric" })
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
          <StatusDot state={open ? "alert" : "ok"} />
          <span className={`mono text-[10px] uppercase ${open ? "text-odin-alert" : "text-foreground-mute"}`}>
            {garageCover.state}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-4 border-b border-hairline">
        <div className="w-14 h-14 border border-hairline-strong grid place-items-center bg-surface-inset relative">
          <Car className={`w-6 h-6 ${open ? "text-odin-alert" : "text-foreground-dim"}`} strokeWidth={1.25} />
          {open && <div className="absolute inset-0 border border-odin-alert/60" style={{ boxShadow: "0 0 14px hsl(var(--alert) / 0.3) inset" }} />}
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
  const { cameraStream } = useHa();
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!doorbell) return;
    let cancelled = false;
    cameraStream(doorbell.entity_id).then((s) => {
      if (cancelled) return;
      if (s) setStreamUrl(s.url);
      else setErr("Stream unavailable");
    });
    return () => { cancelled = true; };
  }, [doorbell?.entity_id, cameraStream]);

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
          <span className={`dot ${live ? "text-odin-alert" : "text-foreground-mute"}`} />
          <span className={`mono text-[10px] ${live ? "text-odin-alert" : "text-foreground-mute"}`}>
            {live ? "LIVE" : err ? "OFFLINE" : "CONNECTING"}
          </span>
        </div>
      </div>
      <div className="relative aspect-[16/10] bg-surface-inset border-t border-hairline">
        {streamUrl && (
          <img
            src={streamUrl}
            alt="Doorbell live feed"
            className="w-full h-full object-cover opacity-95"
            onLoad={() => setLive(true)}
            onError={() => setErr("Stream error")}
          />
        )}
        <div className="absolute inset-0 scanline pointer-events-none" />
        {!live && !err && (
          <div className="absolute inset-0 grid place-items-center">
            <Video className="w-8 h-8 text-foreground-mute animate-pulse" strokeWidth={1} />
          </div>
        )}
        {err && (
          <div className="absolute bottom-3 left-3 mono text-[10px] text-odin-alert bg-black/60 px-1.5 py-0.5">
            {err}
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

type CalEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  calendar?: string;
  color?: string;
};

const Calendar = () => {
  const [range, setRange] = useState<"today" | "week">("today");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-events?range=${range}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${key}`, apikey: key },
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) setError(d.error);
        else setEvents(d.events ?? []);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const fmtTime = (iso: string, allDay: boolean) => {
    if (allDay) return "All day";
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };
  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // Group by day for week view
  const grouped = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const ev of events) {
      const key = new Date(ev.start).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return Array.from(map.entries());
  }, [events]);

  return (
    <Panel>
      <div className="flex items-center justify-between mb-4">
        <Label>Calendar · {range === "today" ? "Today" : "This Week"}</Label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRange(range === "today" ? "week" : "today")}
            aria-label={range === "today" ? "Show week" : "Show today"}
            className="w-7 h-7 grid place-items-center text-foreground-dim hover:text-odin-accent border border-hairline-strong hover:border-odin-accent transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-[12px] text-foreground-mute py-4">Loading…</div>
      )}
      {error && (
        <div className="text-[12px] text-odin-alert py-4 break-words">{error}</div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="text-[12px] text-foreground-mute py-4">
          No events {range === "today" ? "today" : "this week"}.
        </div>
      )}

      {!loading && !error && events.length > 0 && range === "today" && (
        <div className="space-y-3">
          {events.slice(0, 6).map((ev) => (
            <div key={ev.id} className="flex items-start gap-3">
              <div
                className="w-1 self-stretch shrink-0"
                style={{ background: ev.color ?? "hsl(var(--accent))" }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] truncate">{ev.summary}</div>
                <div className="mono text-[10px] text-foreground-mute mt-0.5 uppercase truncate">
                  {fmtTime(ev.start, ev.allDay)}
                  {ev.location ? ` · ${ev.location}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && events.length > 0 && range === "week" && (
        <div className="space-y-4 max-h-[280px] overflow-auto pr-1">
          {grouped.map(([day, evs]) => (
            <div key={day}>
              <div className="mono text-[10px] text-foreground-mute uppercase tracking-[0.18em] mb-2">
                {fmtDay(evs[0].start)}
              </div>
              <div className="space-y-2">
                {evs.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3">
                    <div
                      className="w-1 self-stretch shrink-0"
                      style={{ background: ev.color ?? "hsl(var(--accent))" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] truncate">{ev.summary}</div>
                      <div className="mono text-[10px] text-foreground-mute mt-0.5 uppercase truncate">
                        {fmtTime(ev.start, ev.allDay)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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

// ——— Activity narrator: turn raw HA state changes into plain English ———

type NarratedEvent = {
  id: string;
  icon: any;
  text: string;
  ts: number;
};

const timeAgo = (ts: number) => {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

// Map a state-change to a human sentence + icon, or null to ignore.
const narrate = (s: HaState): { icon: any; text: string } | null => {
  const id = s.entity_id;
  const st = s.state;
  const a = s.attributes ?? {};

  // Person presence
  if (id === "person.chris_farrell") {
    if (st === "home") return { icon: Home, text: "Chris arrived home" };
    if (st === "not_home" || st === "away") return { icon: ArrowLeft, text: "Chris left home" };
  }

  // Garage door
  if (id === "cover.ratgdo32disco_2930c0_door") {
    if (st === "open" || st === "opening") return { icon: ArrowUpFromLine, text: "Garage opened" };
    if (st === "closed" || st === "closing") return { icon: ArrowDownToLine, text: "Garage closed" };
  }

  // Doors
  if (id === "binary_sensor.front_door_contact" && st === "on")
    return { icon: DoorClosed, text: "Front door opened" };
  if (id === "binary_sensor.back_door" && st === "on")
    return { icon: DoorClosed, text: "Back door opened" };

  // Front door camera events
  if (id === "binary_sensor.front_door_motion" && st === "on")
    return { icon: Activity, text: "Motion detected · Front Door" };
  if (id === "binary_sensor.front_door_person_detected" && st === "on")
    return { icon: Fingerprint, text: "Person at front door" };
  if (id === "binary_sensor.front_door_vehicle_detected" && st === "on")
    return { icon: Car, text: "Vehicle at front door" };

  // Scripts
  if (id.startsWith("script.")) {
    if (st !== "on") return null;
    if (id === "script.goodnight") return { icon: Power, text: "Goodnight activated" };
    if (id === "script.wake_up") return { icon: Sun, text: "Wake Up activated" };
    if (id === "script.cinema") return { icon: Tv, text: "Cinema mode activated" };
    if (id === "script.relax") return { icon: Music2, text: "Relax activated" };
  }

  // TV
  if (id === "media_player.tlc_smart_tv") {
    if (st === "off" || st === "standby") return { icon: Tv, text: "TV off" };
    if (st === "on" || st === "playing" || st === "paused" || st === "idle")
      return { icon: Tv, text: "TV on" };
  }

  // Living room speakers (Sonos)
  if (id === "media_player.living_room_speakers_2" && st === "playing") {
    const src = a.media_title ?? a.app_name ?? a.source ?? "now playing";
    return { icon: Music2, text: `Sonos playing · ${src}` };
  }

  // Air purifier
  if (id === "fan.vital_200s_series" && st === "on")
    return { icon: Wind, text: "Air purifier on" };

  // Room lights — only react to the room "group" entity to avoid spam
  const roomLights: Record<string, string> = {
    "light.living_room": "Living Room",
    "light.kitchen": "Kitchen",
    "light.bedroom": "Bedroom",
    "light.office": "Office",
    "light.bathroom": "Bathroom",
  };
  if (roomLights[id]) {
    const room = roomLights[id];
    if (st === "on") return { icon: Lightbulb, text: `${room} lights on` };
    if (st === "off") return { icon: Lightbulb, text: `${room} lights off` };
  }

  return null;
};

const ActivityLog = () => {
  const { states } = useHa();
  const [events, setEvents] = useState<NarratedEvent[]>([]);
  const seen = useRef<Map<string, string>>(new Map());
  const seeded = useRef(false);
  const [, force] = useState(0);

  // Re-render every 30s so "time ago" stays fresh
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Watch state map for changes, narrate, prepend.
  useEffect(() => {
    const next: NarratedEvent[] = [];
    for (const s of Object.values(states)) {
      const prev = seen.current.get(s.entity_id);
      if (prev === s.state) continue;
      seen.current.set(s.entity_id, s.state);
      if (!seeded.current) continue; // don't flood feed on initial snapshot
      const n = narrate(s);
      if (!n) continue;
      const ts = s.last_changed ? new Date(s.last_changed).getTime() : Date.now();
      next.push({ id: `${s.entity_id}:${ts}`, icon: n.icon, text: n.text, ts });
    }
    if (!seeded.current) {
      // Seed feed from current snapshot's most recent narratable changes
      const seed: NarratedEvent[] = [];
      for (const s of Object.values(states)) {
        const n = narrate(s);
        if (!n || !s.last_changed) continue;
        seed.push({
          id: `${s.entity_id}:${s.last_changed}`,
          icon: n.icon,
          text: n.text,
          ts: new Date(s.last_changed).getTime(),
        });
      }
      seed.sort((a, b) => b.ts - a.ts);
      setEvents(seed.slice(0, 10));
      seeded.current = true;
      return;
    }
    if (next.length) {
      setEvents((prev) => {
        const merged = [...next.sort((a, b) => b.ts - a.ts), ...prev];
        // de-dupe by id
        const seenIds = new Set<string>();
        const out: NarratedEvent[] = [];
        for (const e of merged) {
          if (seenIds.has(e.id)) continue;
          seenIds.add(e.id);
          out.push(e);
          if (out.length >= 10) break;
        }
        return out;
      });
    }
  }, [states]);

  return (
    <Panel>
      <div className="flex items-center justify-between mb-3">
        <Label>Activity</Label>
        <Bell className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
      </div>
      {events.length === 0 ? (
        <div className="text-[12px] text-foreground-mute py-2">Listening for events…</div>
      ) : (
        <ul className="space-y-2.5">
          {events.map((e) => {
            const Icon = e.icon;
            return (
              <li key={e.id} className="flex items-center gap-3 text-[12px]">
                <Icon className="w-3.5 h-3.5 text-foreground-mute shrink-0" strokeWidth={1.5} />
                <span className="text-foreground-dim truncate flex-1">{e.text}</span>
                <span
                  className="mono text-[10px] text-foreground-mute num shrink-0 cursor-help"
                  title={new Date(e.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
                >
                  {timeAgo(e.ts)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
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
        hour: "2-digit", minute: "2-digit", hour12: true, month: "short", day: "numeric",
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
          <StatusDot state={open ? "alert" : "ok"} />
          <span className={`mono text-[10px] uppercase ${open ? "text-odin-alert" : "text-foreground-mute"}`}>
            {garageCover.state}
          </span>
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center gap-4">
        <div className="w-14 h-14 border border-hairline-strong grid place-items-center bg-surface-inset relative shrink-0">
          <Car className={`w-6 h-6 ${open ? "text-odin-alert" : "text-foreground-dim"}`} strokeWidth={1.25} />
          {open && (
            <div
              className="absolute inset-0 border border-odin-alert/60"
              style={{ boxShadow: "0 0 14px hsl(var(--alert) / 0.3) inset" }}
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
  const { rooms, garageCover, airPurifier, lights } = useDiscovery();
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

  const lightsTile = (rooms: string | string[], label: string, icon: any, key?: string) => {
    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    const roomLights = roomList.flatMap((r) => findRoomLights(r));
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
        key={key ?? roomList.join("+")}
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

  // Front Door Lock — SwitchBot placeholder (wiring coming later)
  const frontDoorTile = (
    <QuickTile
      key="front-door"
      icon={Lock}
      label="Front Door"
      status="Soon"
      active={false}
      tone="neutral"
      disabled
      onClick={() => {}}
    />
  );

  // Back Door Lock — placeholder (wiring coming later)
  const backDoorTile = (
    <QuickTile
      key="back-door"
      icon={Lock}
      label="Back Door"
      status="Soon"
      active={false}
      tone="neutral"
      disabled
      onClick={() => {}}
    />
  );

  // Logical flow: lighting → environment → access
  const tiles = [
    lightsTile(["Kitchen", "Living Room"], "First Floor Lights", Lightbulb, "first-floor-lights"),
    purifierTile,
    garageTile,
    frontDoorTile,
    backDoorTile,
  ].filter(Boolean);

  if (tiles.length === 0) return null;

  return (
    <div>
      <SectionHead title="Quick Controls" meta={`${tiles.length} TILES · TAP TO TOGGLE`} />
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}
      >
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
            <SectionHead title="Rooms" meta={`${rooms.length} ZONES · TAP A ROOM TO CONTROL`} />
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
        <Climate /><NowPlaying /><Calendar />
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
            {view === "Health" && <HealthView />}
            {view === "Diagnostics" && <DiagnosticsView />}
            {view === "Configuration" && <ConfigurationView />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
