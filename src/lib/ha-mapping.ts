// ODIN entity mapping
// Map Home Assistant entity IDs to ODIN UI slots.
// Edit these to match your installation.

export const haMap = {
  rooms: {
    "Living Room": {
      lights: ["light.living_room_cove", "light.living_room_pendants"],
      scenes: {
        Cinema: "scene.living_room_cinema",
        Evening: "scene.living_room_evening",
        Reading: "scene.living_room_reading",
        Off: "scene.living_room_off",
      },
      occupancy: "binary_sensor.living_room_motion",
      media_player: "media_player.sonos_living_room",
    },
    Kitchen: {
      lights: ["light.kitchen_pendants", "light.kitchen_under_cabinet"],
      scenes: {
        Cook: "scene.kitchen_cook",
        Dine: "scene.kitchen_dine",
        Off: "scene.kitchen_off",
      },
      occupancy: "binary_sensor.kitchen_motion",
      media_player: "media_player.sonos_kitchen",
    },
    Bedroom: {
      lights: ["light.bedroom_lamps"],
      scenes: {
        Wind_Down: "scene.bedroom_wind_down",
        Sleep: "scene.bedroom_sleep",
        Off: "scene.bedroom_off",
      },
      occupancy: "binary_sensor.bedroom_motion",
      media_player: "media_player.sonos_bedroom",
    },
    Bathroom: {
      lights: ["light.bathroom_lightstrip"],
      scenes: {},
      occupancy: "binary_sensor.bathroom_motion",
    },
  },
  climate: {
    zones: [
      { name: "Living Room", entity: "climate.t10_living_room" },
      { name: "Bedroom", entity: "climate.t10_bedroom" },
      { name: "Office", entity: "climate.t10_office" },
    ],
  },
  garage: {
    cover: "cover.garage_door",
    vehicle: "sensor.tesla_battery_level",
  },
  security: {
    alarm: "alarm_control_panel.home_alarm",
    sensors: [
      { name: "Front Door", entity: "binary_sensor.front_door_contact" },
      { name: "Back Door", entity: "binary_sensor.back_door_contact" },
      { name: "Garage Motion", entity: "binary_sensor.garage_motion" },
    ],
  },
  cameras: {
    doorbell: "camera.front_doorbell",
    others: [
      "camera.driveway",
      "camera.backyard",
      "camera.garage",
    ],
  },
  voice_satellites: [
    { name: "Living Room", entity: "assist_satellite.odin_voice_living_room" },
    { name: "Office", entity: "assist_satellite.odin_voice_office" },
  ],
} as const;

export type HaMap = typeof haMap;
