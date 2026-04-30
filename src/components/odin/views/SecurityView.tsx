import { useMemo } from "react";
import { Lock, Unlock, Shield, DoorClosed, Activity } from "lucide-react";
import { Panel, Label, SectionHead, TactileButton, StatusDot } from "../primitives";
import { useHa } from "@/lib/ha-client";
import { useDiscovery } from "@/lib/ha-discovery";
import { friendly } from "@/lib/ha-discovery";

const ARM_TO_SERVICE: Record<string, { service: string; label: string }> = {
  Disarmed: { service: "alarm_disarm", label: "disarmed" },
  Stay: { service: "alarm_arm_home", label: "armed_home" },
  Night: { service: "alarm_arm_night", label: "armed_night" },
  Away: { service: "alarm_arm_away", label: "armed_away" },
};
const STATE_TO_LABEL: Record<string, string> = {
  disarmed: "Disarmed",
  armed_home: "Stay",
  armed_night: "Night",
  armed_away: "Away",
  pending: "Pending",
  triggered: "TRIGGERED",
  arming: "Arming",
  disarming: "Disarming",
};

export default function SecurityView() {
  const { callService } = useHa();
  const { alarm, doorSensors, motionSensors } = useDiscovery();

  const armLabel = alarm ? STATE_TO_LABEL[alarm.state] ?? alarm.state : "—";
  const triggered = alarm?.state === "triggered";

  const groups = useMemo(
    () => [
      { zone: "Doors & Openings", items: doorSensors },
      { zone: "Motion & Occupancy", items: motionSensors },
    ],
    [doorSensors, motionSensors],
  );

  const setArm = (m: keyof typeof ARM_TO_SERVICE) => {
    if (!alarm) return;
    callService("alarm_control_panel", ARM_TO_SERVICE[m].service, {
      entity_id: alarm.entity_id,
    });
  };

  return (
    <div className="space-y-6">
      <Panel accent>
        <div className="flex items-start justify-between mb-5">
          <div>
            <Label>Security</Label>
            <div className="text-[20px] font-medium mt-2 tracking-[0.04em] flex items-center gap-3">
              {armLabel === "Disarmed" || armLabel === "—" ? (
                <Unlock className="w-5 h-5 text-foreground-dim" strokeWidth={1.5} />
              ) : (
                <Lock
                  className={`w-5 h-5 ${triggered ? "text-odin-alert" : "text-odin-ok"}`}
                  strokeWidth={1.5}
                />
              )}
              System {armLabel}
            </div>
            <div className="text-[12px] text-foreground-dim mt-1">
              {doorSensors.length + motionSensors.length} sensors monitored · live
            </div>
          </div>
          <Shield className="w-4 h-4 text-foreground-mute" strokeWidth={1.5} />
        </div>
        {alarm ? (
          <div className="flex gap-1.5">
            {(["Disarmed", "Stay", "Night", "Away"] as const).map((m) => (
              <TactileButton
                key={m}
                active={armLabel === m}
                onClick={() => setArm(m)}
                className="!px-5 !py-2.5"
              >
                {m}
              </TactileButton>
            ))}
          </div>
        ) : (
          <div className="text-[12px] text-foreground-mute">
            No alarm panel detected. Add `alarm_control_panel.*` in HA or set in mapping.
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {groups.map((group) => (
            <Panel key={group.zone}>
              <SectionHead
                title={group.zone}
                meta={`${group.items.length} SENSORS`}
              />
              {group.items.length === 0 ? (
                <div className="text-[12px] text-foreground-mute py-3">
                  None discovered.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-6">
                  {group.items.map((s) => {
                    const open = s.state === "on";
                    const isMotion =
                      s.attributes?.device_class === "motion" ||
                      s.attributes?.device_class === "occupancy";
                    const Icon = isMotion ? Activity : DoorClosed;
                    return (
                      <div
                        key={s.entity_id}
                        className="flex items-center gap-3 py-2.5 border-b border-hairline/60"
                      >
                        <Icon
                          className="w-3.5 h-3.5 text-foreground-mute"
                          strokeWidth={1.5}
                        />
                        <span className="text-[13px] flex-1 truncate">
                          {friendly(s)}
                        </span>
                        <StatusDot
                          state={open ? (isMotion ? "active" : "alert") : "ok"}
                        />
                        <span className="mono text-[10px] text-foreground-dim w-16 text-right">
                          {isMotion
                            ? open
                              ? "ACTIVE"
                              : "CLEAR"
                            : open
                              ? "OPEN"
                              : "CLOSED"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          ))}
        </div>

        <Panel>
          <SectionHead title="Recent Changes" meta="DERIVED FROM SENSORS" />
          <ul className="space-y-3">
            {[...doorSensors, ...motionSensors]
              .filter((s) => s.last_changed)
              .sort(
                (a, b) =>
                  new Date(b.last_changed!).getTime() -
                  new Date(a.last_changed!).getTime(),
              )
              .slice(0, 8)
              .map((s) => (
                <li key={s.entity_id} className="border-b border-hairline/60 pb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="mono text-[11px] text-foreground-mute num">
                      {new Date(s.last_changed!).toLocaleTimeString("en-US", {
                        hour12: false,
                      })}
                    </span>
                    <span className="mono text-[10px] text-foreground-mute uppercase">
                      {s.state}
                    </span>
                  </div>
                  <div className="text-[12px] text-foreground-dim truncate">
                    {friendly(s)}
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
