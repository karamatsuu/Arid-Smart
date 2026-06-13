/**
 * Salinity tolerance scale (Salinity Detail): 0–16 dS/m bar with shaded
 * safe / yield-loss / severe zones, a marker for the field's current value
 * and a marker for the crop's tolerance threshold.
 */
export function SalinityScale({
  value,
  threshold,
  /** end of the "severe" boundary; zones: [0..threshold]=safe,
      [threshold..severeFrom]=yield loss, [severeFrom..max]=severe */
  severeFrom,
  max = 16,
  valueLabel,
  thresholdLabel,
  legend,
}: {
  value: number;
  threshold: number;
  severeFrom: number;
  max?: number;
  /** e.g. "bul atız 5.8" */
  valueLabel: string;
  /** e.g. "paxta shegi 7.7" */
  thresholdLabel: string;
  legend?: { ok: string; warn: string; bad: string };
}) {
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  const tone =
    value >= severeFrom ? "bad" : value >= threshold ? "warn" : "ok";
  return (
    <div>
      <div style={{ position: "relative", margin: "30px 4px 4px" }}>
        <div
          style={{
            display: "flex",
            height: 18,
            borderRadius: 9,
            overflow: "hidden",
            border: "1px solid var(--line)",
          }}
        >
          <span style={{ width: pct(threshold), background: "var(--ok-bg)" }} />
          <span
            style={{
              width: pct(severeFrom - threshold),
              background: "var(--warn-bg)",
            }}
          />
          <span style={{ flex: 1, background: "var(--bad-bg)" }} />
        </div>
        {/* current-value marker */}
        <div
          style={{
            position: "absolute",
            left: pct(value),
            top: -26,
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <div
            className="num"
            style={{
              fontWeight: 700,
              fontSize: 12,
              color: `var(--${tone})`,
              whiteSpace: "nowrap",
            }}
          >
            {valueLabel}
          </div>
          <div
            style={{
              width: 0,
              height: 0,
              margin: "1px auto 0",
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `8px solid var(--${tone})`,
            }}
          />
        </div>
        {/* crop tolerance threshold marker — spans the bar only */}
        <div
          style={{
            position: "absolute",
            left: pct(threshold),
            top: -4,
            height: 26,
            width: 3,
            background: "var(--ink)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: pct(threshold),
            top: 22,
            transform: "translateX(-50%)",
            fontWeight: 600,
            fontSize: 11.5,
            color: "var(--ink-2)",
            whiteSpace: "nowrap",
          }}
        >
          {thresholdLabel}
        </div>
        <div className="gauge-labels num" style={{ marginTop: 26 }}>
          <span>0</span>
          <span>{max / 2}</span>
          <span>{max} dS/m</span>
        </div>
      </div>
      {legend && (
        <div className="meta" style={{ display: "flex", gap: 12, marginTop: 10 }}>
          {(["ok", "warn", "bad"] as const).map((z) => (
            <span
              key={z}
              style={{ display: "flex", gap: 5, alignItems: "center" }}
            >
              <i
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: `var(--${z}-bg)`,
                  border: `1px solid var(--${z}-line)`,
                }}
              />
              {legend[z]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
