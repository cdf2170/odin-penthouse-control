// Garmin Connect (HACS) → ODIN Health view bridge
// HACS integration exposes entities as `sensor.garmin_connect_<friendly_name>`.
// This hook reads live values from the HA WebSocket store and overlays them
// onto the existing Health view shape so charts/trend mocks keep working
// until we wire history (recorder/statistics) in a follow-up.
import { useMemo } from "react";
import { useHa, type HaState } from "@/lib/ha-client";

const PREFIX = "sensor.garmin_connect_";

const num = (s: HaState | undefined, fallback = 0): number => {
  if (!s) return fallback;
  const n = parseFloat(s.state);
  return Number.isFinite(n) ? n : fallback;
};

const str = (s: HaState | undefined, fallback = ""): string =>
  s && s.state && s.state !== "unknown" && s.state !== "unavailable" ? s.state : fallback;

const fmtAgo = (iso?: string): string => {
  if (!iso) return "—";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const hhmmFromIso = (iso?: string): string => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
};

export interface GarminLive {
  connected: boolean;
  lastSync: string;
  device: { name: string; battery: number };
  sleep: {
    score: number;
    quality: string;
    duration: { h: number; m: number };
    stages: { deep: number; light: number; rem: number; awake: number }; // minutes
    bedtime: string;
    wake: string;
    restingHr: number;
  };
  heart: { current: number; resting: number; max: number; avg24: number };
  bodyBattery: { current: number };
  activity: {
    steps: number; calories: number; activeCalories: number;
    distance: number; intensityMin: number; floors: number;
  };
  stress: { current: number; level: string };
  vo2max: number;
  trainingReadiness: number;
  trainingStatus: string;
  weight: number;
  bodyFat: number;
  alarmNext: string;
}

export function useGarmin(): GarminLive {
  const { states } = useHa();

  return useMemo(() => {
    const get = (suffix: string) => states[`${PREFIX}${suffix}`];

    // Sleep stages are seconds in Garmin Connect HACS; convert to minutes.
    const secToMin = (s?: HaState) => Math.round(num(s) / 60);

    // Total sleep duration sensor is in seconds.
    const sleepSec = num(get("total_sleep_duration"), num(get("sleep_duration")));
    const sleepH = Math.floor(sleepSec / 3600);
    const sleepM = Math.floor((sleepSec % 3600) / 60);

    const wellnessEnd = get("wellness_end_time");
    const lastSync = fmtAgo(wellnessEnd?.last_updated);

    // Sleep quality bucket from score
    const score = num(get("sleep_score"));
    const quality =
      score >= 90 ? "EXCELLENT" :
      score >= 80 ? "GOOD" :
      score >= 60 ? "FAIR" :
      score > 0   ? "POOR" : "—";

    return {
      connected: !!get("steps") || !!get("sleep_score") || !!get("body_battery"),
      lastSync,
      device: {
        name: "Garmin Connect",
        battery: num(get("battery_level"), 0),
      },
      sleep: {
        score,
        quality,
        duration: { h: sleepH, m: sleepM },
        stages: {
          deep: secToMin(get("deep_sleep")),
          light: secToMin(get("light_sleep")),
          rem: secToMin(get("rem_sleep")),
          awake: secToMin(get("awake_sleep")) || secToMin(get("awake_time")),
        },
        bedtime: hhmmFromIso(get("wellness_start_time")?.state) ||
                 str(get("optimal_bedtime"), "—"),
        wake: hhmmFromIso(get("wake_time")?.state) ||
              str(get("optimal_wake_time"), "—"),
        restingHr: num(get("resting_heart_rate")),
      },
      heart: {
        current: num(get("heart_rate"), num(get("resting_heart_rate"))),
        resting: num(get("resting_heart_rate")),
        max: num(get("max_heart_rate"), 0),
        avg24: num(get("average_heart_rate"), num(get("resting_heart_rate"))),
      },
      bodyBattery: {
        current: num(get("body_battery")),
      },
      activity: {
        steps: num(get("steps")),
        calories: num(get("wellness_calories"), num(get("calories"))),
        activeCalories: num(get("wellness_active_calories"), num(get("active_calories"))),
        distance: Math.round(num(get("wellness_distance")) / 100) / 10, // m → km
        intensityMin: num(get("vigorous_intensity_minutes")) +
                      num(get("moderate_intensity_minutes")),
        floors: num(get("floors_climbed"), 0),
      },
      stress: {
        current: num(get("stress")),
        level: str(get("stress_qualifier"), "—").toUpperCase(),
      },
      vo2max: num(get("vo2_max")),
      trainingReadiness: num(get("training_readiness")),
      trainingStatus: str(get("training_status"), "—").toUpperCase(),
      weight: num(get("weight")),
      bodyFat: num(get("body_fat")),
      alarmNext: hhmmFromIso(get("next_alarm")?.state),
    };
  }, [states]);
}
