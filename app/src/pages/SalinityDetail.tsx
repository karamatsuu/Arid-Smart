import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, type ApiResult } from "../api/client";
import type { Field, SalinityDetailResponse, SalinityLevel } from "../api/types";
import {
  AppBar,
  Ic,
  P,
  SalinityScale,
  SkeletonCard,
  Sparkline,
  StatusPill,
} from "../components";
import { useI18n } from "../i18n";
import { formatShortDate } from "../lib/dates";
import { SALINITY_TONE, asCropKey } from "../lib/status";

const SEVERE_FROM = 12;

function salinityTone(status?: SalinityLevel) {
  return status ? SALINITY_TONE[status] : "na";
}

export function SalinityDetail() {
  const { id = "" } = useParams();
  const { t, locale } = useI18n();
  const [res, setRes] = useState<ApiResult<SalinityDetailResponse> | null>(null);
  const [fieldsRes, setFieldsRes] = useState<ApiResult<{ fields: Field[] }> | null>(null);
  const [knowOpen, setKnowOpen] = useState(false);

  const load = useCallback(async () => {
    setRes(null);
    setRes(await apiGet<SalinityDetailResponse>(`/fields/${id}/salinity`));
  }, [id]);

  useEffect(() => {
    void apiGet<{ fields: Field[] }>("/fields").then(setFieldsRes);
    void load();
  }, [load]);

  const field = useMemo(
    () => fieldsRes?.data?.fields.find((f) => f.id === id) ?? null,
    [fieldsRes, id],
  );
  const data = res?.data ?? null;
  const noData = res !== null && data && data.ece_ds_m === undefined;
  const crop = asCropKey(field?.crop ?? "vegetables");
  const status = data?.status;

  return (
    <div className="scr">
      <AppBar
        title={t("pages.salinity")}
        sub={field ? `${field.name} · ${t(`crops.${crop}`)}` : t("common.loading")}
        back
      />
      <div className="scroll-body">
        {res === null && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {noData && (
          <section className="center-note card">
            <Ic d={P.clock} size={34} color="var(--ink-3)" sw={1.7} />
            <p style={{ margin: 0 }}>
              {t("salinity.noData", {
                date: formatShortDate(data.first_estimate_date ?? "", locale),
              })}
            </p>
            <button className="btn sec sm" onClick={() => void load()}>
              <Ic d={P.refresh} size={16} sw={2} />
              {t("common.retry")}
            </button>
          </section>
        )}

        {res !== null && !data && (
          <section className="center-note card">
            <Ic d={P.wifi_off} size={34} color="var(--ink-3)" sw={1.7} />
            <p style={{ margin: 0 }}>{t("home.error.body")}</p>
            <button className="btn sec sm" onClick={() => void load()}>
              <Ic d={P.refresh} size={16} sw={2} />
              {t("common.retry")}
            </button>
          </section>
        )}

        {data && !noData && (
          <>
            <section className={`card tone-${salinityTone(status)}`}>
              <div className="report-card-head">
                <h3>{t("salinity.status")}</h3>
                <StatusPill tone={salinityTone(status)}>
                  {t(`report.salinity.${status}`)}
                </StatusPill>
              </div>
              <div className="salinity-big num">
                {data.ece_ds_m}
                <span>dS/m</span>
              </div>
            </section>

            <section className="card">
              <h3>{t("salinity.scale")}</h3>
              <SalinityScale
                value={data.ece_ds_m ?? 0}
                threshold={data.crop_threshold_ds_m ?? 0}
                severeFrom={SEVERE_FROM}
                valueLabel={t("salinity.fieldMarker", { value: data.ece_ds_m ?? 0 })}
                thresholdLabel={t("salinity.cropMarker", {
                  value: data.crop_threshold_ds_m ?? 0,
                })}
                legend={{
                  ok: t("salinity.zone.safe"),
                  warn: t("salinity.zone.loss"),
                  bad: t("salinity.zone.severe"),
                }}
              />
            </section>

            <section className="card">
              <p className="report-note" style={{ marginTop: 0 }}>
                {t("salinity.yieldLoss", { pct: data.yield_loss_pct ?? 0 })}
              </p>
              {status && status !== "ok" && (
                <div className="leach-card">
                  <Ic d={P.drop} size={22} sw={1.9} />
                  <div>
                    <strong>{t("salinity.leachTitle", { mm: data.leaching_mm ?? 0 })}</strong>
                    <p>{t("salinity.leachCaution")}</p>
                  </div>
                </div>
              )}
            </section>

            <section className="card">
              <h3>{t("salinity.trend")}</h3>
              <div className="salinity-trend">
                <Sparkline
                  pts={(data.trend ?? []).map((p) => p.ece_ds_m)}
                  w={280}
                  h={66}
                  color={`var(--${salinityTone(status)})`}
                />
              </div>
              <div className="gauge-labels">
                {(data.trend ?? []).slice(0, 1).map((p) => (
                  <span key={p.date}>{formatShortDate(p.date, locale)}</span>
                ))}
                {(data.trend ?? []).slice(-1).map((p) => (
                  <span key={p.date}>{formatShortDate(p.date, locale)}</span>
                ))}
              </div>
            </section>

            <section className="card">
              <button
                className="disclosure"
                aria-expanded={knowOpen}
                onClick={() => setKnowOpen((v) => !v)}
              >
                <span>{t("salinity.howTitle")}</span>
                <Ic
                  d={P.chev}
                  size={18}
                  sw={2}
                  style={{ transform: knowOpen ? "rotate(90deg)" : undefined }}
                />
              </button>
              {knowOpen && <p className="report-note">{t("salinity.howBody")}</p>}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
