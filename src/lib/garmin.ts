// Garmin Connect (HACS) → ODIN Health view bridge
// HACS exposes entities as `sensor.garmin_connect_<slug>` where <slug>
// varies (sometimes includes username, sometimes prefixes like
// `7_day_average_resting_heart_rate`). We auto-detect by scanning all
// garmin_connect_* sensors and matching slug keywords, so it works
// regardless of the exact entity IDs.
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

// Build a map of garmin slug → state by scanning all entities once.
// Slug = entity_id minus the `sensor.garmin_connect_` prefix.
function buildIndex(states: Record<string, HaState>): Map<string, HaState> {
  const idx = new Map<string, HaState>();
  for (const id in states) {
    if (id.startsWith(PREFIX)) {
      idx.set(id.slice(PREFIX.length), states[id]);
    }
  }
  return idx;
}

// Find first sensor whose slug matches ALL `must` substrings and NONE of `not`.
// Tries exact-match preferences first, then keyword fallback.
function find(
  idx: Map<string, HaState>,
  preferred: string[],
  must: string[],
  not: string[] = [],
): HaState | undefined {
  for (const slug of preferred) {
    const hit = idx.get(slug);
    if (hit) return hit;
  }
  for (const [slug, st] of idx) {
    const lower = slug.toLowerCase();
    if (must.every((k) => lower.includes(k)) && not.every((k) => !lower.includes(k))) {
      return st;
    }
  }
  return undefined;
}

export function useGarmin(): GarminLive {
  const { states } = useHa();

  return useMemo(() => {
    const idx = buildIndex(states);

    // --- Sleep -------------------------------------------------------
    const sleepScore   = find(idx, ["sleep_score"], ["sleep_score"]);
    const totalSleep   = find(idx, ["total_sleep_duration", "sleep_duration"], ["sleep", "duration"], ["awake", "rem", "deep", "light", "need", "nap"]);
    const deep         = find(idx, ["deep_sleep"], ["deep", "sleep"]);
    const light        = find(idx, ["light_sleep"], ["light", "sleep"]);
    const rem          = find(idx, ["rem_sleep"], ["rem", "sleep"]);
    const awake        = find(idx, ["awake_sleep", "awake_time"], ["awake"]);
    const bedStart     = find(idx, ["wellness_start_time"], ["wellness", "start"]);
    const wakeTime     = find(idx, ["wake_time"], ["wake", "time"], ["optimal"]);
    const optimalBed   = find(idx, ["optimal_bedtime"], ["optimal", "bedtime"]);
    const optimalWake  = find(idx, ["optimal_wake_time"], ["optimal", "wake"]);

    // --- Heart -------------------------------------------------------
    // Prefer instantaneous "heart_rate"; fall back to averages.
    const hrCurrent    = find(idx, ["heart_rate"], ["heart_rate"], ["resting", "max", "average", "7_day", "min"]);
    const hrResting    = find(idx, ["resting_heart_rate", "7_day_average_resting_heart_rate"], ["resting", "heart"]);
    const hrMax        = find(idx, ["max_heart_rate"], ["max", "heart"]);
    const hrAvg        = find(idx, ["average_heart_rate"], ["average", "heart"], ["resting", "7_day"]);

    // --- Body battery / stress / scores -----------------------------
    const bb           = find(idx, ["body_battery"], ["body_battery"], ["charged", "drained", "high", "low"]);
    const stress       = find(idx, ["stress"], ["stress"], ["duration", "percentage", "qualifier", "rest", "uncategorized"]);
    const stressQual   = find(idx, ["stress_qualifier"], ["stress", "qualifier"]);
    const vo2          = find(idx, ["vo2_max"], ["vo2"]);
    const tReady       = find(idx, ["training_readiness"], ["training", "readiness"]);
    const tStatus      = find(idx, ["training_status"], ["training", "status"]);

    // --- Activity ----------------------------------------------------
    const steps        = find(idx, ["steps"], ["steps"], ["yesterday", "weekly", "average", "goal"]);
    const cals         = find(idx, ["wellness_calories", "calories"], ["calories"], ["active", "remaining", "goal", "bmr"]);
    const activeCals   = find(idx, ["wellness_active_calories", "active_calories"], ["active", "calories"]);
    const distance     = find(idx, ["wellness_distance"], ["distance"], ["yesterday", "weekly", "average"]);
    const vigMin       = find(idx, ["vigorous_intensity_minutes"], ["vigorous", "intensity"]);
    const modMin       = find(idx, ["moderate_intensity_minutes"], ["moderate", "intensity"]);
    const floors       = find(idx, ["floors_climbed"], ["floors"]);

    // --- Body composition / misc ------------------------------------
    const weight       = find(idx, ["weight"], ["weight"], ["goal"]);
    const bodyFat      = find(idx, ["body_fat"], ["body", "fat"]);
    const battery      = find(idx, ["battery_level"], ["battery", "level"]);
    const wellnessEnd  = find(idx, ["wellness_end_time"], ["wellness", "end"]);
    const alarm        = find(idx, ["next_alarm"], ["next", "alarm"]);

    // --- Derived -----------------------------------------------------
    const sleepSec = num(totalSleep);
    const sleepH = Math.floor(sleepSec / 3600);
    const sleepM = Math.floor((sleepSec % 3600) / 60);

    const score = num(sleepScore);
    const quality =
      score >= 90 ? "EXCELLENT" :
      score >= 80 ? "GOOD" :
      score >= 60 ? "FAIR" :
      score > 0   ? "POOR" : "—";

    const secToMin = (s?: HaState) => Math.round(num(s) / 60);

    const lastSync = wellnessEnd
      ? fmtAgo(wellnessEnd.last_updated)
      : (sleepScore ? fmtAgo(sleepScore.last_updated) : "—");

    const bedtime = bedStart
      ? hhmmFromIso(bedStart.state)
      : str(optimalBed, "—");
    const wake = wakeTime
      ? hhmmFromIso(wakeTime.state)
      : str(optimalWake, "—");

    return {
      connected: idx.size > 0,
      lastSync,
      device: {
        name: "Chris's Garmin Venu 4",
        battery: num(battery, 0),
      },
      sleep: {
        score,
        quality,
        duration: { h: sleepH, m: sleepM },
        stages: {
          deep: secToMin(deep),
          light: secToMin(light),
          rem: secToMin(rem),
          awake: secToMin(awake),
        },
        bedtime,
        wake,
        restingHr: num(hrResting),
      },
      heart: {
        current: num(hrCurrent, num(hrResting)),
        resting: num(hrResting),
        max: num(hrMax),
        avg24: num(hrAvg, num(hrResting)),
      },
      bodyBattery: {
        current: num(bb),
      },
      activity: {
        steps: num(steps),
        calories: num(cals),
        activeCalories: num(activeCals),
        distance: Math.round(num(distance) / 100) / 10, // m → km
        intensityMin: num(vigMin) + num(modMin),
        floors: num(floors),
      },
      stress: {
        current: num(stress),
        level: str(stressQual, "—").toUpperCase(),
      },
      vo2max: num(vo2),
      trainingReadiness: num(tReady),
      trainingStatus: str(tStatus, "—").toUpperCase(),
      weight: num(weight),
      bodyFat: num(bodyFat),
      alarmNext: alarm ? hhmmFromIso(alarm.state) : "—",
    };
  }, [states]);
}
