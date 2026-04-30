import { useState } from "react";
import { Lightbulb, Power, Sun } from "lucide-react";
import { Panel, Label, SectionHead, TactileButton, StatusDot } from "../primitives";

type Fixture = { name: string; level: number; on: boolean; kelvin: number };

const initialRooms: { room: string; scenes: string[]; fixtures: Fixture[] }[] = [
  {
    room: "Living Room",
    scenes: ["Welcome", "Entertain", "Cinema", "Evening", "Off"],
    fixtures: [
      { name: "Cove Perimeter", level: 42, on: true, kelvin: 2700 },
      { name: "Pendant — Sofa", level: 60, on: true, kelvin: 2400 },
      { name: "Picture Lights", level: 30, on: true, kelvin: 3000 },
      { name: "Floor Lamp — Reading", level: 0, on: false, kelvin: 2700 },
      { name: "Cabinet Accents", level: 25, on: true, kelvin: 2400 },
      { name: "Fireplace Sconces", level: 50, on: true, kelvin: 2200 },
    ],
  },
  {
    room: "Kitchen",
    scenes: ["Bright", "Cook", "Dine", "Clean", "Off"],
    fixtures: [
      { name: "Island Pendants", level: 0, on: false, kelvin: 3000 },
      { name: "Under-Cabinet", level: 35, on: true, kelvin: 3000 },
      { name: "Toe-Kick", level: 18, on: true, kelvin: 2700 },
      { name: "Pantry", level: 0, on: false, kelvin: 4000 },
      { name: "Recessed Cans", level: 0, on: false, kelvin: 3000 },
      { name: "Range Hood", level: 0, on: false, kelvin: 3500 },
    ],
  },
  {
    room: "Primary Bedroom",
    scenes: ["Wake", "Read", "Relax", "Goodnight", "Off"],
    fixtures: [
      { name: "Bedside — L", level: 0, on: false, kelvin: 2200 },
      { name: "Bedside — R", level: 0, on: false, kelvin: 2200 },
      { name: "Cove", level: 0, on: false, kelvin: 2400 },
      { name: "Closet", level: 0, on: false, kelvin: 3000 },
      { name: "Vanity", level: 0, on: false, kelvin: 3500 },
    ],
  },
];

const FixtureRow = ({ f, onChange }: { f: Fixture; onChange: (next: Fixture) => void }) => (
  <div className="grid grid-cols-[1fr_auto_120px_auto] items-center gap-4 py-3 border-b border-hairline/60">
    <div className="flex items-center gap-3">
      <Lightbulb className={`w-3.5 h-3.5 ${f.on ? "text-odin-accent" : "text-foreground-mute"}`} strokeWidth={1.5} />
      <span className="text-[13px]">{f.name}</span>
    </div>
    <span className="mono text-[10px] text-foreground-mute num">{f.kelvin}K</span>
    <div className="h-1 bg-surface-inset relative cursor-pointer"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const pct = Math.round(((e.clientX - r.left) / r.width) * 100);
        onChange({ ...f, level: pct, on: pct > 0 });
      }}>
      <div className="h-full" style={{
        width: `${f.level}%`,
        background: "linear-gradient(90deg, hsl(var(--accent-dim)), hsl(var(--accent)))",
        boxShadow: f.level > 0 ? "0 0 10px hsl(var(--accent) / 0.5)" : "none",
      }} />
    </div>
    <button onClick={() => onChange({ ...f, on: !f.on, level: f.on ? 0 : 60 })}
      className={`btn-tactile w-10 h-7 grid place-items-center ${f.on ? "active" : ""}`}>
      <Power className="w-3 h-3" strokeWidth={1.5} />
    </button>
  </div>
);

export default function LightingView() {
  const [rooms, setRooms] = useState(initialRooms);
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);
  const [activeScene, setActiveScene] = useState<Record<string, string>>({
    "Living Room": "Evening", "Kitchen": "Off", "Primary Bedroom": "Off",
  });

  const room = rooms[activeRoomIdx];
  const totalOn = rooms.reduce((acc, r) => acc + r.fixtures.filter(f => f.on).length, 0);
  const totalFix = rooms.reduce((acc, r) => acc + r.fixtures.length, 0);

  const updateFixture = (i: number, next: Fixture) => {
    setRooms(rs => rs.map((r, ri) => ri === activeRoomIdx
      ? { ...r, fixtures: r.fixtures.map((f, fi) => fi === i ? next : f) } : r));
  };

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between mb-1">
          <div>
            <Label>Lighting</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em]">{totalOn} of {totalFix} fixtures engaged</div>
            <div className="text-[12px] text-foreground-dim mt-1">19 zones · DALI-2 · Lutron Ketra integration</div>
          </div>
          <Sun className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
      </Panel>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        {/* Room selector */}
        <Panel padding="p-3">
          <Label className="px-2 py-2 block">Rooms</Label>
          <ul className="space-y-px">
            {rooms.map((r, i) => {
              const onCount = r.fixtures.filter(f => f.on).length;
              return (
                <li key={r.room}>
                  <button onClick={() => setActiveRoomIdx(i)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] transition-colors ${
                      i === activeRoomIdx
                        ? "bg-surface-raised text-foreground border-l-2 border-odin-accent pl-[10px]"
                        : "text-foreground-dim hover:bg-surface-raised/40"
                    }`}>
                    <StatusDot state={onCount > 0 ? "active" : "idle"} />
                    <span className="flex-1 text-left">{r.room}</span>
                    <span className="mono text-[10px] text-foreground-mute num">{onCount}/{r.fixtures.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <SectionHead title={`${room.room} · Scenes`} meta="TAP TO ENGAGE" />
            <div className="flex flex-wrap gap-1.5">
              {room.scenes.map(s => (
                <TactileButton key={s} active={activeScene[room.room] === s}
                  onClick={() => setActiveScene(p => ({ ...p, [room.room]: s }))}>
                  {s}
                </TactileButton>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionHead title="Fixtures" meta={`${room.fixtures.filter(f => f.on).length} ENGAGED`} />
            <div>
              {room.fixtures.map((f, i) => (
                <FixtureRow key={f.name} f={f} onChange={(n) => updateFixture(i, n)} />
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
