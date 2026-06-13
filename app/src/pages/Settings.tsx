import { useCallback, useEffect, useState } from "react";
import { apiGet, clearCache, type ApiResult } from "../api/client";
import type { FreshnessResponse } from "../api/types";
import {
  AppBar,
  ConfirmDialog,
  Ic,
  P,
  Skeleton,
  StatusPill,
  useToast,
} from "../components";
import { LOCALES, useI18n, type Locale } from "../i18n";
import { formatShortDate, formatShortDateTime } from "../lib/dates";
import {
  cacheSizeBytes,
  getUnitPrimary,
  setUnitPrimary,
  type UnitPrimary,
} from "../lib/settings";

export function Settings() {
  const { t, locale, setLocale } = useI18n();
  const toast = useToast();
  const [unit, setUnit] = useState<UnitPrimary>(getUnitPrimary);
  const [fresh, setFresh] = useState<ApiResult<FreshnessResponse> | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [cacheBytes, setCacheBytes] = useState(() => cacheSizeBytes());

  const loadFreshness = useCallback(async () => {
    setFresh(null);
    setFresh(await apiGet<FreshnessResponse>("/freshness"));
  }, []);

  useEffect(() => {
    void loadFreshness();
  }, [loadFreshness]);

  const chooseUnit = (next: UnitPrimary) => {
    setUnit(next);
    setUnitPrimary(next);
  };

  const clear = () => {
    clearCache();
    setCacheBytes(cacheSizeBytes());
    setConfirmClear(false);
    toast(t("settings.cacheCleared"));
  };

  return (
    <div className="scr">
      <AppBar title={t("pages.settings")} />
      <div className="scroll-body">
        <section className="card settings-card">
          <h3>{t("settings.language")}</h3>
          <div className="settings-list">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                className="settings-row"
                aria-current={locale === l.code}
                onClick={() => setLocale(l.code as Locale)}
              >
                <span>{l.label}</span>
                {locale === l.code && <StatusPill tone="ok" small>{t("status.ok")}</StatusPill>}
              </button>
            ))}
          </div>
        </section>

        <section className="card settings-card">
          <h3>{t("settings.units")}</h3>
          <div className="seg">
            <button className={unit === "mm" ? "on" : ""} onClick={() => chooseUnit("mm")}>
              {t("settings.unit.mm")}
            </button>
            <button
              className={unit === "m3ha" ? "on" : ""}
              onClick={() => chooseUnit("m3ha")}
            >
              {t("settings.unit.m3ha")}
            </button>
          </div>
        </section>

        <section className="card settings-card">
          <div className="report-card-head">
            <h3>{t("settings.data")}</h3>
            <button className="btn sec sm" onClick={() => void loadFreshness()}>
              <Ic d={P.refresh} size={16} sw={2} />
              {t("settings.refresh")}
            </button>
          </div>
          {fresh === null ? (
            <>
              <Skeleton h={16} w="72%" />
              <div style={{ height: 10 }} />
              <Skeleton h={16} w="58%" />
            </>
          ) : (
            <div className="settings-list">
              <div className="settings-row static">
                <span>{t("settings.weather")}</span>
                <span>{formatShortDateTime(fresh.data?.weather ?? "", locale)}</span>
              </div>
              <div className="settings-row static">
                <span>{t("settings.satellite")}</span>
                <span>{formatShortDate(fresh.data?.satellite ?? "", locale)}</span>
              </div>
              <div className="settings-row static">
                <span>{t("settings.cacheSize")}</span>
                <span className="num">
                  {cacheBytes < 1024
                    ? t("settings.bytes", { value: cacheBytes })
                    : t("settings.kb", { value: Math.round(cacheBytes / 1024) })}
                </span>
              </div>
            </div>
          )}
          <button className="btn danger" onClick={() => setConfirmClear(true)}>
            <Ic d={P.trash} size={18} sw={1.9} />
            {t("settings.clearCache")}
          </button>
        </section>

        <section className="card settings-card">
          <h3>{t("settings.about")}</h3>
          <div className="about-list">
            <p>{t("settings.version")}</p>
            <p>{t("settings.sources")}</p>
            <p>{t("settings.method")}</p>
            <p>{t("settings.contact")}</p>
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={confirmClear}
        title={t("confirm.clearCache.title")}
        body={t("confirm.clearCache.body")}
        dangerLabel={t("confirm.clear")}
        onCancel={() => setConfirmClear(false)}
        onConfirm={clear}
      />
    </div>
  );
}
