// Status-tone mapping shared by Home cards, the Fields map tint, and list
// rows: irrigation "irrigate" is amber (action needed), salinity levels map
// to the three tokens, and a field's WORST status drives its polygon color
// (red > amber > green; grey when there is no data at all).

import type { Field, SalinityLevel } from "../api/types";
import { CROP_TINTS, type CropKey, type StatusTone } from "../components/icons";

export const SALINITY_TONE: Record<SalinityLevel, StatusTone> = {
  ok: "ok",
  caution: "warn",
  warning: "bad",
};

export function irrigationTone(f: Field): StatusTone {
  if (!f.irrigation_status) return "na";
  return f.irrigation_status.action === "irrigate" ? "warn" : "ok";
}

export function salinityTone(f: Field): StatusTone {
  if (!f.salinity_status) return "na";
  return SALINITY_TONE[f.salinity_status.level];
}

const SEVERITY: Record<StatusTone, number> = { na: -1, ok: 0, warn: 1, bad: 2 };

export function worstTone(f: Field): StatusTone {
  const a = irrigationTone(f);
  const b = salinityTone(f);
  if (a === "na" && b === "na") return "na";
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}

/** Unknown crop values from the backend fall back to a generic glyph. */
export function asCropKey(crop: string): CropKey {
  return crop in CROP_TINTS ? (crop as CropKey) : "vegetables";
}

const SEASON_DAYS: Record<string, number> = {
  cotton: 180,
  wheat: 240,
  rice: 130,
  alfalfa: 90,
  maize: 150,
  melon: 120,
  vegetables: 100,
};

/** Returns a `report.growthStage.*` i18n key based on days since sowing. */
export function growthStageKey(crop: string, sowingDate: string): string {
  const days = Math.max(
    0,
    (Date.now() - new Date(sowingDate).getTime()) / 86_400_000,
  );
  const total = SEASON_DAYS[crop] ?? 120;
  const pct = days / total;
  if (pct < 0.25) return "report.growthStage.early";
  if (pct < 0.5) return "report.growthStage.dev";
  if (pct < 0.75) return "report.growthStage.mid";
  return "report.growthStage.late";
}
