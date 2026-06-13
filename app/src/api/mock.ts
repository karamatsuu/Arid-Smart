// Dev fixtures served through apiGet when no real backend is configured
// (VITE_API_BASE unset). Dates are computed relative to "now" so the demo
// stays current; the cache/stale pipeline in client.ts is exercised as-is.

import { getStoredLocale, translate } from "../i18n";
import type {
  Field,
  FieldPayload,
  FieldReportResponse,
  FreshnessResponse,
  MessageLogItem,
  MessagesResponse,
  SalinityDetailResponse,
  FieldsResponse,
  WeatherToday,
} from "./types";

const MOCK_FIELDS_KEY = "aridsmart:mock:fields";

function dayOffset(days: number, h = 6, m = 40): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function defaultFieldList(): Field[] {
  return [
      {
        id: "f-kegeyli",
        name: "Kegeyli paxta",
        crop: "cotton",
        area_ha: 4.2,
        lat: 42.8330,
        lon: 59.5325,
        polygon: [
          [42.8341, 59.5308],
          [42.8338, 59.5343],
          [42.8319, 59.5339],
          [42.8322, 59.5304],
        ],
        sowing_date: dayOffset(-68, 0, 0),
        soil_texture: "loam",
        irrigation_method: "furrow",
        farmer_name: "Allanazar",
        phone: "+998901234567",
        sms_language: "kaa",
        sms_frequency: "action",
        irrigation_status: {
          action: "irrigate",
          date: dayOffset(1),
          depth_mm: 55,
          volume_m3_ha: 550,
        },
        salinity_status: { level: "caution", ece_ds_m: 4.1 },
        updated_at: dayOffset(0),
      },
      {
        id: "f-qanlikol",
        name: "Qanlıkól salı",
        crop: "rice",
        area_ha: 8.0,
        lat: 43.0502,
        lon: 59.0450,
        polygon: [
          [43.0514, 59.0432],
          [43.0514, 59.0467],
          [43.0489, 59.0467],
          [43.0489, 59.0432],
        ],
        sowing_date: dayOffset(-42, 0, 0),
        soil_texture: "clay",
        irrigation_method: "flood",
        farmer_name: "Gúlnara",
        phone: "+998901112233",
        sms_language: "kaa",
        sms_frequency: "daily",
        irrigation_status: {
          action: "irrigate",
          date: dayOffset(0),
          depth_mm: 90,
          volume_m3_ha: 900,
        },
        salinity_status: { level: "warning", ece_ds_m: 8.2 },
        updated_at: dayOffset(0),
      },
      {
        id: "f-shimbay",
        name: "Shımbay biyday",
        crop: "wheat",
        area_ha: 6.5,
        lat: 42.9650,
        lon: 59.8201,
        polygon: [
          [42.9661, 59.8185],
          [42.9661, 59.8217],
          [42.9638, 59.8217],
          [42.9638, 59.8185],
        ],
        sowing_date: dayOffset(-96, 0, 0),
        soil_texture: "sandy",
        irrigation_method: "sprinkler",
        farmer_name: "Saparbay",
        phone: "+998909998877",
        sms_language: "kaa",
        sms_frequency: "action",
        irrigation_status: {
          action: "none",
          date: dayOffset(5),
          depth_mm: 0,
          volume_m3_ha: 0,
        },
        salinity_status: { level: "ok", ece_ds_m: 2.0 },
        updated_at: dayOffset(0),
      },
    ];
}

function readStoredFields(): Field[] | null {
  try {
    const raw = localStorage.getItem(MOCK_FIELDS_KEY);
    return raw ? (JSON.parse(raw) as Field[]) : null;
  } catch {
    return null;
  }
}

function writeStoredFields(fields: Field[]) {
  try {
    localStorage.setItem(MOCK_FIELDS_KEY, JSON.stringify(fields));
  } catch {
    /* mock writes are best effort */
  }
}

function fieldList(): Field[] {
  return readStoredFields() ?? defaultFieldList();
}

function fields(): FieldsResponse {
  return {
    fields: fieldList(),
  };
}

function report(path: string): FieldReportResponse {
  const id = path.match(/^\/fields\/([^/]+)\/report$/)?.[1] ?? "";
  const field = fieldList().find((f) => f.id === id) ?? fieldList()[0];
  const irrigate = field.irrigation_status.action === "irrigate";
  const warning = field.salinity_status.level === "warning";
  const forecast = Array.from({ length: 7 }, (_, i) => ({
    date: dayOffset(i, 5, 30),
    icon: i === 2 || i === 6 ? "cloud" : "sun",
    rain_mm: i === 2 ? 1.5 : i === 6 ? 2.2 : 0,
    et0_mm: Number((5.6 + i * 0.18).toFixed(1)),
  })) as FieldReportResponse["forecast"];

  const locale = getStoredLocale();
  const tr = (key: string) => translate(locale, key);
  return {
    recommendation: irrigate
      ? {
          action: "irrigate",
          weekday_date: field.irrigation_status.date,
          depth_mm: field.irrigation_status.depth_mm,
          volume_m3_ha: field.irrigation_status.volume_m3_ha,
          reason: tr("mock.reason.irrigate"),
          next_check: dayOffset(2),
        }
      : {
          action: "none",
          weekday_date: field.irrigation_status.date,
          depth_mm: 0,
          volume_m3_ha: 0,
          reason: tr("mock.reason.none"),
          next_check: field.irrigation_status.date,
        },
    depletion: irrigate
      ? { current_mm: 86, threshold_mm: 70, total_mm: 120 }
      : { current_mm: 38, threshold_mm: 70, total_mm: 120 },
    forecast,
    ndvi: [
      { date: dayOffset(-28), value: 0.53, expected: 0.5 },
      { date: dayOffset(-24), value: 0.57, expected: 0.54 },
      { date: dayOffset(-20), value: 0.6, expected: 0.58 },
      { date: dayOffset(-16), value: 0.63, expected: 0.62 },
      { date: dayOffset(-12), value: warning ? 0.58 : 0.66, expected: 0.65 },
      { date: dayOffset(-8), value: warning ? 0.55 : 0.69, expected: 0.68 },
      { date: dayOffset(-4), value: warning ? 0.52 : 0.71, expected: 0.7 },
      { date: dayOffset(-1), value: warning ? 0.5 : 0.72, expected: 0.71 },
    ],
    salinity_summary: {
      level: field.salinity_status.level,
      ece_ds_m: field.salinity_status.ece_ds_m,
      tolerance_ds_m:
        field.crop === "rice" ? 3.0 : field.crop === "cotton" ? 7.7 : 6.0,
      advice: warning
        ? tr("mock.advice.warning")
        : tr("mock.advice.ok"),
    },
    sms_preview: {
      text: irrigate
        ? `${field.name}: ${field.irrigation_status.depth_mm} mm suwǵarıń. Shorlanıw: ${field.salinity_status.ece_ds_m} dS/m.`
        : `${field.name}: házir suwǵarıw kerek emes. Keyingi tekseriw ${new Date(
            field.irrigation_status.date,
          ).getDate()}-kúni.`,
      lang: field.sms_language ?? "kaa",
      segments: 1,
    },
    freshness: {
      weather: dayOffset(0, 6, 20),
      satellite: dayOffset(-1, 0, 0),
      calculated: dayOffset(0, 6, 45),
    },
  };
}

function cropTolerance(crop: string): number {
  if (crop === "rice") return 3.0;
  if (crop === "cotton") return 7.7;
  if (crop === "wheat") return 6.0;
  return 4.5;
}

function salinity(path: string): SalinityDetailResponse {
  const id = path.match(/^\/fields\/([^/]+)\/salinity$/)?.[1] ?? "";
  const field = fieldList().find((f) => f.id === id) ?? fieldList()[0];
  if (id === "f-new") {
    return { first_estimate_date: dayOffset(9), trend: [] };
  }
  const ece = field.salinity_status.ece_ds_m;
  const threshold = cropTolerance(field.crop);
  return {
    ece_ds_m: ece,
    crop_threshold_ds_m: threshold,
    yield_loss_pct: Math.max(0, Math.round(((ece - threshold) / 8) * 100)),
    leaching_mm: field.salinity_status.level === "ok" ? 0 : Math.round(ece * 12),
    status: field.salinity_status.level,
    trend: [-5, -4, -3, -2, -1, 0].map((month, i) => ({
      date: dayOffset(month * 30, 0, 0),
      ece_ds_m: Number(Math.max(0.8, ece - 0.8 + i * 0.16).toFixed(1)),
    })),
  };
}

function messageList(): MessageLogItem[] {
  const fs = fieldList();
  return [
    {
      id: "m-1",
      field_id: fs[0].id,
      field_name: fs[0].name,
      phone: fs[0].phone ?? "",
      lang: "kaa",
      text: `${fs[0].name}: 55 mm suwǵarıń. Shorlanıw: 4.1 dS/m.`,
      status: "sent",
      timestamp: dayOffset(0, 7, 10),
      test: false,
    },
    {
      id: "m-2",
      field_id: fs[1].id,
      field_name: fs[1].name,
      phone: fs[1].phone ?? "",
      lang: "kaa",
      text: `${fs[1].name}: drenajdı tekseriń, shorlanıw joqarı.`,
      status: "failed",
      timestamp: dayOffset(-1, 18, 15),
      test: false,
    },
    {
      id: "m-3",
      field_id: fs[2].id,
      field_name: fs[2].name,
      phone: fs[2].phone ?? "",
      lang: "kaa",
      text: `${fs[2].name}: házir suwǵarıw kerek emes.`,
      status: "test",
      timestamp: dayOffset(-2, 9, 20),
      test: true,
    },
  ];
}

function messages(path: string): MessagesResponse {
  const url = new URL(path, "https://mock.local");
  const fieldId = url.searchParams.get("field_id");
  const all = messageList().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  return { messages: fieldId ? all.filter((m) => m.field_id === fieldId) : all };
}

function freshness(): FreshnessResponse {
  return {
    weather: dayOffset(0, 6, 20),
    satellite: dayOffset(-1, 0, 0),
  };
}

function weather(): WeatherToday {
  return {
    location: "Nókis, Qaraqalpaqstan",
    temp_c: 34,
    rain_prob_pct: 5,
    wind_ms: 6,
  };
}

const ROUTES: Record<string, () => unknown> = {
  "/fields": fields,
  "/weather": weather,
  "/freshness": freshness,
};

/** Resolve a mocked GET with a small delay so loading skeletons show. */
export async function mockGet<T>(path: string): Promise<T> {
  const route =
    ROUTES[path] ??
    (path.match(/^\/fields\/[^/]+\/report$/)
      ? () => report(path)
      : path.match(/^\/fields\/[^/]+\/salinity$/)
        ? () => salinity(path)
        : path.startsWith("/messages")
          ? () => messages(path)
          : null);
  if (!route) throw new Error(`No mock for GET ${path}`);
  await new Promise((r) => setTimeout(r, 450));
  return route() as T;
}

function fieldFromPayload(payload: FieldPayload, id?: string): Field {
  const now = new Date().toISOString();
  return {
    id: id ?? `f-local-${Date.now()}`,
    ...payload,
    irrigation_status: {
      action: "none",
      date: dayOffset(3),
      depth_mm: 0,
      volume_m3_ha: 0,
    },
    salinity_status: {
      level: "ok",
      ece_ds_m: 2.0,
    },
    updated_at: now,
  };
}

/** Resolve mocked writes so the demo behaves like a persistent local backend. */
export async function mockMutate<T>(
  method: "POST" | "PUT" | "DELETE",
  path: string,
  payload?: FieldPayload,
): Promise<T | null> {
  await new Promise((r) => setTimeout(r, 250));

  if (method === "POST" && path === "/fields" && payload) {
    const next = [...fieldList(), fieldFromPayload(payload)];
    writeStoredFields(next);
    return next[next.length - 1] as T;
  }

  const fieldMatch = path.match(/^\/fields\/([^/]+)$/);
  if (fieldMatch) {
    const id = fieldMatch[1];
    if (method === "PUT" && payload) {
      const next = fieldList().map((field) =>
        field.id === id
          ? {
              ...field,
              ...fieldFromPayload(payload, id),
              irrigation_status: field.irrigation_status,
              salinity_status: field.salinity_status,
            }
          : field,
      );
      writeStoredFields(next);
      return next.find((field) => field.id === id) as T;
    }

    if (method === "DELETE") {
      writeStoredFields(fieldList().filter((field) => field.id !== id));
      return null;
    }
  }

  if (method === "POST" && path === "/messages/test") return null;

  throw new Error(`No mock for ${method} ${path}`);
}

export const HAS_REAL_API = Boolean(import.meta.env.VITE_API_BASE);
