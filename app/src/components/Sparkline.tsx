/** Sparkline (NDVI / salinity trends): tiny polyline with end dot. */
export function Sparkline({
  pts,
  w = 130,
  h = 34,
  color = "var(--accent)",
  dashed,
}: {
  pts: number[];
  w?: number;
  h?: number;
  color?: string;
  dashed?: boolean;
}) {
  if (pts.length < 2) return null;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const coords = pts.map((p, i) => ({
    x: (i / (pts.length - 1)) * (w - 6) + 3,
    y: h - 4 - ((p - min) / (max - min || 1)) * (h - 8),
  }));
  const last = coords[coords.length - 1];
  return (
    <svg width={w} height={h} aria-hidden="true">
      <polyline
        points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "4 4" : undefined}
      />
      <circle cx={last.x} cy={last.y} r="3.2" fill={color} />
    </svg>
  );
}
