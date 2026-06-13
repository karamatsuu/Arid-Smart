# 4-Corner Field Boundary + GPS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stamp (fixed 1-ha squares) interaction in the field wizard with a 4-corner sequential tap tool and add a GPS locate button to the map.

**Architecture:** User taps 4 map corners in order; dashed lines connect them live; after corner 4 a filled polygon closes and area is calculated via the Shoelace formula. A GPS icon button in the map controls fires `navigator.geolocation` and flies the map to the user's location. The stamp data model (`stamps[]`) is replaced by `corners[]` and the bounding-box polygon derivation is replaced by direct 4-point polygon export.

**Tech Stack:** React 18 + TypeScript, Leaflet (`L.circleMarker`, `L.polyline`, `L.polygon`, `L.divIcon`), Vitest, CSS custom properties

---

## File map

| Action | Path |
|---|---|
| **Create** | `app/src/lib/fieldUtils.ts` |
| **Create** | `app/src/lib/fieldUtils.test.ts` |
| **Delete** | `app/src/lib/stampUtils.ts` |
| **Delete** | `app/src/lib/stampUtils.test.ts` |
| **Modify** | `app/src/pages/FieldWizard.tsx` |
| **Modify** | `app/src/i18n/locales.ts` |
| **Modify** | `app/src/styles/base.css` |

---

### Task 1: i18n — swap stamp strings for corners strings

**Files:**
- Modify: `app/src/i18n/locales.ts`

**Context:** The file has four locale dicts (`kaa`, `uz`, `ru`, `en`) each as a plain TypeScript object. Stamp-related keys must be replaced with corners keys in all four dicts. The `wizard.location.undo` key is kept (reused for the undo button label).

- [ ] **Step 1: In `kaa` dict, remove stamp keys and add corners keys**

In `app/src/i18n/locales.ts`, in the `kaa` dict, replace these lines:
```ts
  "wizard.location.stamp": "1 ga belgisi",
  "wizard.location.stampHelp": "Kartadan atız ornın basıń",
  "wizard.location.addHa": "+ 1 ga qos",
  "wizard.location.haPlaced": "{count} ga qoyıldı",
```
with:
```ts
  "wizard.location.corners": "Burıshlarını belgile",
  "wizard.location.cornersTap": "{n}/4 burıshtı basıń",
  "wizard.location.cornersDone": "✓ {area} ga — Keyingini basıń",
  "wizard.location.cornersProgress": "{n} / 4 burısh",
  "wizard.location.gps": "Ornımdı tabıw",
```
And replace:
```ts
  "wizard.validation.stamps": "Keminde 1 ga qoyıń",
```
with:
```ts
  "wizard.validation.corners": "4 burıshtı belgileń",
```

- [ ] **Step 2: In `uz` dict, do the same**

Replace:
```ts
  "wizard.location.stamp": "1 ga belgisi",
  "wizard.location.stampHelp": "Xaritada dala joyini bosing",
  "wizard.location.addHa": "+ 1 ga qo'sh",
  "wizard.location.haPlaced": "{count} ga qo'yildi",
```
with:
```ts
  "wizard.location.corners": "Burchaklarni belgilash",
  "wizard.location.cornersTap": "{n}/4 burchakni bosing",
  "wizard.location.cornersDone": "✓ {area} ga — Keyingini bosing",
  "wizard.location.cornersProgress": "{n} / 4 burchak",
  "wizard.location.gps": "Joylashuvimni topish",
```
And replace:
```ts
  "wizard.validation.stamps": "Kamida 1 ga belgisi qo'ying",
```
with:
```ts
  "wizard.validation.corners": "4 burchakni belgilang",
```

- [ ] **Step 3: In `ru` dict, do the same**

Replace:
```ts
  "wizard.location.stamp": "Метка 1 га",
  "wizard.location.stampHelp": "Нажмите на карте, чтобы поставить метку",
  "wizard.location.addHa": "+ 1 га",
  "wizard.location.haPlaced": "{count} га отмечено",
```
with:
```ts
  "wizard.location.corners": "Отметить углы",
  "wizard.location.cornersTap": "Нажмите угол {n} из 4",
  "wizard.location.cornersDone": "✓ {area} га — нажмите Далее",
  "wizard.location.cornersProgress": "{n} / 4 угла",
  "wizard.location.gps": "Моё местоположение",
```
And replace:
```ts
  "wizard.validation.stamps": "Поставьте хотя бы 1 га-метку",
```
with:
```ts
  "wizard.validation.corners": "Отметьте все 4 угла поля",
```

- [ ] **Step 4: In `en` dict, do the same**

Replace:
```ts
  "wizard.location.stamp": "Stamp 1 ha",
  "wizard.location.stampHelp": "Tap the map to place a 1-ha stamp",
  "wizard.location.addHa": "+ Add 1 ha",
  "wizard.location.haPlaced": "{count} ha placed",
```
with:
```ts
  "wizard.location.corners": "Mark corners",
  "wizard.location.cornersTap": "Tap corner {n} of 4",
  "wizard.location.cornersDone": "✓ {area} ha — tap Next",
  "wizard.location.cornersProgress": "{n} / 4 corners",
  "wizard.location.gps": "My location",
```
And replace:
```ts
  "wizard.validation.stamps": "Place at least 1 ha stamp",
```
with:
```ts
  "wizard.validation.corners": "Place all 4 corners of your field",
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add app/src/i18n/locales.ts
git commit -m "feat: i18n — replace stamp strings with corners strings"
```

---

### Task 2: Field utility functions — cornersAreaHa + cornersCentroid

**Files:**
- Create: `app/src/lib/fieldUtils.ts`
- Create: `app/src/lib/fieldUtils.test.ts`
- Delete: `app/src/lib/stampUtils.ts`
- Delete: `app/src/lib/stampUtils.test.ts`

**Context:** `stampUtils.ts` provided stamp-rectangle math. It is entirely replaced. The Shoelace formula calculates polygon area from coordinate vertices. `cornersAreaHa` returns hectares. `cornersCentroid` returns the mean lat/lon.

- [ ] **Step 1: Write failing tests in `fieldUtils.test.ts`**

Create `app/src/lib/fieldUtils.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { cornersAreaHa, cornersCentroid } from "./fieldUtils";

describe("cornersAreaHa", () => {
  it("returns 0 for fewer than 3 corners", () => {
    expect(cornersAreaHa([])).toBe(0);
    expect(cornersAreaHa([{ lat: 42, lon: 59 }])).toBe(0);
  });

  it("~1 ha square near equator", () => {
    // 100m × 100m square at lat 0
    // 0.001° ≈ 111m at equator; use 0.0009° ≈ 100m
    const d = 100 / 111_320;
    const corners = [
      { lat: 0,  lon: 0 },
      { lat: 0,  lon: d },
      { lat: d,  lon: d },
      { lat: d,  lon: 0 },
    ];
    expect(cornersAreaHa(corners)).toBeCloseTo(1, 0);
  });

  it("~1 ha square at lat 42 (Nukus region)", () => {
    const dLat = 100 / 111_320;
    const dLon = 100 / (111_320 * Math.cos((42 * Math.PI) / 180));
    const corners = [
      { lat: 42,        lon: 59 },
      { lat: 42,        lon: 59 + dLon },
      { lat: 42 + dLat, lon: 59 + dLon },
      { lat: 42 + dLat, lon: 59 },
    ];
    expect(cornersAreaHa(corners)).toBeCloseTo(1, 0);
  });

  it("non-square quadrilateral returns positive area", () => {
    const corners = [
      { lat: 42.46, lon: 59.61 },
      { lat: 42.47, lon: 59.62 },
      { lat: 42.465, lon: 59.63 },
      { lat: 42.455, lon: 59.615 },
    ];
    expect(cornersAreaHa(corners)).toBeGreaterThan(0);
  });
});

describe("cornersCentroid", () => {
  it("throws on empty input", () => {
    expect(() => cornersCentroid([])).toThrow();
  });

  it("single corner returns itself", () => {
    const c = cornersCentroid([{ lat: 42.46, lon: 59.61 }]);
    expect(c.lat).toBeCloseTo(42.46, 6);
    expect(c.lon).toBeCloseTo(59.61, 6);
  });

  it("four corners returns mean lat/lon", () => {
    const c = cornersCentroid([
      { lat: 0, lon: 0 },
      { lat: 0, lon: 2 },
      { lat: 2, lon: 2 },
      { lat: 2, lon: 0 },
    ]);
    expect(c.lat).toBeCloseTo(1, 6);
    expect(c.lon).toBeCloseTo(1, 6);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd app && npx vitest run src/lib/fieldUtils.test.ts
```
Expected: FAIL — `Cannot find module './fieldUtils'`

- [ ] **Step 3: Create `fieldUtils.ts`**

Create `app/src/lib/fieldUtils.ts`:
```ts
export interface CornerPoint {
  lat: number;
  lon: number;
}

export function cornersAreaHa(corners: CornerPoint[]): number {
  if (corners.length < 3) return 0;
  let area = 0;
  const n = corners.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += corners[i].lat * corners[j].lon;
    area -= corners[j].lat * corners[i].lon;
  }
  area = Math.abs(area) / 2;
  const meanLat = corners.reduce((s, p) => s + p.lat, 0) / n;
  const m2 = area * 111_320 * 111_320 * Math.cos((meanLat * Math.PI) / 180);
  return m2 / 10_000;
}

export function cornersCentroid(corners: CornerPoint[]): CornerPoint {
  if (corners.length === 0) throw new Error("cornersCentroid requires at least one corner");
  const lat = corners.reduce((s, p) => s + p.lat, 0) / corners.length;
  const lon = corners.reduce((s, p) => s + p.lon, 0) / corners.length;
  return { lat, lon };
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd app && npx vitest run src/lib/fieldUtils.test.ts
```
Expected: all 7 tests pass.

- [ ] **Step 5: Delete the old stamp files**

```bash
rm app/src/lib/stampUtils.ts app/src/lib/stampUtils.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add app/src/lib/fieldUtils.ts app/src/lib/fieldUtils.test.ts
git rm app/src/lib/stampUtils.ts app/src/lib/stampUtils.test.ts
git commit -m "feat: replace stampUtils with fieldUtils (cornersAreaHa, cornersCentroid)"
```

---

### Task 3: Draft data model — stamps → corners

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx`

**Context:** `FieldWizard.tsx` currently imports from `stampUtils` and uses `stamps[]` in the `Draft` interface. This task replaces those with `corners[]` from `fieldUtils`. Tasks 4–7 will finish the rendering and logic; this task only touches the type definitions, imports, `emptyDraft`, and `draftFromField`.

- [ ] **Step 1: Update imports at the top of `FieldWizard.tsx`**

Replace lines 34–38:
```ts
import {
  stampHalfDegrees,
  stampsCentroid,
  stampsToBoundingBox,
} from "../lib/stampUtils";
```
with:
```ts
import {
  cornersAreaHa,
  cornersCentroid,
  type CornerPoint,
} from "../lib/fieldUtils";
```

- [ ] **Step 2: Update `LocationMode` type and `Draft` interface**

Replace line 44:
```ts
type LocationMode = "pin" | "stamp";
```
with:
```ts
type LocationMode = "pin" | "corners";
```

In the `Draft` interface (lines 46–62), replace:
```ts
  stamps: { lat: number; lon: number }[];
```
with:
```ts
  corners: CornerPoint[];
```

- [ ] **Step 3: Update `emptyDraft`**

Replace lines 66–82:
```ts
const emptyDraft = (): Draft => ({
  mode: "stamp",
  lat: "",
  lon: "",
  polygon: [],
  stamps: [],
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
```
with:
```ts
const emptyDraft = (): Draft => ({
  mode: "corners",
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
```

- [ ] **Step 4: Update `draftFromField`**

In `draftFromField` (lines 104–125), replace:
```ts
    mode: "stamp",
    lat: String(field.lat),
    lon: String(field.lon),
    polygon: field.polygon ?? [],
    stamps: [],
```
with:
```ts
    mode: "corners",
    lat: String(field.lat),
    lon: String(field.lon),
    polygon: field.polygon ?? [],
    corners: [],
```

- [ ] **Step 5: Verify TypeScript still compiles (expect errors from remaining stamp references — that's OK)**

```bash
cd app && npx tsc --noEmit 2>&1 | head -30
```
Expected: errors referencing `stamps` in later lines of the file. Those will be fixed in Tasks 4–7.

- [ ] **Step 6: Commit**

```bash
git add app/src/pages/FieldWizard.tsx
git commit -m "feat: Draft model — replace stamps[] with corners[], pin|stamp → pin|corners"
```

---

### Task 4: WizardMap rendering effect — draw corners

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx` (the rendering `useEffect` inside `WizardMap`, lines ~253–313)

**Context:** The rendering effect currently draws 1-ha rectangles for stamp mode. Replace it entirely with corner-mode rendering: numbered circle markers, dashed polyline connecting placed corners (closing back to corner 1 after corner 3), and a filled polygon + area label once all 4 are placed. The `map-help` banner's text and color also come from this data.

- [ ] **Step 1: Replace the rendering `useEffect` inside `WizardMap`**

Replace the entire `useEffect` that starts at line ~253 and ends at line ~313:
```ts
  useEffect(() => {
    const group = layerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();
    const accent = cssColor("--accent", "#16778f");
    const brand = cssColor("--brand", "#0e3a4d");
    const hasPin = isFiniteCoord(draft.lat, -90, 90) && isFiniteCoord(draft.lon, -180, 180);

    if (draft.mode === "stamp") {
      // ... (stamp rendering)
    } else if (hasPin) {
      // ... (pin rendering)
    }
  }, [draft.lat, draft.lon, draft.mode, draft.polygon, draft.stamps, mapReady]);
```

with:
```ts
  useEffect(() => {
    const group = layerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();
    const accent = cssColor("--accent", "#16778f");
    const brand = cssColor("--brand", "#0e3a4d");
    const hasPin = isFiniteCoord(draft.lat, -90, 90) && isFiniteCoord(draft.lon, -180, 180);

    if (draft.mode === "corners") {
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
    } else if (hasPin) {
      L.circleMarker([Number(draft.lat), Number(draft.lon)], {
        radius: 12,
        color: brand,
        fillColor: accent,
        fillOpacity: 0.75,
        weight: 3,
      }).addTo(group);
      map.setView([Number(draft.lat), Number(draft.lon)], 14);
    }
  }, [draft.lat, draft.lon, draft.mode, draft.polygon, draft.corners, mapReady]);
```

- [ ] **Step 2: Verify TypeScript compiles (still expect some errors from remaining stamp references)**

```bash
cd app && npx tsc --noEmit 2>&1 | grep -c "error" || true
```

- [ ] **Step 3: Commit**

```bash
git add app/src/pages/FieldWizard.tsx
git commit -m "feat: WizardMap — render corners with numbered markers, polyline, polygon"
```

---

### Task 5: WizardMap — addMapPoint + GPS button

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx` (the `WizardMap` function)

**Context:** `addMapPoint` currently appends to `stamps`. It must append to `corners` (ignoring taps once 4 corners are placed). The auto-stamp logic in the map init effect must be removed. A GPS locate button must be added to the map controls, with a loading spinner state.

- [ ] **Step 1: Update `addMapPoint` callback**

Replace lines ~170–181:
```ts
  const addMapPoint = useCallback(
    (latlng: L.LatLng) => {
      const lat = Number(latlng.lat.toFixed(6));
      const lon = Number(latlng.lng.toFixed(6));
      setDraft((d) =>
        d.mode === "pin"
          ? { ...d, lat: String(lat), lon: String(lon) }
          : { ...d, stamps: [...d.stamps, { lat, lon }] },
      );
    },
    [setDraft],
  );
```
with:
```ts
  const addMapPoint = useCallback(
    (latlng: L.LatLng) => {
      const lat = Number(latlng.lat.toFixed(6));
      const lon = Number(latlng.lng.toFixed(6));
      setDraft((d) =>
        d.mode === "pin"
          ? { ...d, lat: String(lat), lon: String(lon) }
          : d.corners.length < 4
            ? { ...d, corners: [...d.corners, { lat, lon }] }
            : d,
      );
    },
    [setDraft],
  );
```

- [ ] **Step 2: Add GPS state and `locateMe` callback**

After the `addMapPoint` declaration (before the map init `useEffect`), add:
```ts
  const [gpsLoading, setGpsLoading] = useState(false);

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 16);
      },
      () => {
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);
```

- [ ] **Step 3: Remove the auto-stamp block from the map init `useEffect`**

In the map init `useEffect`, remove these lines (approximately lines 237–241):
```ts
      // Auto-place one stamp at map center when entering stamp mode with no stamps yet
      setDraft((d) => {
        if (d.mode !== "stamp" || d.stamps.length > 0 || d.polygon.length > 0) return d;
        return { ...d, stamps: [{ lat: NUKUS[0], lon: NUKUS[1] }] };
      });
```

- [ ] **Step 4: Add GPS button to the map controls JSX**

In the `WizardMap` return JSX, find the `.map-ctl` div:
```tsx
        <div className="map-ctl">
          <button aria-label={t("fields.zoomIn")} onClick={() => mapRef.current?.zoomIn()}>
            <Ic d={P.plus} size={20} sw={2.2} />
          </button>
          <button aria-label={t("fields.zoomOut")} onClick={() => mapRef.current?.zoomOut()}>
            <Ic d={P.minus} size={20} sw={2.2} />
          </button>
        </div>
```
Replace with:
```tsx
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
            onClick={locateMe}
          >
            <Ic d={P.locate} size={20} sw={1.8} />
          </button>
        </div>
```

- [ ] **Step 5: Verify TypeScript compiles (some errors still expected from remaining stamp references)**

```bash
cd app && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add app/src/pages/FieldWizard.tsx
git commit -m "feat: WizardMap — corners addMapPoint, GPS locate button"
```

---

### Task 6: WizardMap card UI — corner-controls, mode toggle, banner

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx` (the JSX return of `WizardMap`)

**Context:** The card below the map has a mode toggle (`seg`) and a stamp-controls strip. The toggle label changes from "Stamp 1 ha" to "Mark corners". The stamp-controls div becomes corner-controls. The map-help banner shows context-sensitive instruction text and turns green when 4 corners are placed.

- [ ] **Step 1: Update map-help banner**

In the `WizardMap` return JSX, replace:
```tsx
        <div className="map-help">
          {draft.mode === "pin"
            ? t("wizard.location.pinHelp")
            : t("wizard.location.stampHelp")}
        </div>
```
with:
```tsx
        <div className={`map-help${draft.mode === "corners" && draft.corners.length === 4 ? " done" : ""}`}>
          {draft.mode === "pin"
            ? t("wizard.location.pinHelp")
            : draft.corners.length === 4
              ? t("wizard.location.cornersDone", { area: cornersAreaHa(draft.corners).toFixed(2) })
              : t("wizard.location.cornersTap", { n: draft.corners.length + 1 })}
        </div>
```

- [ ] **Step 2: Update mode toggle — replace stamp button with corners button**

Replace:
```tsx
          <button
            className={draft.mode === "stamp" ? "on" : ""}
            aria-pressed={draft.mode === "stamp"}
            onClick={() => setDraft((d) => ({ ...d, mode: "stamp" }))}
          >
            {t("wizard.location.stamp")}
          </button>
```
with:
```tsx
          <button
            className={draft.mode === "corners" ? "on" : ""}
            aria-pressed={draft.mode === "corners"}
            onClick={() => setDraft((d) => ({ ...d, mode: "corners" }))}
          >
            {t("wizard.location.corners")}
          </button>
```

- [ ] **Step 3: Replace stamp-controls with corner-controls**

Replace the entire stamp-controls block:
```tsx
        {draft.mode === "stamp" && (
          <div className="stamp-controls">
            <span className="num">
              {t("wizard.location.haPlaced", { count: draft.stamps.length })}
            </span>
            <button
              className="btn pri"
              onClick={() => {
                const center = mapRef.current?.getCenter();
                if (!center) return;
                setDraft((d) => ({
                  ...d,
                  stamps: [
                    ...d.stamps,
                    {
                      lat: Number(center.lat.toFixed(6)),
                      lon: Number(center.lng.toFixed(6)),
                    },
                  ],
                }));
              }}
            >
              {t("wizard.location.addHa")}
            </button>
            <button
              className="btn sec"
              disabled={draft.stamps.length === 0}
              onClick={() => setDraft((d) => ({ ...d, stamps: d.stamps.slice(0, -1) }))}
            >
              <Ic d={P.undo} size={18} sw={2} />
              {t("wizard.location.undo")}
            </button>
          </div>
        )}
```
with:
```tsx
        {draft.mode === "corners" && (
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
        )}
```

- [ ] **Step 4: Verify TypeScript compiles (expect fewer errors now)**

```bash
cd app && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add app/src/pages/FieldWizard.tsx
git commit -m "feat: WizardMap card — corner-controls, mode toggle, banner"
```

---

### Task 7: FieldWizard — updateDraft, validation, payload, error text

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx` (the `FieldWizard` component body)

**Context:** The `updateDraft` function auto-fills `areaHa` and `lat/lon` from stamp changes. It must now do the same from corners changes (only at exactly 4 corners). The `errors` memo checks `stamps.length`; update to `corners.length`. `stepValid` and `payload()` also reference stamps.

- [ ] **Step 1: Update `updateDraft`**

Replace the `updateDraft` useCallback (lines ~471–488):
```ts
  const updateDraft = useCallback((updater: (d: Draft) => Draft) => {
    setDraft((current) => {
      const next = updater(current);
      if (next.mode === "stamp" && next.stamps !== current.stamps) {
        if (next.stamps.length > 0) {
          const { lat, lon } = stampsCentroid(next.stamps);
          return {
            ...next,
            areaHa: String(next.stamps.length),
            lat: String(Number(lat.toFixed(6))),
            lon: String(Number(lon.toFixed(6))),
          };
        }
        return { ...next, areaHa: "0" };
      }
      return next;
    });
  }, []);
```
with:
```ts
  const updateDraft = useCallback((updater: (d: Draft) => Draft) => {
    setDraft((current) => {
      const next = updater(current);
      if (next.mode === "corners" && next.corners !== current.corners) {
        if (next.corners.length === 4) {
          const { lat, lon } = cornersCentroid(next.corners);
          return {
            ...next,
            areaHa: cornersAreaHa(next.corners).toFixed(2),
            lat: String(Number(lat.toFixed(6))),
            lon: String(Number(lon.toFixed(6))),
          };
        }
        return { ...next, areaHa: "0" };
      }
      return next;
    });
  }, []);
```

- [ ] **Step 2: Update `errors` useMemo**

Replace the stamp validation line inside the `errors` useMemo:
```ts
    if (draft.mode === "stamp" && draft.stamps.length < 1 && !editMode) {
      e.stamps = t("wizard.validation.stamps");
    }
```
with:
```ts
    if (draft.mode === "corners" && draft.corners.length < 4 && !editMode) {
      e.corners = t("wizard.validation.corners");
    }
```

- [ ] **Step 3: Update `stepValid`**

Replace:
```ts
    step === 1
      ? !errors.lat && !errors.lon && !errors.stamps
```
with:
```ts
    step === 1
      ? !errors.lat && !errors.lon && !errors.corners
```

- [ ] **Step 4: Update `payload()`**

Replace the polygon derivation inside `payload()`:
```ts
    let polygon: [number, number][] | undefined;
    if (draft.stamps.length >= 1) {
      polygon = stampsToBoundingBox(draft.stamps);
    } else if (draft.polygon.length >= 3) {
      polygon = draft.polygon;
    }
```
with:
```ts
    let polygon: [number, number][] | undefined;
    if (draft.corners.length === 4) {
      polygon = draft.corners.map((c) => [c.lat, c.lon] as [number, number]);
    } else if (draft.polygon.length >= 3) {
      polygon = draft.polygon;
    }
```

- [ ] **Step 5: Update error text display in step 1 JSX**

Replace:
```tsx
            <ErrorText>{errors.lat || errors.lon || errors.stamps}</ErrorText>
```
with:
```tsx
            <ErrorText>{errors.lat || errors.lon || errors.corners}</ErrorText>
```

- [ ] **Step 6: Verify TypeScript compiles with zero errors**

```bash
cd app && npx tsc --noEmit
```
Expected: **zero errors**.

- [ ] **Step 7: Run fieldUtils tests still pass**

```bash
cd app && npx vitest run src/lib/fieldUtils.test.ts
```
Expected: 7/7 pass.

- [ ] **Step 8: Commit**

```bash
git add app/src/pages/FieldWizard.tsx
git commit -m "feat: FieldWizard — updateDraft, validation, payload for corners mode"
```

---

### Task 8: CSS — corner controls, GPS button, map-help.done; remove stamp CSS

**Files:**
- Modify: `app/src/styles/base.css`

**Context:** The `.stamp-controls` and `.stamp-label` blocks (lines ~974–1003) must be replaced with `.corner-controls`, `.corner-number`, `.corner-area-label`. The `.map-ctl` block needs a `.gps-btn` extension. `.map-help.done` styles the green completion banner.

- [ ] **Step 1: Replace stamp CSS block with corner CSS**

Find and remove the stamp CSS block (lines ~974–1003):
```css
/* Stamp mode controls: counter (left) + add button (center) + undo button (right) */
.stamp-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.stamp-controls > span {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-2);
}
.stamp-controls .btn {
  flex-shrink: 0;
  padding-inline: 12px;
  min-width: 0;
}

/* Leaflet divIcon for "1 ha" label on each stamp rectangle */
.stamp-label {
  background: transparent;
  border: none;
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-1);
  white-space: nowrap;
  pointer-events: none;
  line-height: 1;
}
```

Replace with:
```css
/* Corner-placement controls: progress span (left) + undo button (right) */
.corner-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.corner-controls > span {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-2);
}
.corner-controls > span.done {
  color: #1a7a3a;
}
.corner-controls .btn {
  flex-shrink: 0;
  padding-inline: 12px;
  min-width: 0;
}

/* Leaflet divIcon: numbered label above each corner circle */
.corner-number {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 800;
  color: white;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  white-space: nowrap;
  line-height: 1;
}

/* Leaflet divIcon: area label at polygon centroid */
.corner-area-label {
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 800;
  color: var(--ink-1);
  pointer-events: none;
  white-space: nowrap;
  line-height: 1;
}
```

- [ ] **Step 2: Add GPS button styles to `.map-ctl` section**

After the `.map-ctl button:active` rule (around line ~1134), add:
```css
.map-ctl .gps-btn {
  margin-top: 4px;
}
.map-ctl .gps-btn.loading svg {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 3: Add `.map-help.done` style**

After the `.map-help` rule (around line ~957–972), add:
```css
.map-help.done {
  background: rgba(212, 237, 218, 0.96);
  color: #1a7a3a;
  border-color: #b8dacc;
}
```

- [ ] **Step 4: Verify TypeScript and build still clean**

```bash
cd app && npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add app/src/styles/base.css
git commit -m "feat: CSS — corner-controls, corner-number, corner-area-label, GPS spinner, map-help.done"
```

---

### Task 9: Build verification

**Files:** No changes — read-only verification.

**Context:** The app should be fully functional. Tests must pass, TypeScript must compile, and the UI must work end-to-end in a browser.

- [ ] **Step 1: Run TypeScript check**

```bash
cd app && npx tsc --noEmit
```
Expected: zero errors.

- [ ] **Step 2: Run fieldUtils tests**

```bash
cd app && npx vitest run src/lib/fieldUtils.test.ts
```
Expected: 7/7 pass.

- [ ] **Step 3: Start dev server and open wizard**

```bash
cd app && npm run dev
```
Navigate to `http://localhost:5173` (or whatever port is printed), then tap **Fields → + Add field**.

- [ ] **Step 4: Verify corner placement (new field)**

- Step 1 shows "Mark corners" as the selected mode toggle option.
- Banner shows "Tap corner 1 of 4".
- Tap the map 4 times — verify:
  - After each tap: a numbered teal circle appears (1, 2, 3, 4).
  - After taps 1–2: a dashed line connects them.
  - After tap 3: a dashed triangle (line closes back to corner 1).
  - After tap 4: filled teal polygon appears, area label shows (e.g. "1.23 ha"), banner turns green ("✓ 1.23 ha — tap Next").
  - Card counter shows "4 / 4 corners" in green.
  - **Next** button is enabled.

- [ ] **Step 5: Verify undo**

- Tap undo — corner 4 removed, polygon disappears, counter shows "3 / 4 corners", Next is disabled.
- Tap undo until 0 — banner shows "Tap corner 1 of 4", undo is disabled.

- [ ] **Step 6: Verify GPS button**

- Tap the GPS icon (below zoom buttons).
- Spinner animates.
- If geolocation is available: map flies to user location.
- Spinner stops after response or timeout.

- [ ] **Step 7: Verify edit mode**

Navigate to an existing field's edit URL (e.g. `/fields/f-kegeyli/edit`).
- Step 1 shows the existing field polygon as a grey dashed overlay.
- Counter shows "0 / 4 corners".
- **Next is enabled** (edit mode — no corners required).
- Tap map: can add corners; after 4, polygon replaces the grey overlay.

- [ ] **Step 8: Verify area auto-fills in Step 2**

After placing 4 corners and tapping Next:
- Step 2 "Area, ha" field is pre-filled with the calculated area (e.g. `2.45`).

- [ ] **Step 9: Check console for errors**

Open DevTools console — should be zero errors.

- [ ] **Step 10: Commit verification note**

```bash
git commit --allow-empty -m "chore: 4-corner field + GPS verified in browser"
```
