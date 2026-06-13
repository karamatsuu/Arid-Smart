// Backend contract types (handoff §7). Part 1 uses GET /fields; the same
// Field shape is reused by Parts 2–4.

export interface IrrigationStatus {
  action: "irrigate" | "none";
  date: string; // irrigate on this date / no irrigation needed until it
  depth_mm: number;
  volume_m3_ha: number;
}

export type SalinityLevel = "ok" | "caution" | "warning";

export interface SalinityStatus {
  level: SalinityLevel;
  ece_ds_m: number;
}

export interface Field {
  id: string;
  name: string;
  crop: string;
  area_ha: number;
  lat: number;
  lon: number;
  polygon?: [number, number][];
  sowing_date?: string;
  soil_texture?: SoilTexture;
  irrigation_method?: IrrigationMethod;
  farmer_name?: string;
  phone?: string;
  sms_language?: SmsLanguage;
  sms_frequency?: SmsFrequency;
  irrigation_status: IrrigationStatus;
  salinity_status: SalinityStatus;
  updated_at: string;
}

export type SoilTexture = "sandy" | "loam" | "clay";
export type IrrigationMethod = "furrow" | "drip" | "sprinkler" | "flood";
export type SmsLanguage = "kaa" | "uz" | "ru";
export type SmsFrequency = "action" | "daily";

export type ReportAction = "irrigate" | "none";

export interface ReportRecommendation {
  action: ReportAction;
  weekday_date: string;
  depth_mm: number;
  volume_m3_ha: number;
  reason: string;
  next_check: string;
}

export interface ReportDepletion {
  current_mm: number;
  threshold_mm: number;
  total_mm: number;
}

export interface ForecastDay {
  date: string;
  icon: "sun" | "cloud";
  rain_mm: number;
  et0_mm: number;
}

export interface NdviPoint {
  date: string;
  value: number;
  expected: number;
}

export interface SalinitySummary {
  level: SalinityLevel;
  ece_ds_m: number;
  tolerance_ds_m: number;
  advice: string;
}

export interface SmsPreview {
  text: string;
  lang: SmsLanguage;
  segments: number;
}

export interface ReportFreshness {
  weather: string;
  satellite: string;
  calculated: string;
}

export interface FieldReportResponse {
  recommendation: ReportRecommendation;
  depletion: ReportDepletion;
  forecast: ForecastDay[];
  ndvi: NdviPoint[];
  salinity_summary: SalinitySummary;
  sms_preview: SmsPreview;
  freshness: ReportFreshness;
  stale?: boolean;
  as_of?: string;
}

export interface SalinityTrendPoint {
  date: string;
  ece_ds_m: number;
}

export interface SalinityDetailResponse {
  ece_ds_m?: number;
  crop_threshold_ds_m?: number;
  yield_loss_pct?: number;
  leaching_mm?: number;
  trend?: SalinityTrendPoint[];
  status?: SalinityLevel;
  first_estimate_date?: string;
  stale?: boolean;
  as_of?: string;
}

export type MessageStatus = "sent" | "failed" | "test";

export interface MessageLogItem {
  id: string;
  field_id: string;
  field_name: string;
  phone: string;
  lang: SmsLanguage;
  text: string;
  status: MessageStatus;
  timestamp: string;
  test: boolean;
}

export interface MessagesResponse {
  messages: MessageLogItem[];
  stale?: boolean;
  as_of?: string;
}

export interface TestMessagePayload {
  field_id: string;
  lang: SmsLanguage;
  text: string;
}

export interface FreshnessResponse {
  weather: string;
  satellite: string;
  stale?: boolean;
  as_of?: string;
}

export interface FieldPayload {
  name: string;
  crop: string;
  area_ha: number;
  lat: number;
  lon: number;
  polygon?: [number, number][];
  sowing_date: string;
  soil_texture: SoilTexture;
  irrigation_method: IrrigationMethod;
  farmer_name: string;
  phone: string;
  sms_language: SmsLanguage;
  sms_frequency: SmsFrequency;
}

/** Envelope for GET /fields — list + the global optional {stale, as_of}. */
export interface FieldsResponse {
  fields: Field[];
  stale?: boolean;
  as_of?: string;
}

/**
 * GET /weather — Home "today" header strip. Not in the handoff contract
 * (which only specifies GET /fields for Part 1); shape assumed here and
 * served by the dev mock until the backend defines it.
 */
export interface WeatherToday {
  location: string;
  temp_c: number;
  rain_prob_pct: number;
  wind_ms: number;
  stale?: boolean;
  as_of?: string;
}
