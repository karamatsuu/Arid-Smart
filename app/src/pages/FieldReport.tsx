import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiMutate, queueMutation, type ApiResult } from "../api/client";
import type { Field, FieldReportResponse, SalinityLevel } from "../api/types";
import {
  AppBar,
  ConfirmDialog,
  CropBadge,
  DepletionGauge,
  Ic,
  P,
  RecommendationHero,
  Skeleton,
  SkeletonCard,
  SmsBubble,
  Sparkline,
  StatusPill,
  useToast,
  WeatherStrip,
  type StatusTone,
  type WeatherDay,
} from "../components";
import { useI18n } from "../i18n";
import { buildFieldContext } from "../api/chat";
import { formatShortDate, formatShortDateTime, formatWeekdayDate } from "../lib/dates";
import { getUnitPrimary, subscribeUnitPrimary } from "../lib/settings";
import { asCropKey, growthStageKey, SALINITY_TONE } from "../lib/status";

function salinityTone(level: SalinityLevel): StatusTone {
  return SALINITY_TONE[level];
}

function pct(current: number, total: number): number {
  return total > 0 ? Math.round((current / total) * 100) : 0;
}

function routeWithField(path: string, id: string) {
  return path.replace(":id", id);
}

function CardError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="card report-card-error">
      <Ic d={P.wifi_off} size={22} color="var(--ink-3)" sw={1.8} />
      <span>{t("report.cardError")}</span>
      <button className="btn sec sm" onClick={onRetry}>
        <Ic d={P.refresh} size={16} sw={2} />
        {t("common.retry")}
      </button>
    </div>
  );
}

function ReportCard({
  ready,
  children,
  onRetry,
}: {
  ready: boolean;
  children: ReactNode;
  onRetry: () => void;
}) {
  if (!ready) return <SkeletonCard />;
  if (!children) return <CardError onRetry={onRetry} />;
  return <>{children}</>;
}

/**
 * Page 4 — Field Report: assembles Part 0 report primitives into one
 * farmer-facing field advice screen.
 */
export function FieldReport() {
  const { id = "" } = useParams();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const toast = useToast();
  const [reportRes, setReportRes] = useState<ApiResult<FieldReportResponse> | null>(null);
  const [fieldsRes, setFieldsRes] = useState<ApiResult<{ fields: Field[] }> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [unitPrimary, setUnitPrimaryState] = useState(getUnitPrimary);

  const loadReport = useCallback(async () => {
    setReportRes(null);
    setReportRes(await apiGet<FieldReportResponse>(`/fields/${id}/report`));
  }, [id]);

  const loadFields = useCallback(async () => {
    setFieldsRes(await apiGet<{ fields: Field[] }>("/fields"));
  }, []);

  useEffect(() => {
    void loadFields();
    void loadReport();
  }, [loadFields, loadReport]);

  useEffect(() => subscribeUnitPrimary(setUnitPrimaryState), []);

  const field = useMemo(
    () => fieldsRes?.data?.fields.find((f) => f.id === id) ?? null,
    [fieldsRes, id],
  );
  const report = reportRes?.data ?? null;
  const reportReady = reportRes !== null;
  const crop = asCropKey(field?.crop ?? "vegetables");
  const headerSub =
    fieldsRes === null
      ? t("common.loading")
      : field
        ? `${t(`crops.${crop}`)} · ${formatShortDate(field.sowing_date ?? field.updated_at, locale)} · ${field.area_ha} ${t("common.ha")}`
        : t("wizard.loadError");

  const recommendationTone: StatusTone =
    report?.recommendation.action === "irrigate" ? "warn" : "ok";

  const forecastDays: WeatherDay[] =
    report?.forecast.map((d) => ({
      label: formatWeekdayDate(d.date, locale).slice(0, 1),
      icon: d.icon,
      rain: t("report.rainMm", { mm: d.rain_mm }),
      et0: t("report.et0Mm", { mm: d.et0_mm }),
    })) ?? [];
  const highlight = report
    ? report.forecast.findIndex(
        (d) =>
          formatShortDate(d.date, "en") ===
          formatShortDate(report.recommendation.weekday_date, "en"),
      )
    : -1;

  const latestNdvi = report?.ndvi[report.ndvi.length - 1];
  const prevNdvi = report && report.ndvi.length > 1 ? report.ndvi[report.ndvi.length - 2] : null;
  const ndviBelow = latestNdvi ? latestNdvi.value < latestNdvi.expected : false;
  const ndviRising = latestNdvi && prevNdvi ? latestNdvi.value >= prevNdvi.value : true;
  const depletionPct = report
    ? pct(report.depletion.current_mm, report.depletion.total_mm)
    : 0;
  const thresholdPct = report
    ? pct(report.depletion.threshold_mm, report.depletion.total_mm)
    : 0;

  const deleteField = async () => {
    setConfirmDelete(false);
    try {
      if (!navigator.onLine) throw new Error("offline");
      await apiMutate("DELETE", `/fields/${id}`);
      toast(t("toast.fieldDeleted"));
      navigate("/fields", { replace: true });
    } catch {
      queueMutation("DELETE", `/fields/${id}`);
      toast(t("toast.fieldQueued"));
      navigate("/fields", { replace: true });
    }
  };

  const sendSms = () => {
    setMenuOpen(false);
    toast(t("toast.smsSent"));
  };

  return (
    <div className="scr">
      <AppBar
        title={field?.name ?? t("pages.fieldReport")}
        sub={headerSub}
        back
        backTo="/fields"
        actions={
          <div className="report-menu-wrap">
            <button
              className="iconbtn"
              aria-label={t("report.menu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Ic d={P.more} size={22} sw={3} />
            </button>
            {menuOpen && (
              <div className="report-menu">
                <button onClick={() => navigate(`/fields/${id}/edit`)}>
                  <Ic d={P.edit} size={18} sw={1.9} />
                  {t("report.editField")}
                </button>
                <button onClick={sendSms}>
                  <Ic d={P.send} size={18} sw={1.9} />
                  {t("report.sendSmsNow")}
                </button>
                <button
                  className="danger"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                >
                  <Ic d={P.trash} size={18} sw={1.9} />
                  {t("report.deleteField")}
                </button>
              </div>
            )}
          </div>
        }
      />

      <div className="scroll-body report-body">
        {fieldsRes === null ? (
          <div className="cardrow card">
            <Skeleton h={42} w={42} r={12} />
            <div style={{ flex: 1 }}>
              <Skeleton h={16} w="70%" />
              <div style={{ height: 8 }} />
              <Skeleton h={13} w="52%" />
            </div>
          </div>
        ) : (
          field && (
            <section className="card report-header-card">
              <CropBadge crop={crop} size={44} />
              <div>
                <div className="report-stage">{t(growthStageKey(field.crop, field.sowing_date ?? field.updated_at))}</div>
                <div className="report-meta">
                  {t(`crops.${crop}`)} · {formatShortDate(field.sowing_date ?? field.updated_at, locale)} ·{" "}
                  <span className="num">
                    {field.area_ha} {t("common.ha")}
                  </span>
                </div>
              </div>
            </section>
          )
        )}

        <ReportCard ready={reportReady} onRetry={() => void loadReport()}>
          {report && (
            <RecommendationHero
              tone={recommendationTone}
              kicker={
                report.recommendation.action === "irrigate"
                  ? t("report.actionNeeded")
                  : t("report.noAction")
              }
              headline={
                report.recommendation.action === "irrigate"
                  ? t("report.irrigateOn", {
                      date: formatWeekdayDate(report.recommendation.weekday_date, locale),
                    })
                  : t("report.noIrrigation")
              }
              mm={report.recommendation.depth_mm}
              m3ha={report.recommendation.volume_m3_ha}
              primaryUnit={unitPrimary}
              note={
                report.recommendation.action === "irrigate"
                  ? report.recommendation.reason
                  : t("report.nextCheck", {
                      date: formatWeekdayDate(report.recommendation.next_check, locale),
                    })
              }
            />
          )}
        </ReportCard>

        <ReportCard ready={reportReady} onRetry={() => void loadReport()}>
          {report && (
            <section className="card">
              <h3>{t("report.depletion.title")}</h3>
              <div className="report-card-top">
                <span className="mid-num">{depletionPct}%</span>
                <span className="report-muted">
                  {report.depletion.current_mm}/{report.depletion.total_mm} mm
                </span>
              </div>
              <DepletionGauge
                pct={depletionPct}
                threshold={thresholdPct}
                labelLeft={t("report.depletion.full")}
                labelMid={t("report.depletion.threshold")}
                labelRight={t("report.depletion.empty")}
              />
            </section>
          )}
        </ReportCard>

        <ReportCard ready={reportReady} onRetry={() => void loadReport()}>
          {report && (
            <section className="card">
              <h3>{t("report.forecast.title")}</h3>
              <WeatherStrip days={forecastDays} highlight={highlight} />
            </section>
          )}
        </ReportCard>

        <ReportCard ready={reportReady} onRetry={() => void loadReport()}>
          {report && (
            <section className="card">
              <div className="report-card-head">
                <h3>{t("report.salinity.title")}</h3>
                <StatusPill tone={salinityTone(report.salinity_summary.level)} small>
                  {t(`report.salinity.${report.salinity_summary.level}`)}
                </StatusPill>
              </div>
              <div className="report-split">
                <span className="mid-num">{report.salinity_summary.ece_ds_m}</span>
                <span className="report-muted">
                  {t("report.salinity.vsTolerance", {
                    value: report.salinity_summary.tolerance_ds_m,
                  })}
                </span>
              </div>
              <p className="report-note">{report.salinity_summary.advice}</p>
              <button
                className="btn sec"
                onClick={() => navigate(routeWithField("/fields/:id/salinity", id))}
              >
                {t("report.details")}
              </button>
            </section>
          )}
        </ReportCard>

        <ReportCard ready={reportReady} onRetry={() => void loadReport()}>
          {report && latestNdvi && (
            <section className="card">
              <div className="report-card-head">
                <h3>{t("report.ndvi.title")}</h3>
                <span className={`trend ${ndviBelow ? "bad" : "ok"}`}>
                  <Ic
                    d={P.chev}
                    size={16}
                    sw={2.4}
                    style={{ transform: ndviRising ? "rotate(-90deg)" : "rotate(90deg)" }}
                  />
                  {ndviBelow ? t("report.ndvi.below") : t("report.ndvi.normal")}
                </span>
              </div>
              <div className="ndvi-row">
                <Sparkline pts={report.ndvi.map((p) => p.expected)} color="var(--ink-3)" dashed />
                <Sparkline pts={report.ndvi.map((p) => p.value)} color="var(--accent)" />
              </div>
              <div className="report-card-top">
                <span className="mid-num">{latestNdvi.value.toFixed(2)}</span>
                <span className="report-muted">
                  {t("report.ndvi.lastPass", {
                    date: formatShortDate(latestNdvi.date, locale),
                  })}
                </span>
              </div>
            </section>
          )}
        </ReportCard>

        <ReportCard ready={reportReady} onRetry={() => void loadReport()}>
          {report && (
            <section className="card">
              <h3>{t("report.sms.title")}</h3>
              <SmsBubble
                text={report.sms_preview.text}
                lang={report.sms_preview.lang.toUpperCase()}
              />
              <div className="report-actions">
                <button className="btn pri" onClick={sendSms}>
                  <Ic d={P.send} size={18} sw={1.9} />
                  {t("report.sendNow")}
                </button>
                <button
                  className="btn sec"
                  onClick={() => navigate(`/messages?field=${encodeURIComponent(id)}`)}
                >
                  {t("report.history")}
                </button>
                <button
                  className="btn sec"
                  onClick={() =>
                    report &&
                    field &&
                    navigate("/chat", {
                      state: { fieldContext: buildFieldContext(field, report) },
                    })
                  }
                >
                  <Ic d={P.bot} size={18} sw={1.9} />
                  {t("chat.title")}
                </button>
              </div>
            </section>
          )}
        </ReportCard>

        <ReportCard ready={reportReady} onRetry={() => void loadReport()}>
          {report && (
            <footer className="freshness">
              {t("report.freshness.weather", {
                value: formatShortDateTime(report.freshness.weather, locale),
              })}{" "}
              ·{" "}
              {t("report.freshness.satellite", {
                value: formatShortDate(report.freshness.satellite, locale),
              })}{" "}
              ·{" "}
              {t("report.freshness.calculated", {
                value: formatShortDateTime(report.freshness.calculated, locale),
              })}
            </footer>
          )}
        </ReportCard>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t("confirm.deleteField.title")}
        body={t("confirm.deleteField.body")}
        dangerLabel={t("confirm.delete")}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void deleteField()}
      />
    </div>
  );
}
