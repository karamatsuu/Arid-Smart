import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, type ApiResult } from "../api/client";
import type { Field, FieldsResponse } from "../api/types";
import {
  BottomSheet,
  CropBadge,
  Ic,
  LanguageSwitcher,
  P,
  SkeletonCard,
  StatusPill,
  useToast,
} from "../components";
import { useI18n } from "../i18n";
import { formatShortDate } from "../lib/dates";
import {
  asCropKey,
  irrigationTone,
  salinityTone,
  worstTone,
} from "../lib/status";

const SAVITSKY_MUSEUM: L.LatLngTuple = [42.4673, 59.6096];
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR = "© OpenStreetMap";

function toneColor(tone: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${tone}`)
    .trim();
}

/**
 * Page 2 — Fields (spec Part 2): Leaflet map of all field polygons tinted
 * by worst status, with a first-class list view as the offline fallback.
 */
export function Fields() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const toast = useToast();
  const [res, setRes] = useState<ApiResult<FieldsResponse> | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [tilesFailed, setTilesFailed] = useState(false);
  const [selected, setSelected] = useState<Field | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const load = useCallback(async () => {
    setRes(null);
    setRes(await apiGet<FieldsResponse>("/fields"));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fields = res?.data?.fields ?? null;

  /* map lifecycle: created when the map view + data are on screen */
  const mapNode = useCallback(
    (div: HTMLDivElement | null) => {
      mapRef.current?.remove();
      mapRef.current = null;
      if (!div || !fields) return;

      const map = L.map(div, { zoomControl: false, attributionControl: false });
      mapRef.current = map;
      L.control.attribution({ prefix: false }).addAttribution(TILE_ATTR).addTo(map);

      let loaded = 0;
      const failTiles = () => {
        if (mapRef.current !== map) return;
        setTilesFailed(true);
        setView("list");
      };
      const tiles = L.tileLayer(TILE_URL);
      tiles.on("tileload", () => {
        loaded += 1;
      });
      tiles.on("tileerror", failTiles);
      tiles.addTo(map);
      if (!navigator.onLine) failTiles();
      window.setTimeout(() => {
        if (loaded === 0) failTiles();
      }, 4500);

      const bounds = L.latLngBounds([]);
      for (const f of fields) {
        const color = toneColor(worstTone(f));
        const open = () => setSelected(f);
        if (f.polygon && f.polygon.length >= 3) {
          const poly = L.polygon(f.polygon as L.LatLngTuple[], {
            color,
            weight: 2.5,
            fillColor: color,
            fillOpacity: 0.3,
          }).addTo(map);
          poly.on("click", open);
          bounds.extend(poly.getBounds());
        } else if (Number.isFinite(f.lat) && Number.isFinite(f.lon)) {
          const dot = L.circleMarker([f.lat, f.lon], {
            radius: 11,
            color,
            weight: 2.5,
            fillColor: color,
            fillOpacity: 0.5,
          }).addTo(map);
          dot.on("click", open);
          bounds.extend([f.lat, f.lon]);
        }
      }
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
      } else {
        map.setView(SAVITSKY_MUSEUM, 15);
      }
      window.setTimeout(() => map.invalidateSize(), 0);
    },
    [fields],
  );

  useEffect(
    () => () => {
      mapRef.current?.remove();
    },
    [],
  );

  const locateMe = () => {
    if (!navigator.geolocation) {
      toast(t("fields.locateFail"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 14),
      () => toast(t("fields.locateFail")),
      { timeout: 8000 },
    );
  };

  const metaLine = (f: Field) =>
    `${t(`crops.${asCropKey(f.crop)}`)} · ${f.area_ha} ${t("common.ha")}`;

  return (
    <div className="scr">
      <header className="appbar">
        <h1 className="title" style={{ margin: 0 }}>
          {t("pages.fields")}
        </h1>
        <div className="seg" style={{ width: 158 }} role="group">
          <button
            className={view === "map" ? "on" : ""}
            aria-pressed={view === "map"}
            onClick={() => {
              setTilesFailed(false);
              setView("map");
            }}
          >
            {t("fields.map")}
          </button>
          <button
            className={view === "list" ? "on" : ""}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            {t("fields.list")}
          </button>
        </div>
        <LanguageSwitcher />
      </header>

      {/* loading */}
      {res === null && (
        <div className="scroll-body">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* network failed and no cache at all */}
      {res !== null && fields === null && (
        <div className="center-note">
          <Ic d={P.wifi_off} size={34} color="var(--ink-3)" sw={1.6} />
          <p style={{ margin: 0, fontSize: 15.5, maxWidth: 280 }}>
            {t("home.error.body")}
          </p>
          <button className="btn sec sm" style={{ minHeight: 48 }} onClick={() => void load()}>
            <Ic d={P.refresh} size={16} sw={2} />
            {t("common.retry")}
          </button>
        </div>
      )}

      {fields !== null && view === "map" && (
        <div className="map-wrap">
          <div className="map-canvas" ref={mapNode} />
          {fields.length === 0 && (
            <div className="map-empty" aria-hidden="true">
              <Ic d={P.layers} size={42} color="var(--brand)" sw={1.5} />
            </div>
          )}
          <div className="map-ctl">
            <button aria-label={t("fields.zoomIn")} onClick={() => mapRef.current?.zoomIn()}>
              <Ic d={P.plus} size={20} sw={2.2} />
            </button>
            <button aria-label={t("fields.zoomOut")} onClick={() => mapRef.current?.zoomOut()}>
              <Ic d={P.minus} size={20} sw={2.2} />
            </button>
            <span className="gap" />
            <button aria-label={t("fields.locate")} onClick={locateMe}>
              <Ic d={P.locate} size={20} sw={1.8} />
            </button>
          </div>
        </div>
      )}

      {fields !== null && view === "list" && (
        <div className="scroll-body" style={{ paddingBottom: 96 }}>
          {tilesFailed && (
            <div className="meta" style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Ic d={P.wifi_off} size={13} sw={2} />
              {t("fields.tilesFailed")}
            </div>
          )}
          {fields.map((f) => (
            <button key={f.id} className="lrow" onClick={() => setSelected(f)}>
              <CropBadge crop={asCropKey(f.crop)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{f.name}</div>
                <div className="meta">{metaLine(f)}</div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}
              >
                <StatusPill small tone={irrigationTone(f)}>
                  {f.irrigation_status.action === "irrigate"
                    ? formatShortDate(f.irrigation_status.date, locale)
                    : t("fields.irrNotNeeded")}
                </StatusPill>
                <StatusPill small tone={salinityTone(f)}>
                  {t(`home.sal.${f.salinity_status.level}`)}
                </StatusPill>
              </div>
              <Ic d={P.chev} size={17} color="var(--ink-3)" />
            </button>
          ))}
        </div>
      )}

      {/* empty state: pulsing hint pointing at the + FAB */}
      {fields !== null && fields.length === 0 && (
        <div className="fab-hint">{t("fields.emptyHint")}</div>
      )}

      {fields !== null && selected === null && (
        <button className="fab" onClick={() => navigate("/fields/new")}>
          <Ic d={P.plus} size={18} sw={2.4} />
          {t("fields.add")}
        </button>
      )}

      {/* field summary bottom sheet (map polygon tap) */}
      <BottomSheet open={selected !== null} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <div className="cardrow">
              <CropBadge crop={asCropKey(selected.crop)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16.5 }}>{selected.name}</div>
                <div className="meta">{metaLine(selected)}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <StatusPill tone={irrigationTone(selected)}>
                {selected.irrigation_status.action === "irrigate"
                  ? t("home.irr.do", {
                      date: formatShortDate(selected.irrigation_status.date, locale),
                      mm: selected.irrigation_status.depth_mm,
                    })
                  : t("home.irr.none", {
                      date: formatShortDate(selected.irrigation_status.date, locale),
                    })}
              </StatusPill>
              <StatusPill tone={salinityTone(selected)}>
                {t(`home.sal.${selected.salinity_status.level}`)}
              </StatusPill>
            </div>
            <button className="btn pri" onClick={() => navigate(`/fields/${selected.id}`)}>
              {t("fields.openReport")}
            </button>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
