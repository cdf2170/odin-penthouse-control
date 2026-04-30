import { useEffect, useState } from "react";
import { Video, Maximize2 } from "lucide-react";
import { Panel, Label, SectionHead, StatusDot } from "../primitives";
import { useHa } from "@/lib/ha-client";
import { useDiscovery } from "@/lib/ha-discovery";
import { friendly } from "@/lib/ha-discovery";
import type { HaState } from "@/lib/ha-client";

// Snapshot polling component — Nest via HA only exposes still images,
// so we poll the camera_proxy endpoint via the edge function.
const SnapshotImage = ({ entity }: { entity: HaState }) => {
  const { cameraSnapshot } = useHa();
  const [src, setSrc] = useState<string | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const url = await cameraSnapshot(entity.entity_id);
      if (!cancelled && url) {
        setSrc(url);
        setUpdated(new Date());
      }
    };
    tick();
    const id = window.setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [entity.entity_id, cameraSnapshot]);

  if (!src) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <Video
            className="w-8 h-8 text-foreground-mute mx-auto animate-pulse"
            strokeWidth={1}
          />
          <div className="mono text-[10px] text-foreground-mute mt-2 uppercase">
            Acquiring feed…
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt={friendly(entity)}
        className="w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 scanline pointer-events-none" />
      <div className="absolute top-3 left-3 mono text-[10px] text-white/80 num bg-black/50 px-1.5 py-0.5">
        SNAPSHOT ·{" "}
        {updated?.toLocaleTimeString("en-US", { hour12: false }) ?? "—"}
      </div>
    </>
  );
};

const Tile = ({ c, large = false }: { c: HaState; large?: boolean }) => {
  const live = c.state !== "unavailable" && c.state !== "off";
  return (
    <Panel padding="p-0" className="overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium truncate">{friendly(c)}</div>
          <div className="mono text-[10px] text-foreground-mute mt-0.5 truncate">
            {c.entity_id.toUpperCase()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot state={live ? "alert" : "idle"} />
          <span
            className={`mono text-[10px] ${live ? "text-odin-alert" : "text-foreground-mute"}`}
          >
            {live ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>
      <div
        className={`relative ${large ? "aspect-[16/9]" : "aspect-[16/10]"} bg-surface-inset border-t border-hairline`}
      >
        {live ? (
          <>
            <SnapshotImage entity={c} />
            <button className="absolute top-3 right-3 w-7 h-7 bg-black/50 grid place-items-center text-white/80 hover:text-white">
              <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <Video
                className="w-8 h-8 text-foreground-mute mx-auto"
                strokeWidth={1}
              />
              <div className="mono text-[10px] text-foreground-mute mt-2 uppercase">
                Feed Unavailable
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

export default function CamerasView() {
  const { cameras } = useDiscovery();
  const [activeIdx, setActiveIdx] = useState(0);

  if (cameras.length === 0) {
    return (
      <Panel accent>
        <Label>Cameras</Label>
        <div className="text-[14px] text-foreground-dim mt-2">
          No camera entities discovered.
        </div>
      </Panel>
    );
  }

  const liveCount = cameras.filter(
    (c) => c.state !== "unavailable" && c.state !== "off",
  ).length;
  const focused = cameras[Math.min(activeIdx, cameras.length - 1)];

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between">
          <div>
            <Label>Cameras</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">
              {liveCount} of {cameras.length} feeds live
            </div>
            <div className="text-[12px] text-foreground-dim mt-1">
              Snapshot refresh every 4s · live feed via HA
            </div>
          </div>
          <Video className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
      </Panel>

      <Tile c={focused} large />

      <div>
        <SectionHead title="All Cameras" meta="TAP TO FOCUS" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((c, i) => (
            <button
              key={c.entity_id}
              onClick={() => setActiveIdx(i)}
              className="text-left"
            >
              <Tile c={c} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
