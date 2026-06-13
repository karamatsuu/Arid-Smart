import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, setStaleState, type ApiResult } from "../api/client";
import type { Field, FieldsResponse, WeatherToday } from "../api/types";
import {
  AppBar,
  FieldCard,
  Ic,
  P,
  Skeleton,
  SkeletonCard,
} from "../components";
import { useI18n } from "../i18n";
import {
  formatShortDate,
  formatShortDateTime,
} from "../lib/dates";
import { asCropKey, SALINITY_TONE } from "../lib/status";

type Filter = "irrigate" | "salinity" | "ok";

const MATCH: Record<Filter, (f: Field) => boolean> = {
  irrigate: (f) => f.irrigation_status.action === "irrigate",
  salinity: (f) => f.salinity_status.level === "warning",
  ok: (f) =>
    f.irrigation_status.action === "none" && f.salinity_status.level === "ok",
};

/** Today header: date + location + current weather in one row. */
function TodayCard({
  weather,
  unit,
}: {
  weather: WeatherToday | null;
  unit: string;
}) {
  const stat = { display: "flex", alignItems: "center", gap: 4 } as const;
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15.5 }}>
          Saturday 27 June
        </div>
        <div className="meta">{weather ? weather.location : "—"}</div>
      </div>
      {weather ? (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={stat}>
            <Ic d={P.sun} size={17} color="#c08a12" sw={1.6} />
            <b className="num" style={{ fontSize: 15 }}>{weather.temp_c}°</b>
          </span>
          <span style={stat}>
            <Ic d={P.drop} size={15} color="var(--accent)" sw={1.8} />
            <b className="num" style={{ fontSize: 15 }}>{weather.rain_prob_pct}%</b>
          </span>
          <span style={stat}>
            <Ic d={P.wind} size={16} color="var(--ink-3)" sw={1.8} />
            <b className="num" style={{ fontSize: 15 }}>
              {weather.wind_ms}
              <span style={{ fontWeight: 500, fontSize: 11, color: "var(--ink-3)" }}>
                {" "}
                {unit}
              </span>
            </b>
          </span>
        </div>
      ) : (
        <Skeleton h={18} w={120} />
      )}
    </div>
  );
}

/**
 * Page 1 — Home / Dashboard (spec Part 1): answers "which fields need
 * action today?" — today header, action summary chips, field-card list.
 */
export function Home() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [res, setRes] = useState<ApiResult<FieldsResponse> | null>(null);
  const [weather, setWeather] = useState<WeatherToday | null>(null);
  const [filter, setFilter] = useState<Filter | null>(null);

  const load = useCallback(async () => {
    setRes(null);
    const [f, w] = await Promise.all([
      apiGet<FieldsResponse>("/fields"),
      apiGet<WeatherToday>("/weather"),
    ]);
    // Concurrent GETs race on the global stale flag (last writer wins);
    // re-assert the combined result so one success can't hide the banner.
    if (f.stale || w.stale) {
      setStaleState({ stale: true, asOf: f.asOf ?? w.asOf });
    }
    setWeather(w.data);
    setRes(f);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fields = res?.data?.fields ?? null;

  const chips: { id: Filter; cls: string; icon: string; key: string; n: number }[] =
    fields
      ? [
          { id: "irrigate", cls: "on-warn", icon: P.drop, key: "home.chips.irrigate", n: fields.filter(MATCH.irrigate).length },
          { id: "salinity", cls: "on-bad", icon: P.alert, key: "home.chips.salinity", n: fields.filter(MATCH.salinity).length },
          { id: "ok", cls: "on-ok", icon: P.check, key: "home.chips.ok", n: fields.filter(MATCH.ok).length },
        ]
      : [];

  const visible = fields && filter ? fields.filter(MATCH[filter]) : fields;

  return (
    <div className="scr">
      <AppBar title={t("pages.home")} />
      <div className="scroll-body">
        <TodayCard weather={weather} unit={t("common.ms")} />

        {/* loading: skeleton cards, never a blank screen */}
        {res === null && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* network failed and no cache at all */}
        {res !== null && fields === null && (
          <div className="center-note">
            <Ic d={P.wifi_off} size={34} color="var(--ink-3)" sw={1.6} />
            <p style={{ margin: 0, fontSize: 15.5, maxWidth: 280 }}>
              {t("home.error.body")}
            </p>
            <button
              className="btn sec sm"
              onClick={() => void load()}
              style={{ minHeight: 48 }}
            >
              <Ic d={P.refresh} size={16} sw={2} />
              {t("common.retry")}
            </button>
          </div>
        )}

        {/* empty state: no fields registered yet */}
        {fields !== null && fields.length === 0 && (
          <div className="center-note">
            <svg
              viewBox="0 0 120 90"
              width="120"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 78h96" />
              <path d="M26 78v-6m18 6v-10m18 10v-6m36 6v-8" opacity=".5" />
              <path d="M60 68V46m0 0c0-10-7-17-18-17 0 11 7 18 18 17m0-6c.6-10 7.4-15.4 18-15.4-.8 11-7.5 15.8-18 15.4" stroke="var(--accent)" />
              <circle cx="94" cy="24" r="13" />
              <path d="M94 18v12m-6-6h12" />
            </svg>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "var(--ink)" }}>
              {t("home.empty.title")}
            </p>
            <p style={{ margin: 0, fontSize: 15, maxWidth: 280 }}>
              {t("home.empty.body")}
            </p>
            <button
              className="btn pri"
              style={{ maxWidth: 240 }}
              onClick={() => navigate("/fields/new")}
            >
              <Ic d={P.plus} size={18} sw={2.2} />
              {t("home.empty.cta")}
            </button>
          </div>
        )}

        {/* summary chips + field cards */}
        {fields !== null && fields.length > 0 && (
          <>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {chips.map((c) => {
                const active = filter === c.id;
                return (
                  <button
                    key={c.id}
                    className={`chip ${filter === null || active ? c.cls : ""}`}
                    style={active ? { boxShadow: "0 0 0 2px currentColor inset" } : undefined}
                    aria-pressed={active}
                    disabled={c.n === 0}
                    onClick={() => setFilter(active ? null : c.id)}
                  >
                    <Ic d={c.icon} size={14} sw={2.2} />
                    {t(c.key, { n: c.n })}
                  </button>
                );
              })}
            </div>

            {visible?.map((f) => {
              const irr = f.irrigation_status;
              const date = formatShortDate(irr.date, locale);
              return (
                <FieldCard
                  key={f.id}
                  name={f.name}
                  crop={asCropKey(f.crop)}
                  metaLine={`${t(`crops.${asCropKey(f.crop)}`)} · ${f.area_ha} ${t("common.ha")}`}
                  irrigation={
                    irr.action === "irrigate"
                      ? t("home.irr.do", { date, mm: irr.depth_mm })
                      : t("home.irr.none", { date })
                  }
                  irrigationTone={irr.action === "irrigate" ? "warn" : "ok"}
                  salinity={t(`home.sal.${f.salinity_status.level}`)}
                  salinityTone={SALINITY_TONE[f.salinity_status.level]}
                  updatedAt={formatShortDateTime(f.updated_at, locale)}
                  stale={res?.stale}
                  onClick={() => navigate(`/fields/${f.id}`)}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
