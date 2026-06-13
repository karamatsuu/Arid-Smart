import { useEffect, useState } from "react";
import { subscribeStale, type StaleState } from "../api/client";
import { useI18n } from "../i18n";
import { formatShortDateTime } from "../lib/dates";
import { Ic, P } from "./icons";

/**
 * Global offline/stale banner (spec §0.4/§0.6): thin amber strip shown
 * app-wide whenever the data layer reports stale data —
 * "Offline — showing data from {date}".
 */
export function OfflineBanner() {
  const { t, locale } = useI18n();
  const [state, setState] = useState<StaleState>({ stale: false, asOf: null });

  useEffect(() => subscribeStale(setState), []);

  if (!state.stale) return null;
  const date = state.asOf ? formatShortDateTime(state.asOf, locale) : "—";
  return (
    <div className="banner-offline" role="status">
      <Ic d={P.wifi_off} size={15} sw={2} />
      {t("offline.banner", { date })}
    </div>
  );
}
