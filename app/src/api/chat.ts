import type { Field, FieldReportResponse } from "./types";

export interface FieldContext {
  fieldName: string;
  crop: string;
  areaHa: number;
  sowingDate: string;
  soilTexture: string;
  irrigationMethod: string;
  irrigationAction: "irrigate" | "none";
  irrigationDate: string;
  depthMm: number;
  volumeM3ha: number;
  depletionPct: number;
  currentMm: number;
  totalMm: number;
  salinityLevel: "ok" | "caution" | "warning";
  eceDsM: number;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function buildFieldContext(
  field: Field,
  report: FieldReportResponse,
): FieldContext {
  const total = report.depletion.total_mm;
  return {
    fieldName: field.name,
    crop: field.crop,
    areaHa: field.area_ha,
    sowingDate: field.sowing_date ?? field.updated_at,
    soilTexture: field.soil_texture ?? "loam",
    irrigationMethod: field.irrigation_method ?? "furrow",
    irrigationAction: report.recommendation.action,
    irrigationDate: report.recommendation.weekday_date,
    depthMm: report.recommendation.depth_mm,
    volumeM3ha: report.recommendation.volume_m3_ha,
    depletionPct: total > 0 ? Math.round((report.depletion.current_mm / total) * 100) : 0,
    currentMm: report.depletion.current_mm,
    totalMm: total,
    salinityLevel: report.salinity_summary.level,
    eceDsM: report.salinity_summary.ece_ds_m,
    updatedAt: report.freshness.calculated,
  };
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export async function sendChatMessage(
  messages: ChatMessage[],
  fieldContext: FieldContext | null,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      fieldContext: fieldContext ?? undefined,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.body) throw new Error("Response body is null");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data) as { text?: string };
        if (typeof parsed.text === "string") onChunk(parsed.text);
      } catch {
        // skip malformed SSE chunk
      }
    }
  }
  // flush any remaining line in buffer
  if (buffer.startsWith("data: ")) {
    const data = buffer.slice(6);
    if (data !== "[DONE]") {
      try {
        const parsed = JSON.parse(data) as { text?: string };
        if (typeof parsed.text === "string") onChunk(parsed.text);
      } catch {
        // skip malformed
      }
    }
  }
}
