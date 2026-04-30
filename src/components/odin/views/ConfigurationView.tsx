// ODIN Configuration — profile + role + entity mapping reference
import { useEffect, useState } from "react";
import { User, Shield, FileCode } from "lucide-react";
import { Panel, Label, SectionHead } from "@/components/odin/primitives";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { haMap } from "@/lib/ha-mapping";
import { toast } from "sonner";

const ConfigurationView = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      setDisplayName(profile?.display_name ?? "");
      setRole(roles?.[0]?.role ?? null);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <div className="space-y-6 max-w-[1100px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel>
          <div className="flex items-center justify-between mb-4">
            <Label>Operator Profile</Label>
            <User className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
          </div>
          <div className="space-y-4">
            <div>
              <Label className="block mb-1.5">Email</Label>
              <div className="text-[13px] text-foreground-dim mono">{user?.email}</div>
            </div>
            <div>
              <Label className="block mb-1.5">Display Name</Label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-surface-inset border border-hairline-strong px-3 py-2 text-[13px] text-foreground focus:outline-none focus:border-odin-accent"
              />
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="btn-tactile active px-4 py-2 text-[11px] tracking-[0.14em] uppercase disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between mb-4">
            <Label>Authorization</Label>
            <Shield className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <div>
              <Label className="block mb-1.5">Role</Label>
              <div className="mono text-[16px] uppercase text-odin-accent">{role ?? "—"}</div>
            </div>
            <div className="text-[11px] text-foreground-mute leading-relaxed">
              {role === "owner"
                ? "Full residence control. May invite operators and assign roles."
                : role === "family"
                ? "Standard household access. Cannot manage roles."
                : "No role assigned."}
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionHead title="Entity Mapping" meta="src/lib/ha-mapping.ts" />
        <div className="text-[12px] text-foreground-dim mb-4 leading-relaxed">
          ODIN auto-discovers Home Assistant entities by domain & naming. The mappings below are manual overrides — edit them in code to bind specific HA entity IDs to ODIN UI slots.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <MappingBlock title="Garage" entries={Object.entries(haMap.garage)} />
          <MappingBlock title="Security" entries={[["alarm", haMap.security.alarm], ...haMap.security.sensors.map((s) => [s.name, s.entity] as [string, string])]} />
          <MappingBlock title="Cameras" entries={[["doorbell", haMap.cameras.doorbell], ...haMap.cameras.others.map((c, i) => [`other_${i + 1}`, c] as [string, string])]} />
          <MappingBlock title="Climate Zones" entries={haMap.climate.zones.map((z) => [z.name, z.entity])} />
          <MappingBlock title="Voice Satellites" entries={haMap.voice_satellites.map((v) => [v.name, v.entity])} />
          <MappingBlock title="Rooms" entries={Object.keys(haMap.rooms).map((r) => [r, `${(haMap.rooms as any)[r].lights?.length ?? 0} lights`])} />
        </div>
        <div className="mt-5 pt-4 border-t border-hairline flex items-center gap-2 text-[11px] text-foreground-mute">
          <FileCode className="w-3 h-3" strokeWidth={1.5} />
          To remap: edit <span className="mono text-foreground-dim">src/lib/ha-mapping.ts</span>
        </div>
      </Panel>
    </div>
  );
};

const MappingBlock = ({ title, entries }: { title: string; entries: [string, string][] }) => (
  <div>
    <Label className="block mb-2">{title}</Label>
    <ul className="space-y-1">
      {entries.map(([k, v]) => (
        <li key={k} className="flex justify-between gap-3 text-[11px] py-1 border-b border-hairline/50">
          <span className="text-foreground-dim truncate">{k}</span>
          <span className="mono text-foreground-mute truncate">{v}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ConfigurationView;
