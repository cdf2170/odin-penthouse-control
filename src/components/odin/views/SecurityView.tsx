import { useMemo } from "react";
import {
  DoorClosed, Activity, Car, ShieldCheck, ShieldAlert, Shield,
  Eye, UserRound, PawPrint, Bell, Radio, Siren,
} from "lucide-react";
import { Panel, Label, SectionHead, StatusDot, TactileButton } from "../primitives";
import { useHa } from "@/lib/ha-client";
import { useDiscovery, friendly } from "@/lib/ha-discovery";
import type { HaState } from "@/lib/ha-client";

/* ---------- Room → entity bindings (only live rooms) -------------- */
type RoomBinding = {
  name: string;
  door?: string;       // contact / opening sensor
  presence?: string;   // FP2 / Aqara / mmWave presence
  status: "live" | "future";
};

const ROOMS: RoomBinding[] = [
  {
    name: "Office",
    presence: "binary_sensor.office_occupancy",
    status: "live",
  },
  {
    name: "Bedroom",
    door: "binary_sensor.bedroom_door",
    presence: "binary_sensor.bedroom_occupancy",
    status: "live",
  },
  {
    name: "Living Room",
    presence: "binary_sensor.living_room_occupancy",
    status: "live",
  },
  {
    name: "Bathroom",
    door: "binary_sensor.bathroom_door",
    presence: "binary_sensor.bathroom_occupancy",
    status: "live",
  },
  {
    name: "Front Door",
    door: "binary_sensor.front_door_contact",
    status: "live",
  },
  {
    name: "Back Door",
    door: "binary_sensor.back_door",
    status: "live",
  },
];

/* ---------- Room card --------------------------------------------- */
const RoomCard = ({
  binding,
  door,
  presence,
}: {
  binding: RoomBinding;
  door?: HaState;
  presence?: HaState;
}) => {
  if (binding.status === "future") {
    return (
      <Panel>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[15px] font-medium tracking-[0.04em]">
              {binding.name}
            </div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground-mute mt-1.5">
              Future
            </div>
          </div>
          <StatusDot state="idle" />
        </div>
        <div className="text-[12px] text-foreground-mute mt-4">
          Sensors not yet installed.
        </div>
      </Panel>
    );
  }

  const doorOpen = door?.state === "on";
  const occupied = presence?.state === "on";
  const isExterior =
    binding.name === "Front Door" || binding.name === "Back Door";
  // Interior doors open = warn (yellow), never alert (red)
  const doorOpenTone: "alert" | "warn" = isExterior ? "alert" : "warn";

  // Header dot priority: open door (red exterior / yellow interior) > presence (blue) > ok (green)
  const headerDot = doorOpen
    ? doorOpenTone
    : occupied
      ? "info"
      : "ok";

  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-medium tracking-[0.04em]">
            {binding.name}
          </div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground-mute mt-1.5 num">
            {occupied ? "Occupied" : "Vacant"}
            {door ? ` · ${doorOpen ? "Door Open" : "Door Closed"}` : ""}
          </div>
        </div>
        <StatusDot state={headerDot} />
      </div>

      <div className="mt-5 space-y-2.5">
        {door && (
          <Row
            icon={DoorClosed}
            label={friendly(door)}
            on={doorOpen}
            onText="OPEN"
            offText="CLOSED"
            tone={doorOpen ? doorOpenTone : "ok"}
          />
        )}
        {presence && (
          <Row
            icon={Activity}
            label={friendly(presence)}
            on={occupied}
            onText="ACTIVE"
            offText="CLEAR"
            tone={occupied ? "info" : "idle"}
          />
        )}
      </div>
    </Panel>
  );
};

const Row = ({
  icon: Icon,
  label,
  on,
  onText,
  offText,
  tone,
}: {
  icon: any;
  label: string;
  on: boolean;
  onText: string;
  offText: string;
  tone: "alert" | "ok" | "active" | "idle" | "info" | "warn";
}) => (
  <div className="flex items-center gap-3 py-1.5">
    <Icon className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
    <span className="text-[12px] flex-1 truncate text-foreground-dim">
      {label}
    </span>
    <StatusDot state={tone} />
    <span className="mono text-[10px] text-foreground-dim w-16 text-right">
      {on ? onText : offText}
    </span>
  </div>
);

/* ---------- Garage card (open/close only) ------------------------- */
const GarageCard = ({ cover }: { cover?: HaState }) => {
  const { callService } = useHa();
  if (!cover) {
    return (
      <Panel>
        <Label>Garage</Label>
        <div className="text-[12px] text-foreground-mute mt-2">
          No garage cover discovered.
        </div>
      </Panel>
    );
  }
  const open = cover.state === "open" || cover.state === "opening";
  const moving = cover.state === "opening" || cover.state === "closing";

  const toggle = () =>
    callService("cover", open ? "close_cover" : "open_cover", {
      entity_id: cover.entity_id,
    });

  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[15px] font-medium tracking-[0.04em]">
            Garage
          </div>
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-foreground-mute mt-1.5 num">
            {cover.state}
          </div>
        </div>
        <StatusDot state={open ? "alert" : "ok"} />
      </div>

      <div className="flex items-center gap-3 mt-5">
        <Car className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
        <span className="text-[12px] flex-1 capitalize text-foreground-dim">
          {open ? "Door is open" : "Door is closed"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5">
        <TactileButton
          active={!open}
          onClick={() => !moving && open && toggle()}
          className={`!py-2.5 ${moving || !open ? "opacity-50 pointer-events-none" : ""}`}
        >
          Close
        </TactileButton>
        <TactileButton
          active={open}
          onClick={() => !moving && !open && toggle()}
          className={`!py-2.5 ${moving || open ? "opacity-50 pointer-events-none" : ""}`}
        >
          Open
        </TactileButton>
      </div>
    </Panel>
  );
};

/* ---------- Hero: command-center posture -------------------------- */
type Posture = {
  level: "secured" | "attention" | "breach";
  headline: string;
  detail: string;
};

const PERIMETER_AI = [
  { id: "binary_sensor.front_door_person_detected",  label: "Person",  icon: UserRound },
  { id: "binary_sensor.front_door_vehicle_detected", label: "Vehicle", icon: Car },
  { id: "binary_sensor.front_door_pet_detected",     label: "Pet",     icon: PawPrint },
  { id: "binary_sensor.front_door_visitor_detected", label: "Visitor", icon: Bell },
  { id: "binary_sensor.front_door_motion",  label: "Motion",  icon: Radio },
];

const SecurityHero = ({
  posture,
  occupiedCount,
  liveCount,
  openDoors,
  perimeter,
  doorbellOnline,
  sirenReady,
}: {
  posture: Posture;
  occupiedCount: number;
  liveCount: number;
  openDoors: number;
  perimeter: { id: string; label: string; icon: any; active: boolean }[];
  doorbellOnline: boolean;
  sirenReady: boolean;
}) => {
  const tone =
    posture.level === "breach"
      ? { ring: "border-odin-alert/60", glow: "0 0 60px hsl(var(--alert) / 0.18) inset", text: "text-odin-alert", Icon: ShieldAlert, dot: "alert" as const }
      : posture.level === "attention"
        ? { ring: "border-odin-accent/60", glow: "0 0 60px hsl(var(--accent) / 0.16) inset", text: "text-odin-accent", Icon: Shield, dot: "active" as const }
        : { ring: "border-hairline-strong", glow: "0 0 60px hsl(152 50% 50% / 0.12) inset", text: "text-odin-ok", Icon: ShieldCheck, dot: "ok" as const };

  return (
    <Panel padding="p-0" className={`overflow-hidden border ${tone.ring}`}>
      {/* Top — posture */}
      <div
        className="px-8 py-7 flex items-center gap-8"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--surface-raised)) 0%, hsl(var(--background)) 100%)",
          boxShadow: tone.glow,
        }}
      >
        <div
          className={`w-16 h-16 grid place-items-center border ${tone.ring} shrink-0`}
          style={{ boxShadow: tone.glow }}
        >
          <tone.Icon className={`w-7 h-7 ${tone.text}`} strokeWidth={1.25} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mono text-[10px] uppercase tracking-[0.3em] text-foreground-mute">
            Property Posture
          </div>
          <div className={`text-[34px] font-light tracking-[-0.01em] mt-2 leading-none ${tone.text}`}>
            {posture.headline}
          </div>
          <div className="text-[12px] text-foreground-dim mt-2">
            {posture.detail}
          </div>
        </div>

        {/* Quick metrics */}
        <div className="hidden md:flex items-stretch gap-6 pl-6 border-l border-hairline">
          <Metric value={occupiedCount} label="Occupied" sub={`of ${liveCount}`} />
          <Metric value={openDoors} label="Perimeter" sub="exterior open" alert={openDoors > 0} />
        </div>
      </div>

      {/* Bottom — live perimeter intelligence strip */}
      <div className="border-t border-hairline grid grid-cols-2 lg:grid-cols-[1fr_auto] divide-x divide-hairline">
        <div className="px-6 py-4 flex items-center gap-2 overflow-x-auto">
          <Label className="shrink-0 mr-2">Perimeter AI</Label>
          {perimeter.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-colors shrink-0 ${
                p.active
                  ? "border-odin-info/70 text-odin-info"
                  : "border-hairline text-foreground-mute"
              }`}
              style={p.active ? { boxShadow: "0 0 12px hsl(var(--info) / 0.18) inset" } : undefined}
            >
              <p.icon className="w-3 h-3" strokeWidth={1.5} />
              <span className="mono text-[10px] uppercase tracking-[0.16em]">{p.label}</span>
              <StatusDot state={p.active ? "info" : "idle"} />
            </div>
          ))}
        </div>
        <div className="px-6 py-4 flex items-center gap-5">
          <div className="flex items-center gap-2">
            <Eye className={`w-3.5 h-3.5 ${doorbellOnline ? "text-odin-ok" : "text-foreground-mute"}`} strokeWidth={1.5} />
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground-dim">
              Doorbell {doorbellOnline ? "Live" : "Offline"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Siren className={`w-3.5 h-3.5 ${sirenReady ? "text-odin-ok" : "text-foreground-mute"}`} strokeWidth={1.5} />
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground-dim">
              Siren {sirenReady ? "Armed" : "—"}
            </span>
          </div>
        </div>
      </div>
    </Panel>
  );
};

const Metric = ({
  value, label, sub, alert,
}: { value: number; label: string; sub?: string; alert?: boolean }) => (
  <div className="text-right">
    <div className={`mono text-[28px] num leading-none ${alert ? "text-odin-alert" : ""}`}>
      {value}
    </div>
    <div className="mono text-[9px] uppercase tracking-[0.22em] text-foreground-mute mt-2">
      {label}
    </div>
    {sub && (
      <div className="mono text-[9px] text-foreground-mute num mt-0.5">{sub}</div>
    )}
  </div>
);

/* ---------- View -------------------------------------------------- */
export default function SecurityView() {
  const { states } = useHa();

  const cards = useMemo(
    () =>
      ROOMS.map((b) => ({
        binding: b,
        door: b.door ? states[b.door] : undefined,
        presence: b.presence ? states[b.presence] : undefined,
      })),
    [states],
  );

  const liveCount = cards.filter((c) => c.binding.status === "live").length;
  const occupiedCount = cards.filter((c) => c.presence?.state === "on").length;
  const openDoors = cards.filter((c) => c.door?.state === "on").length;

  // Only exterior openings affect posture (interior doors being open is normal)
  const EXTERIOR_ROOMS = new Set(["Front Door", "Back Door"]);
  const exteriorOpenCards = cards.filter(
    (c) => EXTERIOR_ROOMS.has(c.binding.name) && c.door?.state === "on",
  );
  const garageCover = states["cover.garage_door"];
  const garageOpen =
    garageCover?.state === "open" || garageCover?.state === "opening";
  const exteriorOpenCount = exteriorOpenCards.length + (garageOpen ? 1 : 0);

  // Perimeter AI
  const perimeter = PERIMETER_AI.map((p) => ({
    ...p,
    active: states[p.id]?.state === "on",
  }));
  const perimeterAlert = perimeter.some(
    (p) => p.active && (p.label === "Person" || p.label === "Visitor" || p.label === "Vehicle"),
  );

  const doorbell = states["camera.front_door"];
  const doorbellOnline = !!doorbell && doorbell.state !== "unavailable";
  const siren = states["siren.front_door"];
  const sirenReady = !!siren && siren.state !== "unavailable";

  // Recent events — last 5 changes across door + presence sensors
  const recent = useMemo(() => {
    const all = cards
      .flatMap((c) => [c.door, c.presence].filter(Boolean) as HaState[])
      .filter((s) => s.last_changed)
      .sort((a, b) => new Date(b.last_changed!).getTime() - new Date(a.last_changed!).getTime())
      .slice(0, 5);
    return all;
  }, [cards]);

  const exteriorList = [
    ...exteriorOpenCards.map((c) => c.binding.name),
    ...(garageOpen ? ["Garage"] : []),
  ];

  const posture: Posture = exteriorOpenCount > 0
    ? {
        level: "attention",
        headline: "Perimeter Open",
        detail: `${exteriorList.join(" · ")} unsecured`,
      }
    : perimeterAlert
      ? {
          level: "attention",
          headline: "Visitor Detected",
          detail: "Perimeter AI flagged activity at front door",
        }
      : {
          level: "secured",
          headline: "All Clear",
          detail: `Perimeter secure · ${occupiedCount} room${occupiedCount === 1 ? "" : "s"} occupied${openDoors > 0 ? ` · ${openDoors} interior open` : ""}`,
        };

  return (
    <div className="space-y-6">
      <SecurityHero
        posture={posture}
        occupiedCount={occupiedCount}
        liveCount={liveCount}
        openDoors={exteriorOpenCount}
        perimeter={perimeter}
        doorbellOnline={doorbellOnline}
        sirenReady={sirenReady}
      />

      <div>
        <SectionHead title="Rooms" meta={`${ROOMS.length} TOTAL`} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((c) => (
            <RoomCard
              key={c.binding.name}
              binding={c.binding}
              door={c.door}
              presence={c.presence}
            />
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <Panel>
          <SectionHead title="Recent Activity" meta="LIVE" />
          <ul className="divide-y divide-hairline/60">
            {recent.map((s) => {
              const open = s.state === "on";
              const isMotion =
                s.attributes?.device_class === "motion" ||
                s.attributes?.device_class === "occupancy" ||
                s.attributes?.device_class === "presence";
              const isExteriorDoor =
                s.entity_id === "binary_sensor.front_door_contact" ||
                s.entity_id === "binary_sensor.back_door";
              const dot: "info" | "alert" | "warn" | "ok" = open
                ? isMotion
                  ? "info"
                  : isExteriorDoor
                    ? "alert"
                    : "warn"
                : "ok";
              return (
                <li key={s.entity_id} className="flex items-center gap-3 py-2.5">
                  <StatusDot state={dot} />
                  <span className="text-[12px] flex-1 truncate text-foreground-dim">
                    {friendly(s)}
                  </span>
                  <span className="mono text-[10px] uppercase tracking-[0.14em] text-foreground-mute w-20 text-right">
                    {isMotion ? (open ? "Active" : "Clear") : open ? "Opened" : "Closed"}
                  </span>
                  <span className="mono text-[10px] text-foreground-mute num w-20 text-right">
                    {new Date(s.last_changed!).toLocaleTimeString("en-US", {
                      hour12: true,
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}
