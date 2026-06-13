import { describe, it, expect } from "vitest";
import { buildFieldContext } from "./chat";
import type { Field, FieldReportResponse } from "./types";

const FIELD: Field = {
  id: "f1",
  name: "Kegeyli paxta",
  crop: "cotton",
  area_ha: 4.2,
  lat: 42.78,
  lon: 59.6,
  sowing_date: "2026-04-04",
  soil_texture: "loam",
  irrigation_method: "furrow",
  farmer_name: "Allanazar",
  phone: "+998901234567",
  sms_language: "kaa",
  sms_frequency: "action",
  irrigation_status: { action: "irrigate", date: "2026-06-12", depth_mm: 55, volume_m3_ha: 550 },
  salinity_status: { level: "caution", ece_ds_m: 4.1 },
  updated_at: "2026-06-11T06:40:00Z",
};

const REPORT: FieldReportResponse = {
  recommendation: {
    action: "irrigate",
    weekday_date: "2026-06-12",
    depth_mm: 55,
    volume_m3_ha: 550,
    reason: "High depletion",
    next_check: "2026-06-15",
  },
  depletion: { current_mm: 68, threshold_mm: 65, total_mm: 100 },
  forecast: [],
  ndvi: [],
  salinity_summary: { level: "caution", ece_ds_m: 4.1, tolerance_ds_m: 7.7, advice: "Monitor" },
  sms_preview: { text: "Suwarıw kerek", lang: "kaa", segments: 1 },
  freshness: { weather: "2026-06-11T06:00:00Z", satellite: "2026-06-10", calculated: "2026-06-11T06:40:00Z" },
};

describe("buildFieldContext", () => {
  it("maps field name and crop", () => {
    const ctx = buildFieldContext(FIELD, REPORT);
    expect(ctx.fieldName).toBe("Kegeyli paxta");
    expect(ctx.crop).toBe("cotton");
  });

  it("calculates depletionPct correctly", () => {
    const ctx = buildFieldContext(FIELD, REPORT);
    expect(ctx.depletionPct).toBe(68);
  });

  it("maps salinity from report summary, not field status", () => {
    const ctx = buildFieldContext(FIELD, REPORT);
    expect(ctx.salinityLevel).toBe("caution");
    expect(ctx.eceDsM).toBe(4.1);
  });

  it("uses sowing_date when present", () => {
    const ctx = buildFieldContext(FIELD, REPORT);
    expect(ctx.sowingDate).toBe("2026-04-04");
  });

  it("falls back to updated_at when sowing_date missing", () => {
    const fieldNoSow: Field = { ...FIELD, sowing_date: undefined };
    const ctx = buildFieldContext(fieldNoSow, REPORT);
    expect(ctx.sowingDate).toBe("2026-06-11T06:40:00Z");
  });

  it("handles zero total_mm without divide-by-zero", () => {
    const reportZero: FieldReportResponse = {
      ...REPORT,
      depletion: { current_mm: 0, threshold_mm: 0, total_mm: 0 },
    };
    const ctx = buildFieldContext(FIELD, reportZero);
    expect(ctx.depletionPct).toBe(0);
  });
});
