// ODIN System Diagnostics — live health, domain breakdown, recent events
import { useMemo } from "react";
import { Activity, AlertTriangle, CheckCircle2, Database, Radio, Wifi } from "lucide-react";
import { Panel, Label, StatusDot, SectionHead } from "@/components/odin/primitives";
import { useHa } from "@/lib/ha-client";
import { useAuth } from "@/lib/auth";
import { friendly } from "@/lib/ha-discovery";

const DiagnosticsView = () => {
  const { states, connected, error } = useHa();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const all = Object.values(states);
    const byDomain: Record<string, number> = {};
    let unavailable = 0;
    for (const s of all) {
      const d = s.entity_id.split(".")[0];
      byDomain[d] = (byDomain[d] ?? 0) + 1;
      if (s.state === "unavailable" || s.state === "unknown") unavailable++;
    }
    const sorted = Object.entries(byDomain).sort((a, b) => b[1] - a[1]);
    return { total: all.length, sorted, unavailable };
  }, [states]);

  const recentChanges = useMemo(() => {
    return Object.values(states)
      .filter((s) => s.last_changed)
      .sort((a, b) => new Date(b.last_changed!).getTime() - new Date(a.last_changed!).getTime())
      .slice(0, 12);
  }, [states]);

  const unavailableEntities = useMemo(
    () =>
      Object.values(states)
        .filter((s) => s.state === "unavailable" || s.state === "unknown")
        .slice(0, 8),
    [states],
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Panel>
          <div className="flex items-center justify-between mb-3">
            <Label>Cloud Link</Label>
            <Wifi className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2">
            <StatusDot state={connected ? "active" : error ? "alert" : "idle"} />
            <span className="mono text-[14px]">{connected ? "LIVE" : error ? "DOWN" : "…"}</span>
          </div>
          <div className="text-[11px] text-foreground-mute mt-2 truncate">
            {error ?? "Nabu Casa WebSocket"}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between mb-3">
            <Label>Entities</Label>
            <Database className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
          </div>
          <div className="mono text-[28px] num">{stats.total}</div>
          <div className="text-[11px] text-foreground-mute mt-1">
            {stats.sorted.length} domains
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between mb-3">
            <Label>Unavailable</Label>
            <AlertTriangle className={`w-3.5 h-3.5 ${stats.unavailable ? "text-odin-alert" : "text-foreground-mute"}`} strokeWidth={1.5} />
          </div>
          <div className={`mono text-[28px] num ${stats.unavailable ? "text-odin-alert" : ""}`}>
            {stats.unavailable}
          </div>
          <div className="text-[11px] text-foreground-mute mt-1">
            {stats.unavailable ? "Needs attention" : "All entities reporting"}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between mb-3">
            <Label>Operator</Label>
            <CheckCircle2 className="w-3.5 h-3.5 text-odin-ok" strokeWidth={1.5} />
          </div>
          <div className="text-[14px] truncate">{user?.email ?? "—"}</div>
          <div className="text-[11px] text-foreground-mute mt-1">Authenticated</div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <SectionHead title="Entities by Domain" meta={`${stats.sorted.length} domains`} />
          <div className="space-y-2">
            {stats.sorted.map(([domain, count]) => {
              const pct = (count / stats.total) * 100;
              return (
                <div key={domain} className="flex items-center gap-3">
                  <span className="text-[12px] w-32 truncate">{domain}</span>
                  <div className="flex-1 h-1 bg-surface-inset relative">
                    <div
                      className="h-full bg-foreground-dim/60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="mono text-[11px] num w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Recent State Changes" meta="LIVE" />
          <ul className="space-y-2">
            {recentChanges.map((s) => (
              <li key={s.entity_id} className="flex items-center gap-3 text-[12px] py-1 border-b border-hairline/50">
                <Radio className="w-3 h-3 text-foreground-mute shrink-0" strokeWidth={1.5} />
                <span className="mono text-[10px] text-foreground-mute num shrink-0 w-12">
                  {new Date(s.last_changed!).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="flex-1 truncate text-foreground-dim">{friendly(s)}</span>
                <span className="mono text-[10px] text-odin-accent uppercase truncate max-w-[100px]">{s.state}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {unavailableEntities.length > 0 && (
        <Panel>
          <SectionHead title="Unavailable Entities" meta={`${stats.unavailable} TOTAL`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {unavailableEntities.map((s) => (
              <div key={s.entity_id} className="flex items-center gap-2 text-[12px]">
                <Activity className="w-3 h-3 text-odin-alert" strokeWidth={1.5} />
                <span className="truncate flex-1">{friendly(s)}</span>
                <span className="mono text-[10px] text-foreground-mute">{s.entity_id.split(".")[0]}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

export default DiagnosticsView;
