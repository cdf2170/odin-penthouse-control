// ODIN entity mapping
// Map Home Assistant entity IDs to ODIN UI slots.
// Configured for Chris's residence (cleaned 2026-05-02).

export const haMap = {
  presence: {
    person: "person.chris_farrell",
    device_tracker: "device_tracker.chris_iphone_17_pro",
  },
  rooms: {
    "Living Room": {
      lights: [
        "light.living_room",
        "light.living_room_lamp_1",
        "light.living_room_lamp_2",
        "light.living_room_signe",
      ],
      scenes: {
        "Coming Home at Night": "scene.living_room_lights_shine",
        Movie: "scene.living_room_lights_movie",
        Cooking: "scene.living_room_lights_bright",
        Chill: "scene.living_room_lights_relax",
      },
      occupancy: "binary_sensor.presence_sensor_fp2_6426_presence_sensor_2",
      media_player: "media_player.living_room_speakers_2",
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
        "Coming Home at Night": "scene.kitchen_lights_shine",
        Movie: "scene.kitchen_lights_movie",
        Cooking: "scene.kitchen_lights_bright",
        Chill: "scene.kitchen_lights_relax",
      },
      // Kitchen presence — coming soon
      occupancy: "",
    },
    Bedroom: {
      lights: [
        "light.bedroom",
        "light.bedroom_lamp_1",
        "light.bedroom_lamp_2",
      ],
      scenes: {
        Bedtime: "scene.bedroom_lights_storybook",
        "Entering Room": "scene.bedroom_lights_read",
      },
      occupancy: "binary_sensor.presence_sensor_bedroom_presence_sensor_1",
      media_player: "media_player.bedroom",
    },
    Office: {
      lights: [
        "light.office",
        "light.office_lamp_1",
        "light.office_light_strip_1",
      ],
      scenes: {
        "Deep Work": "scene.office_bright",
        "Entering Room": "scene.office_read",
      },
      occupancy: "binary_sensor.office_presence_sensor_presence_sensor_1",
    },
    Bathroom: {
      lights: [
        "light.bathroom",
        "light.bathroom_lightstrip",
      ],
      scenes: {
        Nightlight: "scene.bathroom_lights_tropical_twilight",
      },
      // Bathroom presence — coming soon; fall back to motion
      occupancy: "binary_sensor.bathroom_motion_sensor",
    },
  },
  presence_zones: {
    "Entry Way": "binary_sensor.presence_sensor_fp2_6426_presence_sensor_1",
    "Living Room": "binary_sensor.presence_sensor_fp2_6426_presence_sensor_2",
    "Office Zone 1": "binary_sensor.office_presence_sensor_presence_sensor_1",
    "Office Zone 2": "binary_sensor.office_presence_sensor_presence_sensor_2",
    "Office Zone 3":
      "binary_sensor.office_presence_sensor_presence_sensor_fp2_d02a_presence_sensor_3",
    "Bedroom Zone 1": "binary_sensor.presence_sensor_bedroom_presence_sensor_1",
    "Bedroom Zone 2": "binary_sensor.presence_sensor_bedroom_presence_sensor_2",
  },
  climate: {
    zones: [
      { name: "Home", entity: "climate.t10_plus_thermostat" },
    ],
    temperature: "sensor.t10_plus_thermostat_current_temperature",
    humidity: "sensor.t10_plus_thermostat_current_humidity",
  },
  garage: {
    cover: "cover.ratgdo32disco_2930c0_door",
    motor: "binary_sensor.ratgdo32disco_2930c0_motor",
    openings: "sensor.ratgdo32disco_2930c0_openings",
    button: "event.button",
  },
  security: {
    // No alarm_control_panel in this install — UI falls back gracefully.
    alarm: "",
    sensors: [
      { name: "Front Door", entity: "binary_sensor.front_door_sensor" },
      { name: "Back Door", entity: "binary_sensor.back_door_sensor" },
      { name: "Office Door", entity: "binary_sensor.office_door_sensor" },
      { name: "Bedroom Door", entity: "binary_sensor.bedroom_door_sensor" },
      { name: "Bathroom Door", entity: "binary_sensor.bathroom_door_sensor" },
      { name: "Hallway Motion", entity: "binary_sensor.hallway_motion_sensor" },
      { name: "Bathroom Motion", entity: "binary_sensor.bathroom_motion_sensor" },
      { name: "Front Door Person", entity: "binary_sensor.front_door_person" },
      { name: "Front Door Vehicle", entity: "binary_sensor.front_door_vehicle" },
      { name: "Front Door Pet", entity: "binary_sensor.front_door_pet" },
      { name: "Front Door Visitor", entity: "binary_sensor.front_door_visitor" },
    ],
    // Front door lock (SwitchBot) — coming soon
    lock: "",
  },
  cameras: {
    doorbell: "camera.front_door_fluent",
    motion: "binary_sensor.front_door_motion",
    person: "binary_sensor.front_door_person",
    vehicle: "binary_sensor.front_door_vehicle",
    pet: "binary_sensor.front_door_pet",
    visitor: "binary_sensor.front_door_visitor",
    day_night: "sensor.front_door_day_night_state",
    others: [],
  },
  media: {
    tv: "media_player.tlc_smart_tv",
    tv_remote: "remote.tlc_smart_tv",
    living_room_speakers: "media_player.living_room_speakers_2",
    bedroom_speaker: "media_player.bedroom",
    spotify: "media_player.spotify_cdfarrell",
  },
  air_quality: {
    purifier: "fan.vital_200s_series",
    aqi: "sensor.vital_200s_series_air_quality",
    pm25: "sensor.vital_200s_series_pm2_5",
  },
  energy: {
    usage_to_date: "sensor.evergy_account_current_bill_electric_usage_to_date",
    forecasted_usage:
      "sensor.evergy_account_current_bill_electric_forecasted_usage",
    cost_to_date: "sensor.evergy_account_current_bill_electric_cost_to_date",
    forecasted_cost:
      "sensor.evergy_account_current_bill_electric_forecasted_cost",
  },
  bedroom_fan: {
    switch: "switch.bedroom_fan_smart_plug",
    power: "sensor.bedroom_fan_smart_plug_power",
  },
  xbox: {
    online: "binary_sensor.compoundbreak90",
    in_game: "binary_sensor.compoundbreak90_in_game",
    now_playing: "sensor.compoundbreak90_now_playing",
    last_online: "sensor.compoundbreak90_last_online",
  },
  calendars: [
    { name: "Chris", entity: "calendar.cdfarrell19_gmail_com" },
    { name: "Birthdays", entity: "calendar.birthdays" },
    { name: "US Holidays", entity: "calendar.holidays_in_united_states" },
  ],
  weather: {
    home: "weather.home",
    nws: "weather.nws_38_80174912345508_94_4437722027588_klxt",
  },
  scripts: {
    goodnight: "script.goodnight",
    wake_up: "script.wake_up",
    relax: "script.relax",
    cinema: "script.cinema",
  },
  automations: {
    front_door_after_dark: "automation.front_door_opens_full_lights_after_dark",
    garage_button_toggle: "automation.garage_door_button_toggle_2",
    bedroom_fan_on_night: "automation.bedroom_fan_turn_on_at_night",
    bedroom_fan_off_morning: "automation.bedroom_fan_turn_off_in_morning",
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
