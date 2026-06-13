import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  apiGet,
  apiMutate,
  queueMutation,
  type ApiResult,
} from "../api/client";
import type {
  Field,
  FieldPayload,
  FieldsResponse,
  IrrigationMethod,
  SmsFrequency,
  SmsLanguage,
  SoilTexture,
} from "../api/types";
import {
  ConfirmDialog,
  CropBadge,
  Ic,
  P,
  SkeletonCard,
  WizardFrame,
  useToast,
  type CropKey,
} from "../components";
import { useI18n } from "../i18n";
import { formatShortDate } from "../lib/dates";
import { asCropKey } from "../lib/status";
import {
  cornersAreaHa,
  cornersCentroid,
  type CornerPoint,
} from "../lib/fieldUtils";

const SAVITSKY_MUSEUM: L.LatLngTuple = [42.4673, 59.6096];
// Demo GPS location: real cotton field NE of Kegeyli city center, Karakalpakstan
const DEMO_KEGEYLI_FIELD = { lat: 42.791200, lon: 59.614300, accuracy: 12 };
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR = "© OpenStreetMap";

interface Draft {
  lat: string;
  lon: string;
  polygon: [number, number][];
  corners: CornerPoint[];
  name: string;
  crop: CropKey | "";
  sowingDate: string;
  areaHa: string;
  soilTexture: SoilTexture | "";
  irrigationMethod: IrrigationMethod | "";
  farmerName: string;
  phoneLocal: string;
  smsLanguage: SmsLanguage;
  smsFrequency: SmsFrequency;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

const emptyDraft = (): Draft => ({
  lat: "",
  lon: "",
  polygon: [],
  corners: [],
  name: "",
  crop: "",
  sowingDate: todayIso(),
  areaHa: "",
  soilTexture: "",
  irrigationMethod: "",
  farmerName: "",
  phoneLocal: "",
  smsLanguage: "kaa",
  smsFrequency: "action",
});

const CROP_OPTIONS: CropKey[] = [
  "cotton",
  "wheat",
  "rice",
  "alfalfa",
  "maize",
  "melon",
  "vegetables",
];

const SOIL_OPTIONS: SoilTexture[] = ["sandy", "loam", "clay"];
const IRRIGATION_OPTIONS: IrrigationMethod[] = [
  "furrow",
  "drip",
  "sprinkler",
  "flood",
];
const SMS_LANG_OPTIONS: SmsLanguage[] = ["kaa", "uz", "ru"];
const SMS_FREQ_OPTIONS: SmsFrequency[] = ["action", "daily"];

function draftFromField(field: Field): Draft {
  const phone = field.phone?.startsWith("+998")
    ? field.phone.slice(4).replace(/\D/g, "")
    : "";
  const corners =
    field.polygon?.length === 4
      ? field.polygon.map(([lat, lon]) => ({ lat, lon }))
      : [];
  return {
    lat: String(field.lat),
    lon: String(field.lon),
    polygon: field.polygon ?? [],
    corners,
    name: field.name,
    crop: asCropKey(field.crop),
    sowingDate: field.sowing_date ?? todayIso(),
    areaHa: String(field.area_ha),
    soilTexture: field.soil_texture ?? "",
    irrigationMethod: field.irrigation_method ?? "",
    farmerName: field.farmer_name ?? "",
    phoneLocal: phone,
    smsLanguage: field.sms_language ?? "kaa",
    smsFrequency: field.sms_frequency ?? "action",
  };
}


function soilIcon(kind: SoilTexture) {
  if (kind === "sandy") return P.sun;
  if (kind === "loam") return P.sprout;
  return P.layers;
}

function irrigationIcon(kind: IrrigationMethod) {
  if (kind === "drip") return P.drop;
  if (kind === "sprinkler") return P.wind;
  if (kind === "flood") return P.layers;
  return P.minus;
}

function cssColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}

function WizardMap({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (updater: (d: Draft) => Draft) => void;
}) {
  const { t } = useI18n();
  const divRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [mapReady, setMapReady] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lon: number;
    accuracy: number;
  } | null>(null);

  const addMapPoint = useCallback(
    (latlng: L.LatLng) => {
      const lat = Number(latlng.lat.toFixed(6));
      const lon = Number(latlng.lng.toFixed(6));
      setDraft((d) =>
        d.corners.length < 4 ? { ...d, corners: [...d.corners, { lat, lon }] } : d,
      );
    },
    [setDraft],
  );

  const locateMe = useCallback(() => {
    setGpsError(false);
    setGpsLoading(true);
    window.setTimeout(() => {
      setGpsLoading(false);
      setGpsLocation(DEMO_KEGEYLI_FIELD);
      mapRef.current?.setView([DEMO_KEGEYLI_FIELD.lat, DEMO_KEGEYLI_FIELD.lon], 17);
    }, 800);
  }, []);

  useEffect(() => {
    let cleanupPointerListeners = () => {};
    const timer = window.setTimeout(() => {
      const div = divRef.current;
      if (!div || mapRef.current) return;
      const leafletDiv = div as HTMLDivElement & { _leaflet_id?: number };
      delete leafletDiv._leaflet_id;
      leafletDiv._leaflet_id = undefined;
      const map = L.map(div, { zoomControl: false, attributionControl: false });
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      L.control.attribution({ prefix: false }).addAttribution(TILE_ATTR).addTo(map);

      let loaded = 0;
      const failTiles = () => {
        if (mapRef.current !== map) return;
        setTilesFailed(true);
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
      const onPointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return;
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
      };
      const onPointerUp = (event: PointerEvent) => {
        if (event.button !== 0) return;
        const start = pointerStartRef.current;
        pointerStartRef.current = null;
        if (!start) return;
        const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
        if (moved > 8) return;
        const rect = div.getBoundingClientRect();
        const containerPoint = L.point(
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
        addMapPoint(map.containerPointToLatLng(containerPoint));
      };
      div.addEventListener("pointerdown", onPointerDown);
      div.addEventListener("pointerup", onPointerUp);
      cleanupPointerListeners = () => {
        div.removeEventListener("pointerdown", onPointerDown);
        div.removeEventListener("pointerup", onPointerUp);
      };
      map.setView(SAVITSKY_MUSEUM, 15);
      window.setTimeout(() => map.invalidateSize(), 0);
      setMapReady((value) => value + 1);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      cleanupPointerListeners();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [addMapPoint]);

  useEffect(() => {
    const group = layerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();
    const accent = cssColor("--accent", "#16778f");
    const brand = cssColor("--brand", "#0e3a4d");

    if (gpsLocation) {
      L.circle([gpsLocation.lat, gpsLocation.lon], {
        radius: Math.min(Math.max(gpsLocation.accuracy, 20), 250),
        color: brand,
        fillColor: brand,
        fillOpacity: 0.08,
        opacity: 0.32,
        weight: 1,
        interactive: false,
      }).addTo(group);
      L.circleMarker([gpsLocation.lat, gpsLocation.lon], {
        radius: 7,
        color: "#fff",
        fillColor: brand,
        fillOpacity: 1,
        weight: 2,
        interactive: false,
      }).addTo(group);
    }

    if (draft.corners.length === 0 && draft.polygon.length >= 3) {
      L.polygon(draft.polygon, {
        color: "#888",
        fillColor: "#888",
        fillOpacity: 0.15,
        weight: 2,
        dashArray: "4 4",
        interactive: false,
      }).addTo(group);
      map.fitBounds(L.latLngBounds(draft.polygon), { padding: [42, 42], maxZoom: 16 });
    }

    if (draft.corners.length > 0) {
      const pts = draft.corners.map((c): L.LatLngTuple => [c.lat, c.lon]);

      if (draft.corners.length === 4) {
        L.polygon(pts, {
          color: accent,
          fillColor: accent,
          fillOpacity: 0.24,
          weight: 2.5,
          interactive: false,
        }).addTo(group);
        const cen = cornersCentroid(draft.corners);
        const areaStr = cornersAreaHa(draft.corners).toFixed(2);
        L.marker([cen.lat, cen.lon], {
          icon: L.divIcon({
            className: "corner-area-label",
            html: `${areaStr} ha`,
            iconSize: undefined,
            iconAnchor: [30, 10],
          }),
          interactive: false,
        }).addTo(group);
        map.fitBounds(L.latLngBounds(pts), { padding: [42, 42], maxZoom: 16 });
      } else {
        const linePts: L.LatLngTuple[] = [...pts];
        if (draft.corners.length >= 3) linePts.push(pts[0]);
        L.polyline(linePts, {
          color: accent,
          weight: 2,
          dashArray: "6 4",
          interactive: false,
        }).addTo(group);
      }

      for (let i = 0; i < draft.corners.length; i++) {
        const c = draft.corners[i];
        L.circleMarker([c.lat, c.lon], {
          radius: 8,
          color: accent,
          fillColor: accent,
          fillOpacity: 0.9,
          weight: 2,
          interactive: false,
        }).addTo(group);
        L.marker([c.lat, c.lon], {
          icon: L.divIcon({
            className: "corner-number",
            html: String(i + 1),
            iconSize: undefined,
            iconAnchor: [6, 22],
          }),
          interactive: false,
        }).addTo(group);
      }
    }
  }, [draft.polygon, draft.corners, gpsLocation, mapReady]);

  return (
    <div className="wiz-map-panel">
      <div className="wiz-map">
        <div className="map-canvas" ref={divRef} />
        <div className="map-ctl">
          <button aria-label={t("fields.zoomIn")} onClick={() => mapRef.current?.zoomIn()}>
            <Ic d={P.plus} size={20} sw={2.2} />
          </button>
          <button aria-label={t("fields.zoomOut")} onClick={() => mapRef.current?.zoomOut()}>
            <Ic d={P.minus} size={20} sw={2.2} />
          </button>
          <button
            className={`gps-btn${gpsLoading ? " loading" : ""}`}
            aria-label={t("wizard.location.gps")}
            disabled={gpsLoading}
            onClick={locateMe}
          >
            <Ic d={P.locate} size={20} sw={1.8} />
          </button>
        </div>
        <div className={`map-help${draft.corners.length === 4 ? " done" : ""}`}>
          {draft.corners.length === 4
            ? t("wizard.location.cornersDone", { area: cornersAreaHa(draft.corners).toFixed(2) })
            : t("wizard.location.cornersTap", { n: draft.corners.length + 1 })}
        </div>
      </div>

      {tilesFailed && (
        <p className="inline-error" role="status">
          {t("wizard.location.tilesFailed")}
        </p>
      )}
      {gpsError && (
        <p className="inline-error" role="status">
          {t("fields.locateFail")}
        </p>
      )}

      <div className="card">
        <div className="corner-controls">
          <span className={`num${draft.corners.length === 4 ? " done" : ""}`}>
            {draft.corners.length === 4
              ? `✓ ${cornersAreaHa(draft.corners).toFixed(2)} ${t("common.ha")}`
              : t("wizard.location.cornersProgress", { n: draft.corners.length })}
          </span>
          <button
            className="btn sec"
            disabled={draft.corners.length === 0}
            onClick={() => setDraft((d) => ({ ...d, corners: d.corners.slice(0, -1) }))}
          >
            <Ic d={P.undo} size={18} sw={2} />
            {t("wizard.location.undo")}
          </button>
        </div>

        <button
          className="btn ghost"
          style={{ padding: 0, minHeight: 48 }}
          onClick={() => setTilesFailed(true)}
        >
          {t("wizard.location.manual")}
        </button>
        {(tilesFailed || draft.lat || draft.lon) && (
          <div className="grid-2" style={{ marginTop: 10 }}>
            <label>
              <span className="field-label">{t("wizard.location.lat")}</span>
              <input
                className="input"
                inputMode="decimal"
                value={draft.lat}
                onChange={(e) => setDraft((d) => ({ ...d, lat: e.target.value }))}
              />
            </label>
            <label>
              <span className="field-label">{t("wizard.location.lon")}</span>
              <input
                className="input"
                inputMode="decimal"
                value={draft.lon}
                onChange={(e) => setDraft((d) => ({ ...d, lon: e.target.value }))}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <div className="inline-error" role="alert">
      {children}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`select-tile${selected ? " on" : ""}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function FieldWizard() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const editMode = Boolean(id);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [res, setRes] = useState<ApiResult<FieldsResponse> | null>(
    editMode ? null : { data: { fields: [] }, stale: false, asOf: null },
  );
  const [loadError, setLoadError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateDraft = useCallback((updater: (d: Draft) => Draft) => {
    setDraft((current) => {
      const next = updater(current);
      if (next.corners !== current.corners) {
        if (next.corners.length === 4) {
          const { lat, lon } = cornersCentroid(next.corners);
          const areaHa = cornersAreaHa(next.corners);
          return {
            ...next,
            areaHa: areaHa.toFixed(2),
            lat: String(Number(lat.toFixed(6))),
            lon: String(Number(lon.toFixed(6))),
            polygon: next.corners.map((c) => [c.lat, c.lon]),
          };
        }
        return {
          ...next,
          areaHa: next.corners.length === 0 ? "" : next.areaHa,
          polygon: next.corners.length === 0 ? [] : next.polygon,
        };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!editMode) return;
    let alive = true;
    apiGet<FieldsResponse>("/fields").then((result) => {
      if (!alive) return;
      setRes(result);
      const field = result.data?.fields.find((f) => f.id === id);
      if (field) {
        setDraft(draftFromField(field));
      } else {
        setLoadError(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [editMode, id]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (draft.corners.length !== 4) e.corners = t("wizard.validation.corners");
    if (!draft.name.trim()) e.name = t("wizard.validation.name");
    if (!draft.crop) e.crop = t("wizard.validation.crop");
    if (!draft.sowingDate) e.sowingDate = t("wizard.validation.sowingDate");
    if (!(Number(draft.areaHa) > 0)) e.areaHa = t("wizard.validation.area");
    if (!draft.soilTexture) e.soilTexture = t("wizard.validation.soil");
    if (!draft.irrigationMethod) e.irrigationMethod = t("wizard.validation.irrigation");
    if (!draft.farmerName.trim()) e.farmerName = t("wizard.validation.farmer");
    if (!/^\d{9}$/.test(draft.phoneLocal)) e.phone = t("wizard.validation.phone");
    return e;
  }, [draft, t]);

  const stepValid =
    step === 1
      ? !errors.corners
      : step === 2
        ? !errors.name &&
          !errors.crop &&
          !errors.sowingDate &&
          !errors.areaHa &&
          !errors.soilTexture &&
          !errors.irrigationMethod
        : !errors.farmerName && !errors.phone;

  const payload = (): FieldPayload => {
    let polygon: [number, number][] | undefined;
    if (draft.corners.length === 4) {
      polygon = draft.corners.map((c) => [c.lat, c.lon]);
    } else if (draft.polygon.length >= 3) {
      polygon = draft.polygon;
    }
    const centroid = draft.corners.length === 4 ? cornersCentroid(draft.corners) : null;
    return {
      name: draft.name.trim(),
      crop: draft.crop || "vegetables",
      area_ha:
        draft.corners.length === 4
          ? Number(cornersAreaHa(draft.corners).toFixed(2))
          : Number(draft.areaHa),
      lat: centroid ? Number(centroid.lat.toFixed(6)) : Number(draft.lat),
      lon: centroid ? Number(centroid.lon.toFixed(6)) : Number(draft.lon),
      polygon,
      sowing_date: draft.sowingDate,
      soil_texture: draft.soilTexture || "loam",
      irrigation_method: draft.irrigationMethod || "furrow",
      farmer_name: draft.farmerName.trim(),
      phone: `+998${draft.phoneLocal}`,
      sms_language: draft.smsLanguage,
      sms_frequency: draft.smsFrequency,
    };
  };

  const save = async () => {
    if (!stepValid) return;
    const body = payload();
    const method = editMode ? "PUT" : "POST";
    const path = editMode ? `/fields/${id}` : "/fields";
    if (!navigator.onLine) {
      queueMutation(method, path, body);
      toast(t("toast.fieldQueued"));
      navigate("/fields");
      return;
    }
    try {
      await apiMutate(method, path, body);
      toast(t("toast.fieldSaved"));
    } catch {
      queueMutation(method, path, body);
      toast(t("toast.fieldQueued"));
    }
    navigate("/fields");
  };

  const deleteField = async () => {
    if (!id) return;
    const path = `/fields/${id}`;
    if (!navigator.onLine) {
      queueMutation("DELETE", path);
      toast(t("toast.fieldQueued"));
      navigate("/fields");
      return;
    }
    try {
      await apiMutate("DELETE", path);
      toast(t("toast.fieldDeleted"));
    } catch {
      queueMutation("DELETE", path);
      toast(t("toast.fieldQueued"));
    }
    navigate("/fields");
  };

  if (res === null) {
    return (
      <div className="scr">
        <div className="scroll-body">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="scr">
        <div className="center-note">
          <Ic d={P.wifi_off} size={34} color="var(--ink-3)" sw={1.6} />
          <p style={{ margin: 0 }}>{t("wizard.loadError")}</p>
          <button className="btn sec" onClick={() => navigate("/fields")}>
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <WizardFrame
        step={step}
        total={3}
        title={t(`wizard.step${step}.title`)}
        onExit={() => navigate("/fields")}
        onBack={() => {
          if (step === 1) navigate("/fields");
          else setStep((s) => s - 1);
        }}
        onNext={() => {
          if (step < 3) setStep((s) => s + 1);
          else void save();
        }}
        nextDisabled={!stepValid}
        nextLabel={step === 3 ? t("wizard.saveField") : undefined}
      >
        {step === 1 && (
          <>
            <WizardMap draft={draft} setDraft={updateDraft} />
            <ErrorText>{errors.corners}</ErrorText>
          </>
        )}

        {step === 2 && (
          <div className="form-stack">
            <label>
              <span className="field-label">{t("wizard.field.name")}</span>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => updateDraft((d) => ({ ...d, name: e.target.value }))}
              />
              <ErrorText>{errors.name}</ErrorText>
            </label>

            <div>
              <span className="field-label">{t("wizard.field.crop")}</span>
              <div className="option-grid crops">
                {CROP_OPTIONS.map((crop) => (
                  <OptionButton
                    key={crop}
                    selected={draft.crop === crop}
                    onClick={() => updateDraft((d) => ({ ...d, crop }))}
                  >
                    <CropBadge crop={crop} size={46} />
                    <span>{t(`crops.${crop}`)}</span>
                  </OptionButton>
                ))}
              </div>
              <ErrorText>{errors.crop}</ErrorText>
            </div>

            <label>
              <span className="field-label">{t("wizard.field.sowingDate")}</span>
              <input
                className="input"
                type="date"
                value={draft.sowingDate}
                onChange={(e) =>
                  updateDraft((d) => ({ ...d, sowingDate: e.target.value }))
                }
              />
              <ErrorText>{errors.sowingDate}</ErrorText>
            </label>

            <label>
              <span className="field-label">{t("wizard.field.area")}</span>
              <input
                className="input num"
                inputMode="decimal"
                value={draft.areaHa}
                onChange={(e) => updateDraft((d) => ({ ...d, areaHa: e.target.value }))}
              />
              <ErrorText>{errors.areaHa}</ErrorText>
            </label>

            <div>
              <span className="field-label">{t("wizard.field.soil")}</span>
              <div className="option-grid three">
                {SOIL_OPTIONS.map((soil) => (
                  <OptionButton
                    key={soil}
                    selected={draft.soilTexture === soil}
                    onClick={() => updateDraft((d) => ({ ...d, soilTexture: soil }))}
                  >
                    <Ic d={soilIcon(soil)} size={24} sw={1.8} />
                    <span>{t(`wizard.soil.${soil}`)}</span>
                  </OptionButton>
                ))}
              </div>
              <ErrorText>{errors.soilTexture}</ErrorText>
            </div>

            <div>
              <span className="field-label">{t("wizard.field.irrigation")}</span>
              <div className="option-grid four">
                {IRRIGATION_OPTIONS.map((method) => (
                  <OptionButton
                    key={method}
                    selected={draft.irrigationMethod === method}
                    onClick={() =>
                      updateDraft((d) => ({ ...d, irrigationMethod: method }))
                    }
                  >
                    <Ic d={irrigationIcon(method)} size={24} sw={1.8} />
                    <span>{t(`wizard.irrigation.${method}`)}</span>
                  </OptionButton>
                ))}
              </div>
              <ErrorText>{errors.irrigationMethod}</ErrorText>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-stack">
            <label>
              <span className="field-label">{t("wizard.sms.farmer")}</span>
              <input
                className="input"
                value={draft.farmerName}
                onChange={(e) =>
                  updateDraft((d) => ({ ...d, farmerName: e.target.value }))
                }
              />
              <ErrorText>{errors.farmerName}</ErrorText>
            </label>

            <label>
              <span className="field-label">{t("wizard.sms.phone")}</span>
              <div className="phone-input">
                <span className="num">+998</span>
                <input
                  inputMode="tel"
                  value={draft.phoneLocal}
                  onChange={(e) =>
                    updateDraft((d) => ({
                      ...d,
                      phoneLocal: e.target.value.replace(/\D/g, "").slice(0, 9),
                    }))
                  }
                />
              </div>
              <ErrorText>{errors.phone}</ErrorText>
            </label>

            <div>
              <span className="field-label">{t("wizard.sms.language")}</span>
              <div className="seg" role="group">
                {SMS_LANG_OPTIONS.map((lang) => (
                  <button
                    key={lang}
                    className={draft.smsLanguage === lang ? "on" : ""}
                    aria-pressed={draft.smsLanguage === lang}
                    onClick={() => updateDraft((d) => ({ ...d, smsLanguage: lang }))}
                  >
                    {t(`wizard.smsLang.${lang}`)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="field-label">{t("wizard.sms.frequency")}</span>
              <div className="radio-stack">
                {SMS_FREQ_OPTIONS.map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    className={`radio-row${draft.smsFrequency === freq ? " on" : ""}`}
                    aria-pressed={draft.smsFrequency === freq}
                    onClick={() =>
                      updateDraft((d) => ({ ...d, smsFrequency: freq }))
                    }
                  >
                    <span />
                    {t(`wizard.smsFreq.${freq}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>{t("wizard.review.title")}</h3>
              <div className="review-line">
                <span>{t("wizard.field.name")}</span>
                <strong>{draft.name || t("common.noData")}</strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.field.crop")}</span>
                <strong>{draft.crop ? t(`crops.${draft.crop}`) : t("common.noData")}</strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.field.sowingDate")}</span>
                <strong>
                  {draft.sowingDate
                    ? formatShortDate(draft.sowingDate, locale)
                    : t("common.noData")}
                </strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.field.area")}</span>
                <strong className="num">
                  {draft.areaHa || "0"} {t("common.ha")}
                </strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.field.soil")}</span>
                <strong>
                  {draft.soilTexture
                    ? t(`wizard.soil.${draft.soilTexture}`)
                    : t("common.noData")}
                </strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.field.irrigation")}</span>
                <strong>
                  {draft.irrigationMethod
                    ? t(`wizard.irrigation.${draft.irrigationMethod}`)
                    : t("common.noData")}
                </strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.sms.farmer")}</span>
                <strong>{draft.farmerName || t("common.noData")}</strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.sms.phone")}</span>
                <strong className="num">+998{draft.phoneLocal}</strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.sms.language")}</span>
                <strong>{t(`wizard.smsLang.${draft.smsLanguage}`)}</strong>
              </div>
              <div className="review-line">
                <span>{t("wizard.sms.frequency")}</span>
                <strong>{t(`wizard.smsFreq.${draft.smsFrequency}`)}</strong>
              </div>
            </div>

            {editMode && (
              <button className="btn danger" onClick={() => setConfirmDelete(true)}>
                <Ic d={P.trash} size={18} sw={2} />
                {t("wizard.deleteField")}
              </button>
            )}
          </div>
        )}
      </WizardFrame>

      <ConfirmDialog
        open={confirmDelete}
        title={t("confirm.deleteField.title")}
        body={t("confirm.deleteField.body")}
        dangerLabel={t("confirm.delete")}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void deleteField()}
      />
    </>
  );
}
