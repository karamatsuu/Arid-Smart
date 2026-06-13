import type { ReactNode } from "react";
import { Ic, P, type StatusTone } from "./icons";

/**
 * Recommendation hero (Field Report): the biggest text on screen —
 * date headline + mm amount + (m³/ha). Numbers are the product (spec §0.1).
 */
export function RecommendationHero({
  tone = "warn",
  kicker,
  headline,
  mm,
  m3ha,
  note,
  primaryUnit = "mm",
}: {
  tone?: StatusTone;
  kicker: string;
  headline: string;
  mm: number;
  m3ha: number;
  note?: ReactNode;
  primaryUnit?: "mm" | "m3ha";
}) {
  const primary = primaryUnit === "m3ha" ? `${m3ha} m³/ha` : `${mm} mm`;
  const secondary = primaryUnit === "m3ha" ? `${mm} mm` : `${m3ha} m³/ha`;
  return (
    <section className={`card tone-${tone}`} style={{ padding: "16px 16px 18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          color: `var(--${tone})`,
          fontWeight: 700,
          fontSize: 13.5,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <Ic d={P.drop} size={16} sw={2.2} />
        {kicker}
      </div>
      <div style={{ fontSize: 21, fontWeight: 700, marginTop: 10 }}>{headline}</div>
      <div className="big-num" style={{ margin: "6px 0 2px" }}>
        {primary}{" "}
        <span style={{ fontSize: 20, fontWeight: 500, color: "var(--ink-2)" }}>
          ({secondary})
        </span>
      </div>
      {note && (
        <div
          style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 8, lineHeight: 1.5 }}
        >
          {note}
        </div>
      )}
    </section>
  );
}
