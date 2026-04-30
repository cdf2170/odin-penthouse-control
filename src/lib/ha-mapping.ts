// ODIN entity mapping
// Map Home Assistant entity IDs to ODIN UI slots.
// Edit these to match your installation.

export const haMap = {
  rooms: {
    "Living Room": {
      lights: [
        "light.living_room",
        "light.living_room_lamp_1",
        "light.living_room_lamp_2",
        "light.living_room_signe",
      ],
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
      lights: [
        "light.kitchen",
        "light.kitchen_island_1",
        "light.kitchen_island_2",
        "light.kitchen_cabinet_strip_1",
        "light.kitchen_cabinet_strip_2",
        "light.kitchen_counter_lamp_1",
        "light.kitchen_counter_lamp_2",
      ],
      scenes: {
        Cook: "scene.kitchen_cook",
        Dine: "scene.kitchen_dine",
        Off: "scene.kitchen_off",
      },
      occupancy: "binary_sensor.kitchen_motion",
      media_player: "media_player.sonos_kitchen",
    },
    Bedroom: {
      lights: [
        "light.bedroom",
        "light.bedroom_lamp_1",
        "light.bedroom_lamp_2",
      ],
      scenes: {
        Wind_Down: "scene.bedroom_wind_down",
        Sleep: "scene.bedroom_sleep",
        Off: "scene.bedroom_off",
      },
      occupancy: "binary_sensor.bedroom_motion",
      media_player: "media_player.sonos_bedroom",
    },
    Office: {
      lights: [
        "light.office",
        "light.office_light_strip_1",
        "light.office_lamp_1",
      ],
      scenes: {},
      occupancy: "binary_sensor.office_motion",
    },
    Bathroom: {
      lights: [
        "light.bathroom",
        "light.bathroom_lightstrip",
      ],
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
