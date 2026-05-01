// ODIN entity mapping
// Map Home Assistant entity IDs to ODIN UI slots.
// Configured for Chris's residence (455-entity install, 2026-05-01).

export const haMap = {
  rooms: {
    "Living Room": {
      lights: [
        "light.living_room",
        "light.living_room_all",
        "light.living_room_lamp_1",
        "light.living_room_lamp_2",
        "light.living_room_signe",
      ],
      scenes: {},
      occupancy: "binary_sensor.presence_sensor_fp2_6426_presence_sensor_1",
      media_player: "media_player.living_room_speakers_2",
    },
    Kitchen: {
      lights: [
        "light.kitchen",
        "light.kitchen_all",
        "light.kitchen_island_1",
        "light.kitchen_island_2",
        "light.kitchen_cabinet_strip_1",
        "light.kitchen_cabinet_strip_2",
        "light.kitchen_counter_lamp_1",
        "light.kitchen_counter_lamp_2",
      ],
      scenes: {
        Chill: "scene.kitchen_chill",
        "Rolling Hills": "scene.kitchen_lights_rolling_hills",
        Read: "scene.kitchen_read",
        Shine: "scene.kitchen_shine",
      },
      // No dedicated kitchen motion sensor in this install
      occupancy: "binary_sensor.hallway_motion_sensor",
    },
    Bedroom: {
      lights: [
        "light.bedroom",
        "light.bedroom_all",
        "light.bedroom_lamp_1",
        "light.bedroom_lamp_2",
      ],
      scenes: {},
      occupancy: "binary_sensor.presence_sensor_bedroom_presence_sensor_1",
      media_player: "media_player.bedroom",
    },
    Office: {
      lights: [
        "light.office",
        "light.office_lamp_1",
        "light.office_light_strip_1",
      ],
      scenes: {},
      occupancy: "binary_sensor.office_presence_sensor_presence_sensor_1",
      media_player:
        "media_player.atom_echo_office_atom_echo_office_speaker",
    },
    Bathroom: {
      lights: [
        "light.bathroom",
        "light.bathroom_lightstrip",
      ],
      scenes: {},
      occupancy: "binary_sensor.bathroom_motion_sensor",
    },
  },
  climate: {
    zones: [
      { name: "Home", entity: "climate.t10_plus_thermostat" },
    ],
  },
  garage: {
    cover: "cover.ratgdo32disco_2930c0_door",
    vehicle: "binary_sensor.ratgdo32disco_2930c0_vehicle_detected",
  },
  security: {
    // No alarm_control_panel in this install — UI falls back gracefully.
    alarm: "",
    sensors: [
      { name: "Front Door", entity: "binary_sensor.front_door_sensor" },
      { name: "Back Door", entity: "binary_sensor.back_door_sensor" },
      { name: "Bedroom Door", entity: "binary_sensor.bedroom_door_sensor" },
      { name: "Bathroom Door", entity: "binary_sensor.bathroom_door_sensor" },
      { name: "Office Door", entity: "binary_sensor.office_door_sensor" },
      { name: "Hallway Motion", entity: "binary_sensor.hallway_motion_sensor" },
      { name: "Bathroom Motion", entity: "binary_sensor.bathroom_motion_sensor" },
      { name: "Front Door Person", entity: "binary_sensor.front_door_person" },
      { name: "Front Door Vehicle", entity: "binary_sensor.front_door_vehicle" },
    ],
  },
  cameras: {
    doorbell: "camera.front_door_fluent",
    others: [],
  },
  voice_satellites: [
    {
      name: "Living Room",
      entity:
        "media_player.atom_echo_living_room_atom_echo_living_room_speaker",
    },
    {
      name: "Office",
      entity: "media_player.atom_echo_office_atom_echo_office_speaker",
    },
  ],
} as const;

export type HaMap = typeof haMap;
