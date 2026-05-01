// ODIN Health — Garmin-ready biometrics dashboard (mock data scaffold)
import { useMemo, useState } from "react";
import {
  Heart, Moon, Flame, Footprints, Activity, Droplet, Wind,
  TrendingUp, TrendingDown, Watch, Zap, Gauge, Mountain, ChevronRight, X,
  Battery, Apple, Beef, Wheat, Nut, User
} from "lucide-react";
import { Panel, Label, StatusDot, SectionHead, Hairline, TactileButton } from "@/components/odin/primitives";

/* ------------------------------------------------------------------ */
/* MOCK DATA — shaped to mirror Garmin Connect API responses.          */
/* Replace with live fetch once the Garmin connector is wired in.      */
/* ------------------------------------------------------------------ */
const health = {
  device: { name: "Garmin fēnix 8", battery: 64, lastSync: "2 min ago" },
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
  const w = 800;
  const h = 200;
  const pad = 8;
  const step = (w - pad * 2) / (data.length - 1);
  const yFor = (v: number) => h - pad - ((v - 40) / 60) * (h - pad * 2); // map 40–100 → height
  const pts = data.map((v, i) => `${pad + i * step},${yFor(v)}`).join(" ");
  const areaPts = `${pad},${h} ${pts} ${w - pad},${h}`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height: 200 }}>
        <defs>
          <linearGradient id="month-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(220 70% 60%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(220 70% 60%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* horizontal grid */}
        {[60, 70, 80, 90].map((g) => (
          <g key={g}>
            <line x1={pad} x2={w - pad} y1={yFor(g)} y2={yFor(g)} stroke="hsl(var(--hairline))" strokeWidth="0.5" strokeDasharray="2 3" />
            <text x={w - pad} y={yFor(g) - 2} textAnchor="end" fontSize="8" fill="hsl(var(--foreground-mute))" fontFamily="monospace">{g}</text>
          </g>
        ))}
        {/* avg line */}
        <line x1={pad} x2={w - pad} y1={yFor(avg)} y2={yFor(avg)} stroke="hsl(var(--accent))" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.6" />
        <polyline points={areaPts} fill="url(#month-fill)" />
        <polyline points={pts} fill="none" stroke="hsl(220 70% 60%)" strokeWidth="1.2" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={pad + i * step} cy={yFor(v)} r="1.6" fill={scoreColor(v)} />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-[9px] text-foreground-mute mono uppercase tracking-[0.14em]">
        <span>30d ago</span>
        <span>15d</span>
        <span>Today</span>
      </div>
    </div>
  );
};


const HealthView = () => {
  const [sleepOpen, setSleepOpen] = useState(false);
  const [sleepRange, setSleepRange] = useState<"week" | "month">("week");

  const totalSleep = useMemo(() => {
    const s = health.sleep.stages;
    return s.deep + s.light + s.rem + s.awake;
  }, []);

  const stagePct = (mins: number) => (mins / totalSleep) * 100;

  const weekAvg = Math.round(health.sleep.week.reduce((a, b) => a + b.score, 0) / health.sleep.week.length);
  const monthAvg = Math.round(health.sleep.month.reduce((a, b) => a + b, 0) / health.sleep.month.length);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ───────────────── HERO ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Body Battery — signature panel */}
        <Panel accent className="lg:col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none scanline" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <Label>Body Battery</Label>
              <div className="flex items-center gap-1.5">
                <StatusDot state="active" />
                <span className="mono text-[10px] text-foreground-mute">LIVE</span>
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

        {/* Heart rate live */}
        <Panel className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <Label>Heart Rate · 24h</Label>
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-odin-alert" strokeWidth={1.5} fill="currentColor" />
              <span className="mono text-[10px] text-foreground-mute">BPM</span>
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

      {/* ───────────────── METRICS GRID ───────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Panel padding="p-4">
          <Stat label="Stress" value={health.stress.current} unit={health.stress.level} icon={Activity} />
          <div className="mt-3"><ProgressBar value={health.stress.current} max={100} color="hsl(280 60% 60%)" /></div>
        </Panel>
        <Panel padding="p-4">
          <Stat label="SpO₂" value={health.spo2} unit="%" icon={Droplet} trend="up" />
          <div className="mt-3"><ProgressBar value={health.spo2} max={100} color="hsl(220 70% 60%)" /></div>
        </Panel>
        <Panel padding="p-4">
          <Stat label="Respiration" value={health.respiration} unit="brpm" icon={Wind} />
          <div className="mt-3"><ProgressBar value={health.respiration} max={25} color="hsl(180 50% 55%)" /></div>
        </Panel>
        <Panel padding="p-4">
          <Stat label="Hydration" value={`${health.hydration.intake}L`} unit={`/ ${health.hydration.goal}L`} icon={Droplet} />
          <div className="mt-3"><ProgressBar value={health.hydration.intake} max={health.hydration.goal} color="hsl(200 80% 55%)" /></div>
        </Panel>
        <Panel padding="p-4">
          <Stat label="VO₂ Max" value={health.vo2max} unit="SUPERIOR" icon={Gauge} trend="up" />
          <div className="mt-3"><ProgressBar value={health.vo2max} max={70} color="hsl(var(--ok))" /></div>
        </Panel>
        <Panel padding="p-4">
          <Stat label="Readiness" value={health.trainingReadiness} unit={health.trainingStatus} icon={Zap} />
          <div className="mt-3"><ProgressBar value={health.trainingReadiness} max={100} color="hsl(var(--accent))" /></div>
        </Panel>
      </div>

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

      {/* ───────────────── DEVICE STATUS ───────────────── */}
      <Panel padding="p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 grid place-items-center border border-hairline-strong">
            <Watch className="w-4 h-4 text-odin-accent" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="text-[13px]">{health.device.name}</div>
            <div className="text-[10px] text-foreground-mute mono uppercase tracking-[0.14em] mt-0.5">
              Last sync · {health.device.lastSync}
            </div>
          </div>
          <div className="text-right">
            <div className="label">Battery</div>
            <div className="mono num text-[16px] mt-1">{health.device.battery}%</div>
          </div>
          <div className="w-24">
            <ProgressBar value={health.device.battery} max={100} color="hsl(var(--ok))" />
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default HealthView;
