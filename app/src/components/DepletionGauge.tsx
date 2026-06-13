/**
 * Depletion gauge (Field Report): horizontal bar of root-zone depletion with
 * a threshold marker. Fill turns amber once past the irrigation threshold.
 */
export function DepletionGauge({
  pct,
  threshold,
  labelLeft,
  labelMid,
  labelRight,
}: {
  /** depletion 0–100 */
  pct: number;
  /** irrigate-now threshold 0–100 */
  threshold: number;
  labelLeft: string;
  labelMid: string;
  labelRight: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="gauge-track" style={{ margin: "14px 2px 0" }}>
        <div
          className="gauge-fill"
          style={{
            width: `${clamped}%`,
            background: clamped >= threshold ? "var(--warn)" : "var(--accent)",
          }}
        />
        <div className="gauge-thresh" style={{ left: `${threshold}%` }} />
        <div className="gauge-marker" style={{ left: `${clamped}%` }} />
      </div>
      <div className="gauge-labels">
        <span>{labelLeft}</span>
        <span style={{ color: "var(--ink)", fontWeight: 700 }}>▾ {labelMid}</span>
        <span>{labelRight}</span>
      </div>
    </div>
  );
}
