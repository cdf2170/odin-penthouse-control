// ODIN entity discovery
// Auto-discovers HA entities by domain + name patterns.
// User overrides in src/lib/ha-mapping.ts always win.
import { useMemo } from "react";
import { useHa, type HaState } from "@/lib/ha-client";
import { haMap } from "@/lib/ha-mapping";

export const friendly = (s?: HaState) =>
  s?.attributes?.friendly_name ?? s?.entity_id ?? "—";

export const isOn = (s?: HaState) =>
  s?.state === "on" || s?.state === "open" || s?.state === "playing";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Match an entity to a room by checking entity_id, friendly_name, and area_id
const matchRoom = (s: HaState, room: string) => {
  const r = norm(room);
  return (
    norm(s.entity_id).includes(r) ||
    norm(s.attributes?.friendly_name ?? "").includes(r) ||
    norm(s.attributes?.area_id ?? "").includes(r)
  );
};

const byDomain = (states: Record<string, HaState>, domain: string) =>
  Object.values(states).filter((s) => s.entity_id.startsWith(`${domain}.`));

export function useDiscovery() {
  const { states } = useHa();

  return useMemo(() => {
    const lights = byDomain(states, "light");
    const scenes = byDomain(states, "scene");
    const climates = byDomain(states, "climate");
    const covers = byDomain(states, "cover");
    const mediaPlayers = byDomain(states, "media_player");
    const cameras = byDomain(states, "camera");
    const binarySensors = byDomain(states, "binary_sensor");
    const sensors = byDomain(states, "sensor");
    const alarmPanels = byDomain(states, "alarm_control_panel");
    const assistSatellites = byDomain(states, "assist_satellite");
    const fans = byDomain(states, "fan");

    // Garage cover (look for "garage" or device_class=garage)
    const overrideGarage = haMap.garage.cover;
    const garageCover =
      states[overrideGarage] ??
      covers.find(
        (c) =>
          c.attributes?.device_class === "garage" ||
          norm(c.entity_id).includes("garage"),
      );

    // Doorbell camera (override or first cam containing doorbell/front)
    const overrideDoorbell = haMap.cameras.doorbell;
    const doorbell =
      states[overrideDoorbell] ??
      cameras.find((c) =>
        /(doorbell|frontdoor|front_door|entry)/.test(norm(c.entity_id)),
      ) ??
      cameras[0];

    const otherCameras = cameras.filter((c) => c.entity_id !== doorbell?.entity_id);

    // Alarm
    const alarm = states[haMap.security.alarm] ?? alarmPanels[0];

    // Door/motion sensors
    const doorSensors = binarySensors.filter(
      (s) =>
        s.attributes?.device_class === "door" ||
        s.attributes?.device_class === "window" ||
        s.attributes?.device_class === "opening",
    );
    const motionSensors = binarySensors.filter(
      (s) =>
        s.attributes?.device_class === "motion" ||
        s.attributes?.device_class === "occupancy" ||
        s.attributes?.device_class === "presence",
    );

    // Air purifier (fan with friendly name containing purifier/air)
    const airPurifier = fans.find((f) =>
      /(purifier|air)/.test(norm(f.attributes?.friendly_name ?? f.entity_id)),
    );

    // Bedroom fan (fan in the bedroom, excluding the air purifier)
    const bedroomFan = fans.find(
      (f) =>
        f.entity_id !== airPurifier?.entity_id &&
        /bedroom/.test(norm(f.attributes?.friendly_name ?? f.entity_id)),
    );

    // Fixed canonical room list — no auto-discovery to avoid duplicates like "Kitchen" vs "Kitchen All"
    const ALLOWED_ROOMS = [
      "Living Room",
      "Bedroom",
      "Kitchen",
      "Second Floor Bathroom",
      "Office",
      "Garage",
    ];

    const roomBundle = (room: string) => {
      const override = (haMap.rooms as Record<string, any>)[room];
      const rn = norm(room);
      // Match lights by room — but exclude obvious "all"/group entities to dedupe
      const matchedLights = lights.filter(
        (l) =>
          matchRoom(l, room) &&
          !/all$/.test(norm(l.entity_id)) &&
          !/\ball\b/.test((l.attributes?.friendly_name ?? "").toLowerCase()),
      );
      const rLights = override?.lights
        ? (override.lights as string[]).map((id) => states[id]).filter(Boolean)
        : matchedLights;
      const rScenes = override?.scenes
        ? Object.entries(override.scenes as Record<string, string>).map(
            ([name, id]) => ({ name, entity: id, state: states[id] }),
          )
        : scenes
            .filter((sc) => matchRoom(sc, room))
            .map((sc) => ({
              name: friendly(sc).replace(new RegExp(room, "i"), "").trim() || friendly(sc),
              entity: sc.entity_id,
              state: sc,
            }));
      const occupancy = override?.occupancy
        ? states[override.occupancy]
        : motionSensors.find((m) => matchRoom(m, room));
      const mediaPlayer = override?.media_player
        ? states[override.media_player]
        : mediaPlayers.find((m) => matchRoom(m, room));
      return { room, lights: rLights, scenes: rScenes, occupancy, mediaPlayer };
    };

    const rooms = ALLOWED_ROOMS.map(roomBundle).filter(
      (r) => r.lights.length > 0 || r.scenes.length > 0,
    );

    // Climate zones: use override zones if any are present in states; else discover all climate.*
    const zonesFromMap = haMap.climate.zones
      .map((z) => ({ name: z.name, state: states[z.entity] }))
      .filter((z) => z.state);
    const climateZones =
      zonesFromMap.length > 0
        ? zonesFromMap
        : climates.map((c) => ({ name: friendly(c), state: c }));

    // Voice satellites
    const voiceSatellites =
      haMap.voice_satellites
        .map((v) => ({ name: v.name, state: states[v.entity] }))
        .filter((v) => v.state).length > 0
        ? haMap.voice_satellites
            .map((v) => ({ name: v.name, state: states[v.entity] }))
            .filter((v) => v.state)
        : assistSatellites.map((a) => ({ name: friendly(a), state: a }));

    return {
      lights,
      scenes,
      climates,
      covers,
      mediaPlayers,
      cameras,
      doorSensors,
      motionSensors,
      alarm,
      garageCover,
      doorbell,
      otherCameras,
      airPurifier,
      bedroomFan,
      rooms,
      climateZones,
      voiceSatellites,
    };
  }, [states]);
}
