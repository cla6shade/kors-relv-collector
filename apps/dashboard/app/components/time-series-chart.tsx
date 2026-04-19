interface Point {
  t: number;
  v: number;
}

interface Props {
  obsCd: string;
  label: string;
  unit: string;
  color: string;
  points: Point[];
  rangeMs: number;
}

const W = 360;
const H = 170;
const PAD_L = 56;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 34;
const AXIS_FONT = 13;

const AXIS_INK = "oklch(0.55 0.015 230)";
const GRID_INK = "oklch(0.92 0.012 225)";

export function TimeSeriesChart({ obsCd, label, unit, color, points, rangeMs }: Props) {
  const now = Date.now();
  const tMin = now - rangeMs;
  const tMax = now;

  const values = points.map((p) => p.v);
  const vMinRaw = values.length ? Math.min(...values) : 0;
  const vMaxRaw = values.length ? Math.max(...values) : 1;
  const vSpan = vMaxRaw - vMinRaw || Math.abs(vMaxRaw) || 1;
  const vMin = vMinRaw - vSpan * 0.1;
  const vMax = vMaxRaw + vSpan * 0.1;

  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const x = (t: number) => PAD_L + ((t - tMin) / (tMax - tMin)) * plotW;
  const y = (v: number) => PAD_T + (1 - (v - vMin) / (vMax - vMin)) * plotH;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${path} L${x(points[points.length - 1]!.t).toFixed(1)},${(PAD_T + plotH).toFixed(1)} L${x(points[0]!.t).toFixed(1)},${(PAD_T + plotH).toFixed(1)} Z`
      : "";

  const last = points[points.length - 1];

  const yTicks = niceTicks(vMin, vMax, 4);
  const xTicks = timeTicks(tMin, tMax, 4);

  const gradId = `grad-${obsCd}-${Math.abs(hash(color)).toString(36)}`;

  return (
    <figure className="border border-rule bg-surface p-4">
      <figcaption className="mb-3 flex items-baseline justify-between border-b border-rule pb-2">
        <div className="flex items-baseline gap-2">
          <span
            className="inline-block h-1.5 w-3"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="text-sm font-medium text-ink">{label}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {obsCd}
          </span>
        </div>
        {last && (
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[10px] tracking-[0.04em] text-muted">
              최신 값:
            </span>
            <span className="font-display text-xl leading-none text-ink tabular">
              {formatNum(last.v)}
            </span>
            <span className="text-xs text-muted">{unit}</span>
          </div>
        )}
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full h-auto"
        role="img"
        aria-label={`${label} 시계열`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(t)}
              y2={y(t)}
              stroke={GRID_INK}
              strokeDasharray="2 4"
            />
            <text
              x={PAD_L - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              fill={AXIS_INK}
              fontSize={AXIS_FONT}
              fontFamily="ui-monospace, monospace"
            >
              {formatNum(t)}
            </text>
          </g>
        ))}

        <line
          x1={PAD_L}
          x2={W - PAD_R}
          y1={PAD_T + plotH}
          y2={PAD_T + plotH}
          stroke={AXIS_INK}
          strokeWidth="0.75"
        />

        {xTicks.map((t, i) => (
          <text
            key={`x${t}`}
            x={x(t)}
            y={H - 10}
            textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
            fill={AXIS_INK}
            fontSize={AXIS_FONT}
            fontFamily="ui-monospace, monospace"
          >
            {formatTick(t, rangeMs)}
          </text>
        ))}

        {points.length > 1 && <path d={areaPath} fill={`url(#${gradId})`} />}

        {points.length > 1 && (
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.length === 1 && (
          <circle cx={x(points[0]!.t)} cy={y(points[0]!.v)} r="3" fill={color} />
        )}

        {last && points.length > 0 && (
          <circle
            cx={x(last.t)}
            cy={y(last.v)}
            r="3"
            fill="white"
            stroke={color}
            strokeWidth="1.75"
          />
        )}
      </svg>
    </figure>
  );
}

function formatNum(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1000) return v.toFixed(0);
  if (abs >= 100) return v.toFixed(1);
  return v.toFixed(2);
}

function niceTicks(min: number, max: number, count: number): number[] {
  if (!isFinite(min) || !isFinite(max) || min === max) return [min];
  const span = max - min;
  const step = niceStep(span / count);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

function niceStep(raw: number): number {
  const exp = Math.floor(Math.log10(raw));
  const base = Math.pow(10, exp);
  const norm = raw / base;
  let nice;
  if (norm < 1.5) nice = 1;
  else if (norm < 3) nice = 2;
  else if (norm < 7) nice = 5;
  else nice = 10;
  return nice * base;
}

function timeTicks(min: number, max: number, count: number): number[] {
  const step = (max - min) / count;
  const ticks: number[] = [];
  for (let i = 0; i <= count; i++) ticks.push(min + step * i);
  return ticks;
}

function formatTick(t: number, rangeMs: number): string {
  const d = new Date(t);
  const opts: Intl.DateTimeFormatOptions =
    rangeMs <= 48 * 3600 * 1000
      ? { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false }
      : { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false };
  return new Intl.DateTimeFormat("ko-KR", opts).format(d);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
