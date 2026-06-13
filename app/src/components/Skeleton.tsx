import type { CSSProperties } from "react";

/** Shimmering skeleton block for loading states. */
export function Skeleton({
  h = 16,
  w = "100%",
  r = 8,
  style,
}: {
  h?: number | string;
  w?: number | string;
  r?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      className="skel"
      aria-hidden="true"
      style={{ height: h, width: w, borderRadius: r, ...style }}
    />
  );
}

/** Card-shaped skeleton matching the field-card layout. */
export function SkeletonCard() {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Skeleton h={40} w={40} r={11} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton h={15} w="60%" />
          <Skeleton h={12} w="40%" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <Skeleton h={26} w={130} r={13} />
        <Skeleton h={26} w={110} r={13} />
      </div>
    </div>
  );
}
