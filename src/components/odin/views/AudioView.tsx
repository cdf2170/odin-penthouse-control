import { useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2, Speaker, Radio } from "lucide-react";
import { Panel, Label, SectionHead, TactileButton, StatusDot } from "../primitives";

type Speaker = { name: string; model: string; group: string; vol: number; playing: boolean };

const initial: Speaker[] = [
  { name: "Living Room", model: "Sonos Arc Ultra", group: "Main", vol: 38, playing: true },
  { name: "Living Surrounds", model: "Era 100 ×2", group: "Main", vol: 28, playing: true },
  { name: "Kitchen", model: "Era 300", group: "Main", vol: 32, playing: true },
  { name: "Primary Suite", model: "Era 100", group: "Bedroom", vol: 0, playing: false },
  { name: "Office", model: "Era 100", group: "Office", vol: 18, playing: true },
  { name: "Patio", model: "Move 2 ×2", group: "Outdoor", vol: 0, playing: false },
];

const queue = [
  { t: "Spiegel im Spiegel", a: "Arvo Pärt", d: "9:33", playing: true },
  { t: "Für Alina", a: "Arvo Pärt", d: "10:42" },
  { t: "Gymnopédie No. 1", a: "Erik Satie", d: "3:35" },
  { t: "Clair de Lune", a: "Debussy", d: "5:08" },
  { t: "Metamorphosis One", a: "Philip Glass", d: "5:51" },
];

export default function AudioView() {
  const [speakers, setSpeakers] = useState(initial);
  const [playing, setPlaying] = useState(true);

  const setVol = (i: number, vol: number) => setSpeakers(s => s.map((sp, idx) => idx === i ? { ...sp, vol } : sp));

  return (
    <div className="space-y-6">
      <Panel accent padding="p-6">
        <div className="grid grid-cols-[140px_1fr_auto] items-center gap-6">
          <div className="aspect-square bg-surface-inset border border-hairline-strong relative overflow-hidden">
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(28 60% 35%), hsl(220 30% 12%))" }} />
            <div className="absolute inset-0 scanline" />
          </div>
          <div className="min-w-0">
            <Label>Now Playing · Main Group</Label>
            <div className="text-[22px] font-medium mt-2 tracking-[0.02em] truncate">Spiegel im Spiegel</div>
            <div className="text-[14px] text-foreground-dim mt-1">Arvo Pärt — Alina</div>
            <div className="mt-4">
              <div className="h-px bg-surface-inset">
                <div className="h-px bg-odin-accent" style={{ width: "24%", boxShadow: "0 0 8px hsl(var(--accent))" }} />
              </div>
              <div className="flex justify-between mono text-[10px] text-foreground-mute mt-1.5 num">
                <span>02:14</span><span>09:33</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
              <SkipBack className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button onClick={() => setPlaying(!playing)} className="w-14 h-14 grid place-items-center btn-tactile active">
              {playing ? <Pause className="w-5 h-5" strokeWidth={1.5} /> : <Play className="w-5 h-5" strokeWidth={1.5} />}
            </button>
            <button className="w-10 h-10 grid place-items-center text-foreground-dim hover:text-foreground transition-colors">
              <SkipForward className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <Panel>
          <SectionHead title="Speakers" meta="6 ZONES · SONOS" />
          <div className="space-y-3">
            {speakers.map((sp, i) => (
              <div key={sp.name} className="grid grid-cols-[auto_1fr_auto_180px_36px] items-center gap-4 py-2.5 border-b border-hairline/60">
                <Speaker className={`w-4 h-4 ${sp.playing ? "text-odin-accent" : "text-foreground-mute"}`} strokeWidth={1.5} />
                <div>
                  <div className="text-[13px]">{sp.name}</div>
                  <div className="mono text-[10px] text-foreground-mute mt-0.5">{sp.model.toUpperCase()} · {sp.group.toUpperCase()}</div>
                </div>
                <StatusDot state={sp.playing ? "active" : "idle"} />
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3 h-3 text-foreground-mute" strokeWidth={1.5} />
                  <div className="flex-1 h-px bg-surface-inset relative cursor-pointer"
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setVol(i, Math.round(((e.clientX - r.left) / r.width) * 100));
                    }}>
                    <div className="h-px bg-foreground-dim" style={{ width: `${sp.vol}%` }} />
                  </div>
                </div>
                <span className="mono text-[11px] num text-right">{sp.vol}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Queue" meta="5 TRACKS" />
          <ul className="space-y-1">
            {queue.map((q, i) => (
              <li key={i} className={`flex items-center gap-3 px-2 py-2.5 ${q.playing ? "bg-surface-raised border-l-2 border-odin-accent" : "border-l-2 border-transparent"}`}>
                <span className="mono text-[10px] text-foreground-mute num w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] truncate">{q.t}</div>
                  <div className="text-[10px] text-foreground-mute truncate">{q.a}</div>
                </div>
                <span className="mono text-[10px] text-foreground-mute num">{q.d}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
