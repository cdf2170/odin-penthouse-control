import { useState } from "react";
import { Video, Maximize2 } from "lucide-react";
import { Panel, Label, SectionHead, StatusDot } from "../primitives";
import doorbellFeed from "@/assets/doorbell-feed.jpg";

const cams = [
  { id: "CAM·01", name: "Front Entry", model: "Nest Doorbell", live: true, motion: "04:12 ago" },
  { id: "CAM·02", name: "Driveway", model: "Nest Cam Outdoor", live: true, motion: "Just now" },
  { id: "CAM·03", name: "Patio", model: "Nest Cam IQ", live: true, motion: "1h 12m ago" },
  { id: "CAM·04", name: "Garage Bay", model: "Nest Cam Indoor", live: true, motion: "32m ago" },
  { id: "CAM·05", name: "Foyer", model: "Nest Cam Indoor", live: false, motion: "Disabled" },
  { id: "CAM·06", name: "Side Yard", model: "Nest Cam Outdoor", live: true, motion: "3h ago" },
];

const Tile = ({ c, large = false }: { c: typeof cams[number]; large?: boolean }) => (
  <Panel padding="p-0" className="overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="text-[13px] font-medium">{c.name}</div>
        <div className="mono text-[10px] text-foreground-mute mt-0.5">{c.id} · {c.model.toUpperCase()}</div>
      </div>
      <div className="flex items-center gap-2">
        <StatusDot state={c.live ? "alert" : "idle"} />
        <span className={`mono text-[10px] ${c.live ? "text-odin-alert" : "text-foreground-mute"}`}>{c.live ? "LIVE" : "OFFLINE"}</span>
      </div>
    </div>
    <div className={`relative ${large ? "aspect-[16/9]" : "aspect-[16/10]"} bg-surface-inset border-t border-hairline`}>
      {c.live ? (
        <>
          <img src={doorbellFeed} alt={`${c.name} live feed`} className="w-full h-full object-cover opacity-90" loading="lazy" />
          <div className="absolute inset-0 scanline pointer-events-none" />
          <div className="absolute top-3 left-3 mono text-[10px] text-white/80 num bg-black/50 px-1.5 py-0.5">
            2160p · {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <button className="absolute top-3 right-3 w-7 h-7 bg-black/50 grid place-items-center text-white/80 hover:text-white">
            <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <div className="absolute bottom-3 left-3 mono text-[10px] text-white/70 uppercase tracking-[0.16em]">
            Motion · {c.motion}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <Video className="w-8 h-8 text-foreground-mute mx-auto" strokeWidth={1} />
            <div className="mono text-[10px] text-foreground-mute mt-2 uppercase">Feed Disabled</div>
          </div>
        </div>
      )}
    </div>
  </Panel>
);

export default function CamerasView() {
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between">
          <div>
            <Label>Cameras · Google Nest</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">5 of 6 feeds live</div>
            <div className="text-[12px] text-foreground-dim mt-1">2160p · 30 day cloud retention · Continuous recording</div>
          </div>
          <Video className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
      </Panel>

      <Tile c={cams[active]} large />

      <div>
        <SectionHead title="All Cameras" meta="TAP TO FOCUS" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cams.map((c, i) => (
            <button key={c.id} onClick={() => setActive(i)} className="text-left">
              <Tile c={c} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
