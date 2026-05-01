import { useMemo } from "react";
import { DoorClosed, Activity, Car, Clock } from "lucide-react";
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
    door: "binary_sensor.office_door_sensor",
    presence: "binary_sensor.office_presence_sensor_presence_sensor_1",
    status: "live",
  },
  {
    name: "Bedroom",
    door: "binary_sensor.bedroom_door_sensor",
    presence: "binary_sensor.presence_sensor_bedroom_presence_sensor_1",
    status: "live",
  },
  {
    name: "Living Room",
    presence: "binary_sensor.presence_sensor_fp2_6426_presence_sensor_1",
    status: "live",
  },
  { name: "Bathroom", status: "future" },
  { name: "Kitchen", status: "future" },
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
  const anyAlert = doorOpen;

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
        <StatusDot state={anyAlert ? "alert" : occupied ? "active" : "ok"} />
      </div>

      <div className="mt-5 space-y-2.5">
        {door && (
          <Row
            icon={DoorClosed}
            label={friendly(door)}
            on={doorOpen}
            onText="OPEN"
            offText="CLOSED"
            tone={doorOpen ? "alert" : "ok"}
          />
        )}
        {presence && (
          <Row
            icon={Activity}
            label={friendly(presence)}
            on={occupied}
            onText="ACTIVE"
            offText="CLEAR"
            tone={occupied ? "active" : "idle"}
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
  tone: "alert" | "ok" | "active" | "idle";
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

/* ---------- View -------------------------------------------------- */
export default function SecurityView() {
  const { states } = useHa();
  const { garageCover } = useDiscovery();

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
  const occupiedCount = cards.filter(
    (c) => c.presence?.state === "on",
  ).length;
  const openDoors = cards.filter((c) => c.door?.state === "on").length;

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between">
          <div>
            <Label>Security · Presence</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">
              {occupiedCount} occupied · {openDoors} door{openDoors === 1 ? "" : "s"} open
            </div>
            <div className="text-[12px] text-foreground-dim mt-1">
              {liveCount} live room{liveCount === 1 ? "" : "s"} · live via Home Assistant
            </div>
          </div>
          <Clock className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
      </Panel>

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

      <div>
        <SectionHead title="Garage" meta="OPEN / CLOSE" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <GarageCard cover={garageCover} />
        </div>
      </div>
    </div>
  );
}
