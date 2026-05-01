// ODIN Health — Garmin-ready biometrics dashboard (mock data scaffold)
import { useMemo, useState } from "react";
import {
  Heart, Moon, Flame, Footprints, Activity, Droplet, Wind,
  TrendingUp, TrendingDown, Watch, Zap, Gauge, Mountain, ChevronRight, X,
  Battery, Apple, Beef, Wheat, Nut, User
} from "lucide-react";
import { Panel, Label, StatusDot, SectionHead, Hairline, TactileButton } from "@/components/odin/primitives";
import { useGarmin } from "@/lib/garmin";

/* ------------------------------------------------------------------ */
/* MOCK DATA — fallback shape; live Garmin Connect values overlay it. */
/* Trend arrays (week/month) remain mock until HA recorder/statistics */
/* history is wired in a follow-up.                                    */
/* ------------------------------------------------------------------ */
const mockHealth = {
  device: { name: "Chris's Garmin Venu 4", battery: 64, lastSync: "2 min ago" },
  bodyBattery: { current: 78, charged: 92, drained: 14 },
  sleep: {
    score: 86,
    quality: "EXCELLENT",
    duration: { h: 7, m: 42 },
    stages: { deep: 92, light: 224, rem: 118, awake: 28 }, // minutes
    bedtime: "23:18",
    wake: "07:00",
    restingHr: 52,
    hrv: 68,
    // Last 7 nights (oldest → newest)
    week: [
      { day: "Fri", score: 72, hours: 6.4 },
      { day: "Sat", score: 68, hours: 5.9 },
      { day: "Sun", score: 81, hours: 7.2 },
      { day: "Mon", score: 79, hours: 7.0 },
      { day: "Tue", score: 88, hours: 8.1 },
      { day: "Wed", score: 84, hours: 7.6 },
      { day: "Thu", score: 86, hours: 7.7 },
    ],
    // Last 30 nights (oldest → newest)
    month: [
      74, 71, 80, 77, 69, 65, 78, 82, 75, 73,
      80, 84, 79, 72, 68, 76, 81, 85, 83, 77,
      72, 68, 81, 79, 88, 84, 86, 82, 85, 86,
    ],
  },
  heart: {
    current: 64,
    resting: 52,
    max: 178,
    avg24: 71,
    zones: [
      { name: "Z1 Recovery", min: 95, max: 114, mins: 412 },
      { name: "Z2 Endurance", min: 115, max: 133, mins: 38 },
      { name: "Z3 Tempo", min: 134, max: 152, mins: 12 },
      { name: "Z4 Threshold", min: 153, max: 171, mins: 4 },
      { name: "Z5 Max", min: 172, max: 190, mins: 1 },
    ],
    series: [62, 64, 60, 58, 56, 54, 53, 52, 54, 68, 82, 94, 88, 76, 72, 70, 78, 92, 86, 74, 68, 66, 64, 64],
  },
  activity: {
    steps: 8421,
    stepsGoal: 10000,
    calories: 2186,
    caloriesGoal: 2800,
    floors: 14,
    floorsGoal: 10,
    distance: 6.2, // km
    intensityMin: 42,
    intensityGoal: 150,
  },
  stress: { current: 24, avg: 31, level: "LOW" },
  spo2: 97,
  respiration: 14,
  hydration: { intake: 1.8, goal: 3.0 },
  vo2max: 52,
  trainingReadiness: 84,
  trainingStatus: "PRODUCTIVE",
  recentWorkouts: [
    { date: "Yesterday", type: "Strength", duration: "48m", load: 142 },
    { date: "Apr 29", type: "Run · 8.2 km", duration: "41m", load: 188 },
    { date: "Apr 28", type: "Yoga", duration: "32m", load: 28 },
  ],
  // Body Battery week/month (0–100)
  bodyBatteryTrend: {
    week: [
      { day: "Fri", high: 88, low: 22, end: 41 },
      { day: "Sat", high: 94, low: 28, end: 55 },
      { day: "Sun", high: 96, low: 35, end: 62 },
      { day: "Mon", high: 84, low: 18, end: 36 },
      { day: "Tue", high: 90, low: 24, end: 48 },
      { day: "Wed", high: 92, low: 30, end: 58 },
      { day: "Thu", high: 95, low: 32, end: 78 },
    ],
    month: [
      62, 58, 71, 64, 55, 48, 66, 72, 68, 60,
      74, 78, 70, 62, 54, 66, 75, 80, 76, 68,
      60, 56, 72, 70, 82, 78, 80, 74, 79, 78,
    ],
  },
  // Heart rate week/month (resting bpm)
  heartTrend: {
    week: [
      { day: "Fri", resting: 56, avg: 74, max: 162 },
      { day: "Sat", resting: 54, avg: 71, max: 178 },
      { day: "Sun", resting: 53, avg: 68, max: 142 },
      { day: "Mon", resting: 55, avg: 73, max: 155 },
      { day: "Tue", resting: 52, avg: 70, max: 168 },
      { day: "Wed", resting: 51, avg: 69, max: 148 },
      { day: "Thu", resting: 52, avg: 71, max: 158 },
    ],
    month: [
      58, 57, 56, 55, 56, 54, 55, 53, 54, 55,
      54, 53, 52, 53, 54, 53, 52, 51, 52, 53,
      52, 51, 52, 53, 52, 51, 52, 51, 52, 52,
    ],
  },
  // Body profile drives macro goals
  profile: {
    name: "Brendan",
    age: 32, sex: "M", height: 183, weight: 82, bodyFat: 16,
    activity: "Active", goal: "Recomp",
  },
  nutrition: {
    // Daily targets derived from profile (TDEE ~2,800 kcal, 1g protein/lb)
    goals: { calories: 2800, protein: 180, carbs: 300, fat: 90, fiber: 38, water: 3.0 },
    today:  { calories: 1842, protein: 132, carbs: 198, fat: 64, fiber: 22, water: 1.8 },
    meals: [
      { name: "Breakfast",  time: "07:24", kcal: 520, p: 38, c: 48, f: 18, items: "Greek yogurt · oats · blueberries · whey" },
      { name: "Lunch",      time: "12:48", kcal: 680, p: 52, c: 72, f: 22, items: "Chicken bowl · jasmine rice · avocado" },
      { name: "Snack",      time: "15:30", kcal: 240, p: 18, c: 28, f: 8,  items: "Protein bar · banana" },
      { name: "Dinner",     time: "19:15", kcal: 402, p: 24, c: 50, f: 16, items: "Salmon · sweet potato · broccoli" },
    ],
    // 7-day calorie history vs goal
    week: [
      { day: "Fri", kcal: 2710 },
      { day: "Sat", kcal: 3120 },
      { day: "Sun", kcal: 2580 },
      { day: "Mon", kcal: 2840 },
      { day: "Tue", kcal: 2670 },
      { day: "Wed", kcal: 2920 },
      { day: "Thu", kcal: 1842 },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Reusable primitives                                                 */
/* ------------------------------------------------------------------ */
const Ring = ({ value, max = 100, size = 120, stroke = 6, color = "hsl(var(--accent))", glow = true }: {
  value: number; max?: number; size?: number; stroke?: number; color?: string; glow?: boolean;
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} className="-rotate-90" style={glow ? { filter: `drop-shadow(0 0 8px ${color})` } : {}}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--hairline-strong))" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 600ms ease" }}
      />
    </svg>
  );
};

const Sparkline = ({ data, height = 44, color = "hsl(var(--accent))" }: { data: number[]; height?: number; color?: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 100;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${pts} ${w},${height}`} fill="url(#spark-fill)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const Stat = ({ label, value, unit, trend, icon: Icon }: {
  label: string; value: string | number; unit?: string; trend?: "up" | "down" | null; icon?: any;
}) => (
  <div className="flex items-start justify-between">
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="mono text-[22px] num leading-none">{value}</span>
        {unit && <span className="text-[11px] text-foreground-mute uppercase tracking-[0.14em]">{unit}</span>}
      </div>
    </div>
    {Icon && <Icon className="w-3.5 h-3.5 text-foreground-mute" strokeWidth={1.5} />}
    {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-odin-ok" strokeWidth={1.5} />}
    {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-odin-alert" strokeWidth={1.5} />}
  </div>
);

const ProgressBar = ({ value, max, color = "hsl(var(--accent))" }: { value: number; max: number; color?: string }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1 w-full bg-surface-inset overflow-hidden">
      <div className="h-full" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* View                                                                */
/* Sleep trend charts ------------------------------------------------ */
const scoreColor = (s: number) =>
  s >= 80 ? "hsl(152 50% 50%)" : s >= 70 ? "hsl(220 70% 60%)" : s >= 60 ? "hsl(48 80% 55%)" : "hsl(var(--alert))";

const SleepWeekChart = ({ data, avg }: { data: { day: string; score: number; hours: number }[]; avg: number }) => (
  <div>
    <div className="relative flex items-end gap-3 h-48 px-2">
      {/* avg line */}
      <div
        className="absolute left-2 right-2 border-t border-dashed border-foreground-mute/40 pointer-events-none"
        style={{ bottom: `${(avg / 100) * 100}%` }}
      >
        <span className="absolute -top-4 right-0 mono text-[9px] text-foreground-mute uppercase tracking-[0.14em]">
          AVG {avg}
        </span>
      </div>
      {data.map((d, i) => {
        const h = (d.score / 100) * 100;
        const color = scoreColor(d.score);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full flex-1 flex items-end">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 mono text-[10px] num opacity-0 group-hover:opacity-100 transition-opacity">
                {d.score}
              </div>
              <div
                className="w-full transition-all"
                style={{
                  height: `${h}%`,
                  background: `linear-gradient(180deg, ${color}, ${color.replace(/\)$/, " / 0.4)")})`,
                  boxShadow: `0 0 12px ${color.replace(/\)$/, " / 0.4)")}`,
                }}
              />
            </div>
            <div className="text-[10px] text-foreground-mute uppercase tracking-[0.14em]">{d.day}</div>
            <div className="mono text-[10px] num text-foreground-dim">{d.hours}h</div>
          </div>
        );
      })}
    </div>
  </div>
);

const SleepMonthChart = ({ data, avg }: { data: number[]; avg: number }) => {
  return <GenericLineChart data={data} avg={avg} domain={[40, 100]} color="hsl(220 70% 60%)" pointColor={scoreColor} />;
};

/* Generic line chart used for monthly trends */
const GenericLineChart = ({
  data, avg, domain = [0, 100], color = "hsl(var(--accent))", pointColor,
}: { data: number[]; avg: number; domain?: [number, number]; color?: string; pointColor?: (v: number) => string }) => {
  const w = 800;
  const h = 200;
  const pad = 8;
  const [lo, hi] = domain;
  const step = (w - pad * 2) / (data.length - 1);
  const yFor = (v: number) => h - pad - ((v - lo) / (hi - lo)) * (h - pad * 2);
  const pts = data.map((v, i) => `${pad + i * step},${yFor(v)}`).join(" ");
  const areaPts = `${pad},${h} ${pts} ${w - pad},${h}`;
  const grids = [lo + (hi - lo) * 0.25, lo + (hi - lo) * 0.5, lo + (hi - lo) * 0.75].map((v) => Math.round(v));
  const gradId = `grad-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height: 200 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {grids.map((g) => (
          <g key={g}>
            <line x1={pad} x2={w - pad} y1={yFor(g)} y2={yFor(g)} stroke="hsl(var(--hairline))" strokeWidth="0.5" strokeDasharray="2 3" />
            <text x={w - pad} y={yFor(g) - 2} textAnchor="end" fontSize="8" fill="hsl(var(--foreground-mute))" fontFamily="monospace">{g}</text>
          </g>
        ))}
        <line x1={pad} x2={w - pad} y1={yFor(avg)} y2={yFor(avg)} stroke="hsl(var(--accent))" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />
        <polyline points={areaPts} fill={`url(#${gradId})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={pad + i * step} cy={yFor(v)} r="1.6" fill={pointColor ? pointColor(v) : color} />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[9px] text-foreground-mute mono uppercase tracking-[0.14em]">
        <span>30d ago</span><span>15d</span><span>Today</span>
      </div>
    </div>
  );
};

/* Body Battery weekly bar (shows daily range) */
const BodyBatteryWeekChart = ({ data, avg }: { data: { day: string; high: number; low: number; end: number }[]; avg: number }) => (
  <div className="relative flex items-end gap-3 h-48 px-2">
    <div className="absolute left-2 right-2 border-t border-dashed border-foreground-mute/40 pointer-events-none" style={{ bottom: `${avg}%` }}>
      <span className="absolute -top-4 right-0 mono text-[9px] text-foreground-mute uppercase tracking-[0.14em]">AVG {avg}</span>
    </div>
    {data.map((d, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
        <div className="relative w-full flex-1 flex items-end">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 mono text-[10px] num opacity-0 group-hover:opacity-100 transition-opacity">
            {d.low}–{d.high}
          </div>
          <div
            className="w-full transition-all rounded-sm"
            style={{
              height: `${d.high - d.low}%`,
              marginBottom: `${d.low}%`,
              background: "linear-gradient(180deg, hsl(152 60% 55% / 0.9), hsl(152 50% 35% / 0.5))",
              boxShadow: "0 0 12px hsl(152 50% 50% / 0.4)",
            }}
          />
        </div>
        <div className="text-[10px] text-foreground-mute uppercase tracking-[0.14em]">{d.day}</div>
        <div className="mono text-[10px] num text-foreground-dim">end {d.end}</div>
      </div>
    ))}
  </div>
);

/* Heart rate weekly multi-bar (resting + avg) */
const HeartWeekChart = ({ data }: { data: { day: string; resting: number; avg: number; max: number }[] }) => {
  const max = Math.max(...data.map((d) => d.max));
  return (
    <div className="flex items-end gap-3 h-48 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="relative w-full flex-1 flex items-end gap-0.5">
            <div className="flex-1 transition-all" style={{ height: `${(d.resting / max) * 100}%`, background: "hsl(220 70% 60%)", boxShadow: "0 0 6px hsl(220 70% 60% / 0.4)" }} />
            <div className="flex-1 transition-all" style={{ height: `${(d.avg / max) * 100}%`, background: "hsl(48 80% 55%)", boxShadow: "0 0 6px hsl(48 80% 55% / 0.4)" }} />
            <div className="flex-1 transition-all" style={{ height: `${(d.max / max) * 100}%`, background: "hsl(var(--alert))", boxShadow: "0 0 6px hsl(var(--alert) / 0.5)" }} />
          </div>
          <div className="text-[10px] text-foreground-mute uppercase tracking-[0.14em]">{d.day}</div>
        </div>
      ))}
    </div>
  );
};


const HealthView = () => {
  const [sleepOpen, setSleepOpen] = useState(false);
  const [sleepRange, setSleepRange] = useState<"week" | "month">("week");
  const [bbOpen, setBbOpen] = useState(false);
  const [bbRange, setBbRange] = useState<"week" | "month">("week");
  const [hrOpen, setHrOpen] = useState(false);
  const [hrRange, setHrRange] = useState<"week" | "month">("week");

  // Live Garmin Connect data overlays the mock scaffold so charts/trends
  // (which still need HA recorder history) keep rendering.
  const live = useGarmin();
  const health = useMemo(() => {
    const m = mockHealth;
    const has = (n: number) => Number.isFinite(n) && n > 0;
    return {
      ...m,
      device: {
        name: "Chris's Garmin Venu 4",
        battery: has(live.device.battery) ? live.device.battery : m.device.battery,
        lastSync: live.connected ? live.lastSync : m.device.lastSync,
      },
      bodyBattery: {
        ...m.bodyBattery,
        current: has(live.bodyBattery.current) ? live.bodyBattery.current : m.bodyBattery.current,
      },
      sleep: {
        ...m.sleep,
        score: has(live.sleep.score) ? live.sleep.score : m.sleep.score,
        quality: live.sleep.quality !== "—" ? live.sleep.quality : m.sleep.quality,
        duration: (live.sleep.duration.h || live.sleep.duration.m)
          ? live.sleep.duration : m.sleep.duration,
        stages: (live.sleep.stages.deep + live.sleep.stages.light + live.sleep.stages.rem) > 0
          ? live.sleep.stages : m.sleep.stages,
        bedtime: live.sleep.bedtime !== "—" ? live.sleep.bedtime : m.sleep.bedtime,
        wake: live.sleep.wake !== "—" ? live.sleep.wake : m.sleep.wake,
        restingHr: has(live.sleep.restingHr) ? live.sleep.restingHr : m.sleep.restingHr,
      },
      heart: {
        ...m.heart,
        current: has(live.heart.current) ? live.heart.current : m.heart.current,
        resting: has(live.heart.resting) ? live.heart.resting : m.heart.resting,
        max: has(live.heart.max) ? live.heart.max : m.heart.max,
        avg24: has(live.heart.avg24) ? live.heart.avg24 : m.heart.avg24,
      },
      activity: {
        ...m.activity,
        steps: has(live.activity.steps) ? live.activity.steps : m.activity.steps,
        calories: has(live.activity.calories) ? Math.round(live.activity.calories) : m.activity.calories,
        distance: has(live.activity.distance) ? live.activity.distance : m.activity.distance,
        intensityMin: has(live.activity.intensityMin) ? live.activity.intensityMin : m.activity.intensityMin,
        floors: has(live.activity.floors) ? live.activity.floors : m.activity.floors,
      },
      stress: {
        ...m.stress,
        current: has(live.stress.current) ? live.stress.current : m.stress.current,
        level: live.stress.level !== "—" ? live.stress.level : m.stress.level,
      },
      vo2max: has(live.vo2max) ? live.vo2max : m.vo2max,
      trainingReadiness: has(live.trainingReadiness) ? live.trainingReadiness : m.trainingReadiness,
      trainingStatus: live.trainingStatus !== "—" ? live.trainingStatus : m.trainingStatus,
      profile: {
        ...m.profile,
        weight: has(live.weight) ? live.weight : m.profile.weight,
        bodyFat: has(live.bodyFat) ? live.bodyFat : m.profile.bodyFat,
      },
    };
  }, [live]);

  const totalSleep = useMemo(() => {
    const s = health.sleep.stages;
    return s.deep + s.light + s.rem + s.awake;
  }, [health.sleep.stages]);

  const stagePct = (mins: number) => (mins / totalSleep) * 100;

  const weekAvg = Math.round(health.sleep.week.reduce((a, b) => a + b.score, 0) / health.sleep.week.length);
  const monthAvg = Math.round(health.sleep.month.reduce((a, b) => a + b, 0) / health.sleep.month.length);

  const bbWeekAvg = Math.round(health.bodyBatteryTrend.week.reduce((a, b) => a + b.end, 0) / 7);
  const bbMonthAvg = Math.round(health.bodyBatteryTrend.month.reduce((a, b) => a + b, 0) / health.bodyBatteryTrend.month.length);
  const hrMonthAvg = Math.round(health.heartTrend.month.reduce((a, b) => a + b, 0) / health.heartTrend.month.length);
  const hrWeekRestAvg = Math.round(health.heartTrend.week.reduce((a, b) => a + b.resting, 0) / 7);

  // Macros
  const n = health.nutrition;
  const macroPct = (cur: number, goal: number) => Math.min((cur / goal) * 100, 100);
  // Macro calorie split (4/4/9)
  const macroKcal = { p: n.today.protein * 4, c: n.today.carbs * 4, f: n.today.fat * 9 };
  const macroKcalTotal = macroKcal.p + macroKcal.c + macroKcal.f || 1;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ───────────────── HERO ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Body Battery — signature panel */}
        <Panel accent className={`lg:col-span-1 relative overflow-hidden cursor-pointer transition-all ${bbOpen ? "ring-1 ring-odin-accent/40" : ""}`}>
          <button onClick={() => setBbOpen((o) => !o)} className="w-full text-left">
          <div className="absolute inset-0 opacity-30 pointer-events-none scanline" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <Label>Body Battery</Label>
              <div className="flex items-center gap-2">
                <StatusDot state="active" />
                <span className="mono text-[10px] text-foreground-mute">LIVE</span>
                <ChevronRight className={`w-3.5 h-3.5 text-foreground-mute transition-transform ${bbOpen ? "rotate-90" : ""}`} strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative grid place-items-center">
                <Ring value={health.bodyBattery.current} size={148} stroke={4} />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="mono text-[44px] num leading-none text-odin-glow">{health.bodyBattery.current}</div>
                    <div className="label mt-1.5">of 100</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label>Charged</Label>
                  <div className="mono text-[18px] num text-odin-ok mt-1">+{health.bodyBattery.charged}</div>
                </div>
                <div>
                  <Label>Drained</Label>
                  <div className="mono text-[18px] num text-odin-alert mt-1">−{health.bodyBattery.drained}</div>
                </div>
              </div>
            </div>
          </div>
          </button>
        </Panel>

        {/* Sleep score — click to drill into trends */}
        <Panel className={`lg:col-span-1 cursor-pointer transition-all ${sleepOpen ? "ring-1 ring-odin-accent/40" : "hover:border-hairline-strong"}`}>
          <button onClick={() => setSleepOpen((o) => !o)} className="w-full text-left">
          <div className="flex items-center justify-between mb-6">
            <Label>Last Night</Label>
            <div className="flex items-center gap-2">
              <span className="mono text-[9px] text-foreground-mute uppercase tracking-[0.14em]">Trends</span>
              <ChevronRight className={`w-3.5 h-3.5 text-foreground-mute transition-transform ${sleepOpen ? "rotate-90" : ""}`} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative grid place-items-center">
              <Ring value={health.sleep.score} size={120} stroke={4} color="hsl(220 70% 60%)" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="mono text-[34px] num leading-none">{health.sleep.score}</div>
                  <div className="label mt-1 text-[9px]">{health.sleep.quality}</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="mono text-[24px] num leading-none">
                {health.sleep.duration.h}<span className="text-foreground-mute text-[14px]">h </span>
                {health.sleep.duration.m}<span className="text-foreground-mute text-[14px]">m</span>
              </div>
              <div className="text-[11px] text-foreground-dim mt-2 mono num">
                {health.sleep.bedtime} → {health.sleep.wake}
              </div>
              <Hairline className="my-3" />
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <div className="label">Resting HR</div>
                  <div className="mono num mt-1">{health.sleep.restingHr} <span className="text-foreground-mute text-[10px]">bpm</span></div>
                </div>
                <div>
                  <div className="label">HRV</div>
                  <div className="mono num mt-1">{health.sleep.hrv} <span className="text-foreground-mute text-[10px]">ms</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sleep stages bar */}
          <div className="mt-5">
            <div className="flex h-2 w-full overflow-hidden">
              <div style={{ width: `${stagePct(health.sleep.stages.deep)}%`, background: "hsl(230 70% 40%)" }} />
              <div style={{ width: `${stagePct(health.sleep.stages.light)}%`, background: "hsl(220 60% 55%)" }} />
              <div style={{ width: `${stagePct(health.sleep.stages.rem)}%`, background: "hsl(280 60% 60%)" }} />
              <div style={{ width: `${stagePct(health.sleep.stages.awake)}%`, background: "hsl(var(--foreground-mute))" }} />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2 text-[9px] uppercase tracking-[0.14em] text-foreground-mute">
              <div><span className="inline-block w-1.5 h-1.5 mr-1" style={{ background: "hsl(230 70% 40%)" }} />Deep {Math.round(health.sleep.stages.deep / 60 * 10) / 10}h</div>
              <div><span className="inline-block w-1.5 h-1.5 mr-1" style={{ background: "hsl(220 60% 55%)" }} />Light {Math.round(health.sleep.stages.light / 60 * 10) / 10}h</div>
              <div><span className="inline-block w-1.5 h-1.5 mr-1" style={{ background: "hsl(280 60% 60%)" }} />REM {Math.round(health.sleep.stages.rem / 60 * 10) / 10}h</div>
              <div><span className="inline-block w-1.5 h-1.5 mr-1" style={{ background: "hsl(var(--foreground-mute))" }} />Awake {health.sleep.stages.awake}m</div>
            </div>
          </div>
          </button>
        </Panel>

        {/* Heart rate live — click for trends */}
        <Panel className={`lg:col-span-1 cursor-pointer transition-all ${hrOpen ? "ring-1 ring-odin-accent/40" : "hover:border-hairline-strong"}`}>
          <button onClick={() => setHrOpen((o) => !o)} className="w-full text-left">
          <div className="flex items-center justify-between mb-4">
            <Label>Heart Rate · 24h</Label>
            <div className="flex items-center gap-2">
              <Heart className="w-3.5 h-3.5 text-odin-alert" strokeWidth={1.5} fill="currentColor" />
              <span className="mono text-[10px] text-foreground-mute">BPM</span>
              <ChevronRight className={`w-3.5 h-3.5 text-foreground-mute transition-transform ${hrOpen ? "rotate-90" : ""}`} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="mono text-[44px] num leading-none">{health.heart.current}</span>
            <span className="text-[11px] text-foreground-mute uppercase tracking-[0.14em]">current</span>
          </div>
          <div className="mt-3">
            <Sparkline data={health.heart.series} height={56} color="hsl(var(--alert))" />
          </div>
          <Hairline className="my-3" />
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div><div className="label">Resting</div><div className="mono num mt-1">{health.heart.resting}</div></div>
            <div><div className="label">Avg 24h</div><div className="mono num mt-1">{health.heart.avg24}</div></div>
            <div><div className="label">Max</div><div className="mono num mt-1">{health.heart.max}</div></div>
          </div>
          </button>
        </Panel>
      </div>

      {/* ───────────────── SLEEP TRENDS DRILL-DOWN ───────────────── */}
      {sleepOpen && (
        <Panel className="relative animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-odin-accent" strokeWidth={1.5} />
              <div>
                <div className="text-[15px] font-medium tracking-[0.02em]">Sleep Trends</div>
                <div className="label mt-1">
                  {sleepRange === "week" ? "Last 7 nights" : "Last 30 nights"} · Avg {sleepRange === "week" ? weekAvg : monthAvg}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TactileButton active={sleepRange === "week"} onClick={() => setSleepRange("week")}>Week</TactileButton>
              <TactileButton active={sleepRange === "month"} onClick={() => setSleepRange("month")}>Month</TactileButton>
              <button
                onClick={() => setSleepOpen(false)}
                className="ml-2 w-7 h-7 grid place-items-center border border-hairline-strong text-foreground-mute hover:text-foreground hover:border-odin-accent/50 transition-colors"
                aria-label="Close trends"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {sleepRange === "week" ? (
            <SleepWeekChart data={health.sleep.week} avg={weekAvg} />
          ) : (
            <SleepMonthChart data={health.sleep.month} avg={monthAvg} />
          )}

          <Hairline className="my-5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(() => {
              const data = sleepRange === "week" ? health.sleep.week.map((d) => d.score) : health.sleep.month;
              const avg = sleepRange === "week" ? weekAvg : monthAvg;
              const best = Math.max(...data);
              const worst = Math.min(...data);
              const trend = data[data.length - 1] - data[0];
              return (
                <>
                  <div>
                    <Label>Average</Label>
                    <div className="mono text-[24px] num mt-1.5 leading-none">{avg}</div>
                  </div>
                  <div>
                    <Label>Best</Label>
                    <div className="mono text-[24px] num text-odin-ok mt-1.5 leading-none">{best}</div>
                  </div>
                  <div>
                    <Label>Lowest</Label>
                    <div className="mono text-[24px] num text-odin-alert mt-1.5 leading-none">{worst}</div>
                  </div>
                  <div>
                    <Label>Trend</Label>
                    <div className={`mono text-[24px] num mt-1.5 leading-none flex items-center gap-2 ${trend >= 0 ? "text-odin-ok" : "text-odin-alert"}`}>
                      {trend >= 0 ? "+" : ""}{trend}
                      {trend >= 0 ? <TrendingUp className="w-4 h-4" strokeWidth={1.5} /> : <TrendingDown className="w-4 h-4" strokeWidth={1.5} />}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </Panel>
      )}

      {/* ───────────────── BODY BATTERY DRILL-DOWN ───────────────── */}
      {bbOpen && (
        <Panel className="relative animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Battery className="w-4 h-4 text-odin-accent" strokeWidth={1.5} />
              <div>
                <div className="text-[15px] font-medium tracking-[0.02em]">Body Battery Trends</div>
                <div className="label mt-1">
                  {bbRange === "week" ? "Last 7 days · daily range" : "Last 30 days · end-of-day"} · Avg {bbRange === "week" ? bbWeekAvg : bbMonthAvg}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TactileButton active={bbRange === "week"} onClick={() => setBbRange("week")}>Week</TactileButton>
              <TactileButton active={bbRange === "month"} onClick={() => setBbRange("month")}>Month</TactileButton>
              <button onClick={() => setBbOpen(false)} className="ml-2 w-7 h-7 grid place-items-center border border-hairline-strong text-foreground-mute hover:text-foreground hover:border-odin-accent/50 transition-colors" aria-label="Close">
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          {bbRange === "week" ? (
            <BodyBatteryWeekChart data={health.bodyBatteryTrend.week} avg={bbWeekAvg} />
          ) : (
            <GenericLineChart data={health.bodyBatteryTrend.month} avg={bbMonthAvg} domain={[40, 100]} color="hsl(152 50% 50%)" />
          )}
          <Hairline className="my-5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><Label>Avg End</Label><div className="mono text-[24px] num mt-1.5 leading-none">{bbRange === "week" ? bbWeekAvg : bbMonthAvg}</div></div>
            <div><Label>Best Charge</Label><div className="mono text-[24px] num text-odin-ok mt-1.5 leading-none">{bbRange === "week" ? Math.max(...health.bodyBatteryTrend.week.map(d => d.high)) : Math.max(...health.bodyBatteryTrend.month)}</div></div>
            <div><Label>Lowest</Label><div className="mono text-[24px] num text-odin-alert mt-1.5 leading-none">{bbRange === "week" ? Math.min(...health.bodyBatteryTrend.week.map(d => d.low)) : Math.min(...health.bodyBatteryTrend.month)}</div></div>
            <div><Label>Trend</Label><div className="mono text-[24px] num text-odin-ok mt-1.5 leading-none flex items-center gap-2">+8<TrendingUp className="w-4 h-4" strokeWidth={1.5} /></div></div>
          </div>
        </Panel>
      )}

      {/* ───────────────── HEART RATE DRILL-DOWN ───────────────── */}
      {hrOpen && (
        <Panel className="relative animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-odin-alert" strokeWidth={1.5} fill="currentColor" />
              <div>
                <div className="text-[15px] font-medium tracking-[0.02em]">Heart Rate Trends</div>
                <div className="label mt-1">
                  {hrRange === "week" ? `Last 7 days · resting/avg/max · Avg rest ${hrWeekRestAvg}` : `Last 30 days · resting bpm · Avg ${hrMonthAvg}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TactileButton active={hrRange === "week"} onClick={() => setHrRange("week")}>Week</TactileButton>
              <TactileButton active={hrRange === "month"} onClick={() => setHrRange("month")}>Month</TactileButton>
              <button onClick={() => setHrOpen(false)} className="ml-2 w-7 h-7 grid place-items-center border border-hairline-strong text-foreground-mute hover:text-foreground hover:border-odin-accent/50 transition-colors" aria-label="Close">
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          {hrRange === "week" ? (
            <>
              <HeartWeekChart data={health.heartTrend.week} />
              <div className="flex items-center gap-5 mt-4 text-[10px] uppercase tracking-[0.14em] text-foreground-mute">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: "hsl(220 70% 60%)" }} />Resting</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: "hsl(48 80% 55%)" }} />Avg</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: "hsl(var(--alert))" }} />Max</div>
              </div>
            </>
          ) : (
            <GenericLineChart data={health.heartTrend.month} avg={hrMonthAvg} domain={[45, 65]} color="hsl(var(--alert))" />
          )}
          <Hairline className="my-5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><Label>Resting Avg</Label><div className="mono text-[24px] num mt-1.5 leading-none">{hrRange === "week" ? hrWeekRestAvg : hrMonthAvg}</div></div>
            <div><Label>Lowest Rest</Label><div className="mono text-[24px] num text-odin-ok mt-1.5 leading-none">{hrRange === "week" ? Math.min(...health.heartTrend.week.map(d => d.resting)) : Math.min(...health.heartTrend.month)}</div></div>
            <div><Label>Peak</Label><div className="mono text-[24px] num text-odin-alert mt-1.5 leading-none">{Math.max(...health.heartTrend.week.map(d => d.max))}</div></div>
            <div><Label>HRV Trend</Label><div className="mono text-[24px] num text-odin-ok mt-1.5 leading-none flex items-center gap-2">+4<TrendingUp className="w-4 h-4" strokeWidth={1.5} /></div></div>
          </div>
        </Panel>
      )}

      {/* ───────────────── ACTIVITY RINGS ───────────────── */}
      <Panel>
        <SectionHead title="Today's Activity" meta={`SYNCED ${health.device.lastSync.toUpperCase()}`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Steps", value: health.activity.steps, goal: health.activity.stepsGoal, icon: Footprints, color: "hsl(var(--accent))" },
            { label: "Calories", value: health.activity.calories, goal: health.activity.caloriesGoal, icon: Flame, color: "hsl(14 84% 58%)" },
            { label: "Floors", value: health.activity.floors, goal: health.activity.floorsGoal, icon: Mountain, color: "hsl(152 50% 50%)" },
            { label: "Intensity Min", value: health.activity.intensityMin, goal: health.activity.intensityGoal, icon: Zap, color: "hsl(280 60% 60%)" },
          ].map((m) => {
            const pct = Math.round((m.value / m.goal) * 100);
            return (
              <div key={m.label} className="flex items-center gap-4">
                <div className="relative grid place-items-center shrink-0">
                  <Ring value={m.value} max={m.goal} size={88} stroke={4} color={m.color} />
                  <m.icon className="absolute w-4 h-4 text-foreground-dim" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <Label>{m.label}</Label>
                  <div className="mono text-[22px] num mt-1 leading-none">{m.value.toLocaleString()}</div>
                  <div className="text-[10px] text-foreground-mute mt-1.5 mono num">
                    {pct}% of {m.goal.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Metrics grid removed (stress / spo2 / respiration / hydration / vo2 / readiness) */}
      {/* ───────────────── HEART ZONES + WORKOUTS ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <SectionHead title="Heart Rate Zones" meta="LAST 24H" />
          <div className="space-y-3">
            {health.heart.zones.map((z, i) => {
              const total = health.heart.zones.reduce((a, b) => a + b.mins, 0);
              const pct = (z.mins / total) * 100;
              const colors = ["hsl(200 60% 50%)", "hsl(152 50% 50%)", "hsl(48 80% 55%)", "hsl(20 80% 55%)", "hsl(var(--alert))"];
              return (
                <div key={z.name}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-[12px]">{z.name}</span>
                    <span className="mono text-[10px] num text-foreground-mute">
                      {z.min}–{z.max} bpm · <span className="text-foreground">{z.mins}m</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-inset overflow-hidden">
                    <div className="h-full" style={{ width: `${pct}%`, background: colors[i], boxShadow: `0 0 6px ${colors[i]}` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <SectionHead title="Recent Workouts" meta={`${health.recentWorkouts.length} SESSIONS`} />
          <ul className="divide-y divide-hairline">
            {health.recentWorkouts.map((w) => (
              <li key={w.date + w.type} className="py-3 flex items-center gap-4 first:pt-0 last:pb-0">
                <div className="w-8 h-8 grid place-items-center border border-hairline-strong shrink-0">
                  <Activity className="w-3.5 h-3.5 text-odin-accent" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] truncate">{w.type}</div>
                  <div className="text-[10px] text-foreground-mute mono uppercase tracking-[0.14em] mt-0.5">{w.date} · {w.duration}</div>
                </div>
                <div className="text-right">
                  <div className="mono text-[16px] num leading-none">{w.load}</div>
                  <div className="label mt-1 text-[9px]">Load</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* ───────────────── NUTRITION ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calorie ring + body profile */}
        <Panel accent className="lg:col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none scanline" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <Label>Nutrition · Today</Label>
              <div className="flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-odin-accent" strokeWidth={1.5} />
                <span className="mono text-[10px] text-foreground-mute">KCAL</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative grid place-items-center">
                <Ring value={n.today.calories} max={n.goals.calories} size={148} stroke={4} color="hsl(14 84% 58%)" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <div className="mono text-[34px] num leading-none text-odin-glow">{n.today.calories.toLocaleString()}</div>
                    <div className="label mt-1.5">of {n.goals.calories.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Remaining</Label>
                  <div className="mono text-[18px] num text-odin-ok mt-1">{(n.goals.calories - n.today.calories).toLocaleString()}</div>
                </div>
                <div>
                  <Label>Burned</Label>
                  <div className="mono text-[18px] num mt-1">{health.activity.calories.toLocaleString()}</div>
                </div>
                <div>
                  <Label>Net Balance</Label>
                  <div className={`mono text-[14px] num mt-1 ${n.today.calories - health.activity.calories < 0 ? "text-odin-ok" : ""}`}>
                    {n.today.calories - health.activity.calories > 0 ? "+" : ""}{n.today.calories - health.activity.calories} kcal
                  </div>
                </div>
              </div>
            </div>
            <Hairline className="my-4" />
            <div className="flex items-center gap-2 text-[10px] text-foreground-mute mono uppercase tracking-[0.14em]">
              <User className="w-3 h-3" strokeWidth={1.5} />
              {health.profile.sex} · {health.profile.age}y · {health.profile.height}cm · {health.profile.weight}kg · {health.profile.bodyFat}% BF · {health.profile.goal}
            </div>
          </div>
        </Panel>

        {/* Macros */}
        <Panel className="lg:col-span-2">
          <SectionHead title="Macros" meta={`GOAL · ${health.profile.goal.toUpperCase()}`} />
          {/* Stacked macro split bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2 text-[10px] text-foreground-mute mono uppercase tracking-[0.14em]">
              <span>Calorie split</span>
              <span>P {Math.round(macroKcal.p / macroKcalTotal * 100)}% · C {Math.round(macroKcal.c / macroKcalTotal * 100)}% · F {Math.round(macroKcal.f / macroKcalTotal * 100)}%</span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden">
              <div style={{ width: `${(macroKcal.p / macroKcalTotal) * 100}%`, background: "hsl(14 84% 58%)", boxShadow: "0 0 8px hsl(14 84% 58% / 0.5)" }} />
              <div style={{ width: `${(macroKcal.c / macroKcalTotal) * 100}%`, background: "hsl(48 80% 55%)", boxShadow: "0 0 8px hsl(48 80% 55% / 0.5)" }} />
              <div style={{ width: `${(macroKcal.f / macroKcalTotal) * 100}%`, background: "hsl(280 60% 60%)", boxShadow: "0 0 8px hsl(280 60% 60% / 0.5)" }} />
            </div>
          </div>

          {/* Per-macro progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { key: "Protein", icon: Beef, cur: n.today.protein, goal: n.goals.protein, color: "hsl(14 84% 58%)", unit: "g" },
              { key: "Carbs",   icon: Wheat, cur: n.today.carbs,   goal: n.goals.carbs,   color: "hsl(48 80% 55%)", unit: "g" },
              { key: "Fat",     icon: Nut,   cur: n.today.fat,     goal: n.goals.fat,     color: "hsl(280 60% 60%)", unit: "g" },
            ].map((m) => (
              <div key={m.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <m.icon className="w-3.5 h-3.5" strokeWidth={1.5} style={{ color: m.color }} />
                    <Label>{m.key}</Label>
                  </div>
                  <span className="mono text-[10px] num text-foreground-mute">{Math.round(macroPct(m.cur, m.goal))}%</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="mono text-[22px] num leading-none">{m.cur}</span>
                  <span className="text-[11px] text-foreground-mute mono">/ {m.goal}{m.unit}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-inset overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${macroPct(m.cur, m.goal)}%`, background: m.color, boxShadow: `0 0 6px ${m.color}` }} />
                </div>
              </div>
            ))}
          </div>

          <Hairline className="my-5" />

          {/* Secondary nutrients */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <Label>Fiber</Label>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="mono text-[18px] num leading-none">{n.today.fiber}</span>
                <span className="text-[10px] text-foreground-mute mono">/ {n.goals.fiber}g</span>
              </div>
              <div className="mt-2"><ProgressBar value={n.today.fiber} max={n.goals.fiber} color="hsl(152 50% 50%)" /></div>
            </div>
            <div>
              <Label>Water</Label>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="mono text-[18px] num leading-none">{n.today.water}L</span>
                <span className="text-[10px] text-foreground-mute mono">/ {n.goals.water}L</span>
              </div>
              <div className="mt-2"><ProgressBar value={n.today.water} max={n.goals.water} color="hsl(200 80% 55%)" /></div>
            </div>
            <div>
              <Label>P / kg bw</Label>
              <div className="mono text-[18px] num leading-none mt-1.5">
                {(n.today.protein / health.profile.weight).toFixed(2)}<span className="text-foreground-mute text-[11px]"> g/kg</span>
              </div>
              <div className="text-[9px] text-foreground-mute mt-2 mono uppercase tracking-[0.14em]">Target ≥ 2.0</div>
            </div>
            <div>
              <Label>7-day Avg</Label>
              <div className="mono text-[18px] num leading-none mt-1.5">
                {Math.round(n.week.reduce((a, b) => a + b.kcal, 0) / n.week.length).toLocaleString()}
                <span className="text-foreground-mute text-[11px]"> kcal</span>
              </div>
              <div className="text-[9px] text-foreground-mute mt-2 mono uppercase tracking-[0.14em]">vs goal {n.goals.calories.toLocaleString()}</div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Meals + weekly calories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <SectionHead title="Meals · Today" meta={`${n.meals.length} LOGGED`} />
          <ul className="divide-y divide-hairline">
            {n.meals.map((m) => (
              <li key={m.name} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 grid place-items-center border border-hairline-strong shrink-0">
                    <Apple className="w-3.5 h-3.5 text-odin-accent" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px]">{m.name}</span>
                      <span className="text-[10px] text-foreground-mute mono uppercase tracking-[0.14em]">{m.time}</span>
                    </div>
                    <div className="text-[11px] text-foreground-dim mt-0.5 truncate">{m.items}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="mono text-[16px] num leading-none">{m.kcal}</div>
                    <div className="label mt-1 text-[9px]">kcal</div>
                  </div>
                </div>
                {/* Per-meal macro mini bar */}
                <div className="flex h-1 w-full overflow-hidden mt-2 ml-12">
                  <div style={{ width: `${(m.p * 4 / m.kcal) * 100}%`, background: "hsl(14 84% 58%)" }} />
                  <div style={{ width: `${(m.c * 4 / m.kcal) * 100}%`, background: "hsl(48 80% 55%)" }} />
                  <div style={{ width: `${(m.f * 9 / m.kcal) * 100}%`, background: "hsl(280 60% 60%)" }} />
                </div>
                <div className="flex gap-4 mt-1.5 ml-12 text-[9px] text-foreground-mute mono uppercase tracking-[0.14em]">
                  <span>P {m.p}g</span><span>C {m.c}g</span><span>F {m.f}g</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <SectionHead title="Calorie Trend · 7 Days" meta={`GOAL ${n.goals.calories.toLocaleString()}`} />
          <div className="relative flex items-end gap-3 h-48 px-2">
            <div className="absolute left-2 right-2 border-t border-dashed border-foreground-mute/40 pointer-events-none" style={{ bottom: `${(n.goals.calories / 3500) * 100}%` }}>
              <span className="absolute -top-4 right-0 mono text-[9px] text-foreground-mute uppercase tracking-[0.14em]">GOAL</span>
            </div>
            {n.week.map((d, i) => {
              const h = (d.kcal / 3500) * 100;
              const over = d.kcal > n.goals.calories;
              const color = over ? "hsl(var(--alert))" : "hsl(14 84% 58%)";
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex-1 flex items-end">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 mono text-[10px] num opacity-0 group-hover:opacity-100 transition-opacity">{d.kcal}</div>
                    <div className="w-full transition-all" style={{ height: `${h}%`, background: `linear-gradient(180deg, ${color}, ${color.replace(/\)$/, " / 0.4)")})`, boxShadow: `0 0 12px ${color.replace(/\)$/, " / 0.4)")}` }} />
                  </div>
                  <div className="text-[10px] text-foreground-mute uppercase tracking-[0.14em]">{d.day}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default HealthView;
