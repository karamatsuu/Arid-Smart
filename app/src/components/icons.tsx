// Single source of SVG icons (spec: SVG only, no icon fonts / CDNs).
// Geometry mirrors design/canvas/shared.jsx.

import type { CSSProperties, ReactNode } from "react";

const DEFAULT_STROKE = 1.8;

export interface IconProps {
  d: string;
  size?: number;
  color?: string;
  fill?: string;
  sw?: number;
  extra?: ReactNode;
  style?: CSSProperties;
}

export function Ic({
  d,
  size = 20,
  color = "currentColor",
  fill = "none",
  sw = DEFAULT_STROKE,
  extra = null,
  style,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      style={style}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
      {extra}
    </svg>
  );
}

/* --- icon paths: deliberately simple geometry --- */
export const P = {
  back: "M15 5 8 12l7 7",
  more: "M12 5.5v.01M12 12v.01M12 18.5v.01",
  globe:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c-2.5 2.5-3.7 5.6-3.7 9s1.2 6.5 3.7 9c2.5-2.5 3.7-5.6 3.7-9S14.5 5.5 12 3",
  drop: "M12 3.5c3.2 4 6 7.2 6 10.5a6 6 0 1 1-12 0c0-3.3 2.8-6.5 6-10.5",
  check: "M5 12.5 10 17.5 19 7",
  alert: "M12 4 2.8 20h18.4L12 4m0 6v4.5m0 3v.01",
  octagon:
    "M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2L8.2 3M12 8v4.5m0 3v.01",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18m0 4.5V12l3.5 2",
  minus: "M6 12h12",
  plus: "M12 5v14M5 12h14",
  home: "M4 11.5 12 4.5l8 7M6 10.5V20h12v-9.5",
  layers: "M12 3 3 8.5l9 5.5 9-5.5L12 3M5 13l7 4.5 7-4.5",
  msg: "M4 5h16v11H9l-5 4V5",
  sliders: "M5 7h14M5 12h14M5 17h14",
  pin: "M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11m0-8.5v.01",
  sun: "M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4",
  cloud:
    "M7 18.5h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18.5",
  wind: "M3 9h11a2.5 2.5 0 1 0-2.5-2.5M3 14h15a2.5 2.5 0 1 1-2.5 2.5",
  sprout:
    "M12 21v-8m0 0c0-3.5-2.5-6-6.5-6 0 4 2.5 6.5 6.5 6m0-2c.2-3.6 2.6-5.5 6.5-5.5-.3 4-2.7 5.7-6.5 5.5",
  send: "M21 3 10.5 13.5M21 3l-7 18-3.5-7.5L3 10l18-7",
  trash: "M5 7h14M10 7V5h4v2m-7 0 1 13h8l1-13",
  refresh:
    "M20 8A8 8 0 0 0 5.5 6.5L4 8m0 8a8 8 0 0 0 14.5 1.5L20 16M4 4v4h4m12 12v-4h-4",
  edit: "M4 20h4L19 9l-4-4L4 16v4",
  wifi_off:
    "M3 3l18 18M8.5 13.5a6 6 0 0 1 4-1.7m4.6 1.9a6 6 0 0 0-1.6-1M5 10a10 10 0 0 1 3.4-2.2M19 10a10 10 0 0 0-4-2.4M12 18.5v.01",
  undo: "M8 5 4 9l4 4M4 9h10a6 6 0 0 1 0 12h-3",
  chev: "M9 6l6 6-6 6",
  search:
    "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M20 20l-4.5-4.5",
  locate:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m0-6v3m0 14v3M2 12h3m14 0h3",
  download: "M12 4v11m0 0 5-5m-5 5-5-5M4 20h16",
  bot: "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14M9.5 12v.01M12 12v.01M14.5 12v.01",
} as const;

/* --- status icons: each tone gets a distinct shape, never color alone --- */
export type StatusTone = "ok" | "warn" | "bad" | "na";

const STATUS_PATH: Record<StatusTone, string> = {
  ok: P.check,
  warn: P.alert, // triangle
  bad: P.octagon, // octagon — distinct from caution
  na: P.clock, // stale / no data
};

export function StatusIcon({
  tone,
  size = 15,
}: {
  tone: StatusTone;
  size?: number;
}) {
  return <Ic d={STATUS_PATH[tone]} size={size} sw={2.2} />;
}

/* --- crop icon set (spec §0.3): 7 crops, simple stroke glyphs --- */
export type CropKey =
  | "cotton"
  | "wheat"
  | "rice"
  | "alfalfa"
  | "maize"
  | "melon"
  | "vegetables";

export const CROP_TINTS: Record<CropKey, string> = {
  cotton: "#5a7d3a",
  wheat: "#a8762a",
  rice: "#1b7a6e",
  alfalfa: "#3e8a4f",
  maize: "#b3851c",
  melon: "#3f7d52",
  vegetables: "#b25b32",
};

const CROP_SHAPES: Record<CropKey, ReactNode> = {
  // cotton boll: three lobes on a stem
  cotton: (
    <>
      <circle cx="8.6" cy="9.8" r="3" />
      <circle cx="15.4" cy="9.8" r="3" />
      <circle cx="12" cy="6.6" r="3" />
      <path d="M12 12.5V21m0-4.5c-2.6 0-4-1.2-4.6-3" />
    </>
  ),
  // wheat: stalk with paired grains
  wheat: (
    <>
      <path d="M12 21V6" />
      <path d="M12 8.5C9.8 8 8.6 6.4 8.6 4c2.4.3 3.6 1.9 3.4 4.5M12 8.5c2.2-.5 3.4-2.1 3.4-4.5-2.4.3-3.6 1.9-3.4 4.5" />
      <path d="M12 13C9.8 12.5 8.6 10.9 8.6 8.5c2.4.3 3.6 1.9 3.4 4.5m0 0c2.2-.5 3.4-2.1 3.4-4.5-2.4.3-3.6 1.9-3.4 4.5" />
      <path d="M12 17.5c-2.2-.5-3.4-2.1-3.4-4.5 2.4.3 3.6 1.9 3.4 4.5m0 0c2.2-.5 3.4-2.1 3.4-4.5-2.4.3-3.6 1.9-3.4 4.5" />
    </>
  ),
  // rice: drooping panicle with grains
  rice: (
    <>
      <path d="M9 21c0-6 1-10 4-14" />
      <path d="M13 7c1.5-1.8 3.6-2.6 6-2.5-.4 2.4-1.8 4-4.2 4.6" />
      <circle cx="15.4" cy="11" r="1.1" />
      <circle cx="17.6" cy="12.6" r="1.1" />
      <circle cx="14" cy="13.8" r="1.1" />
      <circle cx="16.2" cy="15.4" r="1.1" />
    </>
  ),
  // alfalfa: trifoliate leaf
  alfalfa: (
    <>
      <path d="M12 21v-8" />
      <ellipse cx="12" cy="6.4" rx="2.4" ry="3.4" />
      <ellipse
        cx="7.4"
        cy="10"
        rx="2.4"
        ry="3.4"
        transform="rotate(-55 7.4 10)"
      />
      <ellipse
        cx="16.6"
        cy="10"
        rx="2.4"
        ry="3.4"
        transform="rotate(55 16.6 10)"
      />
    </>
  ),
  // maize: cob with kernel lines and husk leaves
  maize: (
    <>
      <path d="M12 3.5c2.3 2.6 3.4 5.8 3.4 9.3 0 3.4-1.3 6-3.4 7.7-2.1-1.7-3.4-4.3-3.4-7.7 0-3.5 1.1-6.7 3.4-9.3" />
      <path d="M12 5v14M9.4 9h5.2M9 13h6M9.6 17h4.8" />
    </>
  ),
  // melon: striped round melon with stem curl
  melon: (
    <>
      <circle cx="12" cy="13.5" r="6.5" />
      <path d="M12 7c-1.8 1.8-2.7 4-2.7 6.5S10.2 18.2 12 20m0-13c1.8 1.8 2.7 4 2.7 6.5S13.8 18.2 12 20" />
      <path d="M12 7V5c0-1 .7-1.8 2-2" />
    </>
  ),
  // vegetables: carrot with leaves
  vegetables: (
    <>
      <path d="M13.8 10.2 6 21l-1-1 7.8-10.8" />
      <path d="M13.8 10.2c1.4 1.4 3.6 1.5 5.2.3-.9-2-2.8-3-5-2.6" />
      <path d="M14 7.9c.3-2.2-.6-4.1-2.6-5-1.2 1.6-1.1 3.8.3 5.2" />
      <path d="M14 7.9c1.2-1.2 3-1.5 4.5-.8" />
    </>
  ),
};

export function CropIcon({
  crop,
  size = 22,
  color = "currentColor",
  sw = 1.7,
}: {
  crop: CropKey;
  size?: number;
  color?: string;
  sw?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {CROP_SHAPES[crop]}
    </svg>
  );
}

/** Tinted rounded badge around a crop icon (field cards, lists). */
export function CropBadge({
  crop,
  size = 40,
}: {
  crop: CropKey;
  size?: number;
}) {
  const tint = CROP_TINTS[crop];
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        flex: "none",
        background: tint + "1f",
        color: tint,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CropIcon crop={crop} size={size * 0.55} />
    </span>
  );
}
