import { useMemo, useState } from "react";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Speaker as SpeakerIcon,
} from "lucide-react";
import { Panel, Label, SectionHead, StatusDot } from "../primitives";
import { useHa } from "@/lib/ha-client";
import { useDiscovery } from "@/lib/ha-discovery";
import { friendly } from "@/lib/ha-discovery";

export default function AudioView() {
  const { callService } = useHa();
  const { mediaPlayers } = useDiscovery();
  const [activeIdx, setActiveIdx] = useState(0);

  const speakers = useMemo(
    () =>
      mediaPlayers.map((mp) => {
        const a = mp.attributes ?? {};
        return {
          entity: mp.entity_id,
          name: friendly(mp),
          model:
            (a.device_class as string) ??
            (a.entity_picture as string)?.split("/").pop() ??
            "speaker",
          group: (a.group_members as string[])?.length ? "Grouped" : "Solo",
          vol: Math.round(((a.volume_level as number) ?? 0) * 100),
          playing: mp.state === "playing",
          state: mp.state,
          title: a.media_title as string | undefined,
          artist: a.media_artist as string | undefined,
          duration: a.media_duration as number | undefined,
          position: a.media_position as number | undefined,
          art: a.entity_picture as string | undefined,
        };
      }),
    [mediaPlayers],
  );

  if (speakers.length === 0) {
    return (
      <Panel accent>
        <Label>Audio</Label>
        <div className="text-[14px] text-foreground-dim mt-2">
          No media players discovered.
        </div>
      </Panel>
    );
  }

  const active = speakers[Math.min(activeIdx, speakers.length - 1)];

  const setVol = (entity: string, pct: number) =>
    callService("media_player", "volume_set", {
      entity_id: entity,
      volume_level: Math.max(0, Math.min(100, pct)) / 100,
    });
  const playPause = (entity: string) =>
    callService("media_player", "media_play_pause", { entity_id: entity });
  const next = (entity: string) =>
    callService("media_player", "media_next_track", { entity_id: entity });
  const prev = (entity: string) =>
    callService("media_player", "media_previous_track", { entity_id: entity });

  const fmt = (s?: number) => {
    if (!s && s !== 0) return "--:--";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };
  const pct =
    active.duration && active.position
      ? (active.position / active.duration) * 100
      : 0;

  return (
    <div className="space-y-6">
      <Panel accent padding="p-6">
        <div className="grid grid-cols-[140px_1fr_auto] items-center gap-6">
          <div className="aspect-square bg-surface-inset border border-hairline-strong relative overflow-hidden">
            {active.art ? (
              <img
                src={active.art}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(28 60% 35%), hsl(220 30% 12%))",
                }}
              />
            )}
            <div className="absolute inset-0 scanline pointer-events-none" />
          </div>
          <div className="min-w-0">
            <Label>Now Playing · {active.name}</Label>
            <div className="text-[22px] font-medium mt-2 tracking-[0.02em] truncate">
              {active.title ?? "—"}
            </div>
            <div className="text-[14px] text-foreground-dim mt-1 truncate">
              {active.artist ?? active.state}
            </div>
            <div className="mt-4">
              <div className="h-px bg-surface-inset">
                <div
                  className="h-px bg-odin-accent"
                  style={{
                    width: `${pct}%`,
                    boxShadow: "0 0 8px hsl(var(--accent))",
                  }}
                />
              </div>
              <div className="flex justify-between mono text-[10px] text-foreground-mute mt-1.5 num">
                <span>{fmt(active.position)}</span>
                <span>{fmt(active.duration)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => prev(active.entity)}
              className="w-10 h-10 grid place-items-center text-foreground-dim hover:text-foreground transition-colors"
            >
              <SkipBack className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => playPause(active.entity)}
              className={`w-14 h-14 grid place-items-center btn-tactile ${active.playing ? "active" : ""}`}
            >
              {active.playing ? (
                <Pause className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Play className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
            <button
              onClick={() => next(active.entity)}
              className="w-10 h-10 grid place-items-center text-foreground-dim hover:text-foreground transition-colors"
            >
              <SkipForward className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHead
          title="Speakers"
          meta={`${speakers.length} ZONE${speakers.length === 1 ? "" : "S"}`}
        />
        <div className="space-y-3">
          {speakers.map((sp, i) => (
            <div
              key={sp.entity}
              className={`grid grid-cols-[auto_1fr_auto_180px_36px] items-center gap-4 py-2.5 border-b border-hairline/60 cursor-pointer ${
                i === activeIdx ? "bg-surface-raised/40" : ""
              }`}
              onClick={() => setActiveIdx(i)}
            >
              <SpeakerIcon
                className={`w-4 h-4 ${sp.playing ? "text-odin-accent" : "text-foreground-mute"}`}
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <div className="text-[13px] truncate">{sp.name}</div>
                <div className="mono text-[10px] text-foreground-mute mt-0.5 truncate">
                  {sp.state.toUpperCase()} · {sp.group.toUpperCase()}
                </div>
              </div>
              <StatusDot state={sp.playing ? "active" : "idle"} />
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Volume2
                  className="w-3 h-3 text-foreground-mute"
                  strokeWidth={1.5}
                />
                <div
                  className="flex-1 h-px bg-surface-inset relative cursor-pointer"
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setVol(
                      sp.entity,
                      Math.round(((e.clientX - r.left) / r.width) * 100),
                    );
                  }}
                >
                  <div
                    className="h-px bg-foreground-dim"
                    style={{ width: `${sp.vol}%` }}
                  />
                </div>
              </div>
              <span className="mono text-[11px] num text-right">{sp.vol}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
