// Live HA entity inspector — drop on Overview to verify real-time wiring
// before mapping every UI slot to specific entity IDs.
import { useMemo, useState } from "react";
import { useHa } from "@/lib/ha-client";
import { Label, Panel, StatusDot } from "@/components/odin/primitives";

export default function LiveInspector() {
  const { states, connected, error } = useHa();
  const [filter, setFilter] = useState("");
  const entries = useMemo(() => {
    const all = Object.values(states);
    const f = filter.trim().toLowerCase();
    const filtered = f
      ? all.filter(
          (s) =>
            s.entity_id.toLowerCase().includes(f) ||
            (s.attributes?.friendly_name ?? "").toLowerCase().includes(f),
        )
      : all;
    return filtered
      .sort((a, b) => a.entity_id.localeCompare(b.entity_id))
      .slice(0, 60);
  }, [states, filter]);

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Label>Live Entity Stream</Label>
          <StatusDot state={connected ? "active" : error ? "alert" : "idle"} />
          <span className="mono text-[10px] text-foreground-mute">
            {connected ? "WS LIVE" : error ? "OFFLINE" : "CONNECTING…"}
          </span>
        </div>
        <span className="mono text-[10px] text-foreground-mute num">
          {Object.keys(states).length} ENTITIES
        </span>
      </div>

      {error && (
        <div className="text-[12px] text-odin-accent border border-odin-accent/30 px-3 py-2 bg-odin-accent/5 mb-3">
          {error}
        </div>
      )}

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter entities (e.g. light., climate., binary_sensor.front)"
        className="w-full bg-surface-raised border border-hairline px-3 py-2 text-[12px] mb-3 focus:outline-none focus:border-odin-accent mono"
      />

      <div className="max-h-[280px] overflow-auto border border-hairline">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-surface-inset">
            <tr className="border-b border-hairline">
              <th className="text-left px-3 py-2 label">Entity</th>
              <th className="text-left px-3 py-2 label">State</th>
              <th className="text-left px-3 py-2 label">Updated</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((s) => (
              <tr key={s.entity_id} className="border-b border-hairline/40">
                <td className="px-3 py-1.5 mono text-foreground-dim truncate max-w-[220px]">
                  {s.entity_id}
                </td>
                <td className="px-3 py-1.5 mono text-foreground">{s.state}</td>
                <td className="px-3 py-1.5 mono text-foreground-mute num">
                  {s.last_updated
                    ? new Date(s.last_updated).toLocaleTimeString("en-US", {
                        hour12: false,
                      })
                    : "—"}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-foreground-mute label">
                  {connected ? "No entities match" : "Awaiting connection…"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
