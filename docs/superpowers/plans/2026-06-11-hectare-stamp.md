# Hectare Stamp — Field Wizard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the draw-polygon mode in Step 1 of FieldWizard with a "hectare stamp" interaction — tap or press a button to place 1 ha rectangles; the bounding box becomes the field polygon.

**Architecture:** Two files change — `locales.ts` (4 new keys per locale, 2 removed), `FieldWizard.tsx` (type changes, new WizardMap rendering branch, updated validation/payload). A new `stampUtils.ts` module holds the pure math (bounding box, centroid) so it can be unit-tested cleanly.

**Tech Stack:** React 18, Leaflet 1.x via `L.rectangle` / `L.divIcon`, Vitest for unit tests.

---

## File map

| Action | Path |
|---|---|
| Modify | `app/src/i18n/locales.ts` |
| Create | `app/src/lib/stampUtils.ts` |
| Create | `app/src/lib/stampUtils.test.ts` |
| Modify | `app/src/pages/FieldWizard.tsx` |
| Modify | `app/src/styles/base.css` |

---

## Task 1: i18n — add stamp strings, remove draw strings

**Files:**
- Modify: `app/src/i18n/locales.ts`

In all four locale objects (`kaa`, `uz`, `ru`, `en`) make the following changes. The changes are the same structure in each locale; only the translated values differ.

### kaa block (lines ~162–165)

- [ ] **Step 1: Remove draw keys from `kaa`**

Delete these two lines:
```
"wizard.location.draw": "Shegara sızıw",
"wizard.location.drawHelp": "Shegara múyeshlerin izbe-iz basıń",
```

- [ ] **Step 2: Add stamp keys to `kaa`** (insert after `"wizard.location.pin"` line)

```ts
  "wizard.location.stamp":     "1 ga belgisi",
  "wizard.location.stampHelp": "Kartadan atız ornın basıń",
  "wizard.location.addHa":     "+ 1 ga qos",
  "wizard.location.haPlaced":  "{count} ga qoyıldı",
```

- [ ] **Step 3: Add stamps validation key to `kaa`** (insert after `"wizard.validation.polygon"` line — that line will still exist but be unused; insert the new key next to it)

```ts
  "wizard.validation.stamps":  "Keminde 1 ga qoyıń",
```

### uz block (lines ~449–452)

- [ ] **Step 4: Remove draw keys from `uz`**

Delete:
```
"wizard.location.draw": "Chegara chizish",
"wizard.location.drawHelp": "Chegara burchaklarini ketma-ket bosing",
```

- [ ] **Step 5: Add stamp keys to `uz`** (after `"wizard.location.pin"` line)

```ts
  "wizard.location.stamp":     "1 ga belgisi",
  "wizard.location.stampHelp": "Xaritada dala joyini bosing",
  "wizard.location.addHa":     "+ 1 ga qo'sh",
  "wizard.location.haPlaced":  "{count} ga qo'yildi",
```

- [ ] **Step 6: Add stamps validation key to `uz`** (after `"wizard.validation.polygon"` line)

```ts
  "wizard.validation.stamps":  "Kamida 1 ga belgisi qo'ying",
```

### ru block (lines ~733–736)

- [ ] **Step 7: Remove draw keys from `ru`**

Delete:
```
"wizard.location.draw": "Нарисовать границу",
"wizard.location.drawHelp": "Нажимайте углы границы по порядку",
```

- [ ] **Step 8: Add stamp keys to `ru`** (after `"wizard.location.pin"` line)

```ts
  "wizard.location.stamp":     "Метка 1 га",
  "wizard.location.stampHelp": "Нажмите на карте, чтобы поставить метку",
  "wizard.location.addHa":     "+ 1 га",
  "wizard.location.haPlaced":  "{count} га отмечено",
```

- [ ] **Step 9: Add stamps validation key to `ru`** (after `"wizard.validation.polygon"` line)

```ts
  "wizard.validation.stamps":  "Поставьте хотя бы 1 га-метку",
```

### en block (lines ~1018–1021)

- [ ] **Step 10: Remove draw keys from `en`**

Delete:
```
"wizard.location.draw": "Draw boundary",
"wizard.location.drawHelp": "Tap boundary corners in order",
```

- [ ] **Step 11: Add stamp keys to `en`** (after `"wizard.location.pin"` line)

```ts
  "wizard.location.stamp":     "Stamp 1 ha",
  "wizard.location.stampHelp": "Tap the map to place a 1-ha stamp",
  "wizard.location.addHa":     "+ Add 1 ha",
  "wizard.location.haPlaced":  "{count} ha placed",
```

- [ ] **Step 12: Add stamps validation key to `en`** (after `"wizard.validation.polygon"` line)

```ts
  "wizard.validation.stamps":  "Place at least 1 ha stamp",
```

- [ ] **Step 13: Verify the app builds without type errors**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors about missing i18n keys (the type is `Dict = Record<string, string>` — no enum exhaustion).

---

## Task 2: Stamp math utilities (pure functions + tests)

**Files:**
- Create: `app/src/lib/stampUtils.ts`
- Create: `app/src/lib/stampUtils.test.ts`

These functions are shared between WizardMap (rendering) and FieldWizard (payload derivation).

- [ ] **Step 1: Write the failing tests**

Create `app/src/lib/stampUtils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  stampHalfDegrees,
  stampsToBoundingBox,
  stampsCentroid,
} from "./stampUtils";

describe("stampHalfDegrees", () => {
  it("at equator halfLon ≈ halfLat", () => {
    const { halfLat, halfLon } = stampHalfDegrees(0);
    expect(halfLat).toBeCloseTo(50 / 111_320, 8);
    expect(halfLon).toBeCloseTo(50 / 111_320, 8);
  });

  it("at 60° latitude halfLon is about double halfLat", () => {
    const { halfLat, halfLon } = stampHalfDegrees(60);
    expect(halfLon / halfLat).toBeCloseTo(1 / Math.cos((60 * Math.PI) / 180), 4);
  });
});

describe("stampsToBoundingBox", () => {
  it("single stamp at origin produces 4-point bounding box", () => {
    const { halfLat, halfLon } = stampHalfDegrees(0);
    const box = stampsToBoundingBox([{ lat: 0, lon: 0 }]);
    expect(box).toHaveLength(4);
    // [minLat, minLon], [minLat, maxLon], [maxLat, maxLon], [maxLat, minLon]
    expect(box[0]).toEqual([-halfLat, -halfLon]);
    expect(box[1][1]).toBeCloseTo(halfLon, 8);   // maxLon
    expect(box[2][0]).toBeCloseTo(halfLat, 8);   // maxLat
    expect(box[3][1]).toBeCloseTo(-halfLon, 8);  // minLon
  });

  it("two stamps: bounding box spans both", () => {
    const box = stampsToBoundingBox([
      { lat: 0, lon: 0 },
      { lat: 0.1, lon: 0.1 },
    ]);
    // minLat from stamp at 0, maxLat from stamp at 0.1
    const { halfLat: hl0 } = stampHalfDegrees(0);
    const { halfLat: hl1 } = stampHalfDegrees(0.1);
    expect(box[0][0]).toBeCloseTo(0 - hl0, 6);   // overall minLat
    expect(box[2][0]).toBeCloseTo(0.1 + hl1, 6); // overall maxLat
  });
});

describe("stampsCentroid", () => {
  it("single stamp returns its own lat/lon", () => {
    const c = stampsCentroid([{ lat: 42.46, lon: 59.61 }]);
    expect(c.lat).toBeCloseTo(42.46, 6);
    expect(c.lon).toBeCloseTo(59.61, 6);
  });

  it("two stamps returns the average", () => {
    const c = stampsCentroid([
      { lat: 10, lon: 20 },
      { lat: 20, lon: 40 },
    ]);
    expect(c.lat).toBeCloseTo(15, 6);
    expect(c.lon).toBeCloseTo(30, 6);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd app && npx vitest run src/lib/stampUtils.test.ts
```
Expected: FAIL — "Cannot find module './stampUtils'"

- [ ] **Step 3: Implement stampUtils.ts**

Create `app/src/lib/stampUtils.ts`:

```ts
export interface StampCenter {
  lat: number;
  lon: number;
}

export function stampHalfDegrees(lat: number): { halfLat: number; halfLon: number } {
  const halfLat = 50 / 111_320;
  const halfLon = 50 / (111_320 * Math.cos((lat * Math.PI) / 180));
  return { halfLat, halfLon };
}

export function stampsToBoundingBox(
  stamps: StampCenter[],
): [number, number][] {
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  for (const { lat, lon } of stamps) {
    const { halfLat, halfLon } = stampHalfDegrees(lat);
    minLat = Math.min(minLat, lat - halfLat);
    maxLat = Math.max(maxLat, lat + halfLat);
    minLon = Math.min(minLon, lon - halfLon);
    maxLon = Math.max(maxLon, lon + halfLon);
  }
  return [
    [minLat, minLon],
    [minLat, maxLon],
    [maxLat, maxLon],
    [maxLat, minLon],
  ];
}

export function stampsCentroid(stamps: StampCenter[]): StampCenter {
  const lat = stamps.reduce((s, p) => s + p.lat, 0) / stamps.length;
  const lon = stamps.reduce((s, p) => s + p.lon, 0) / stamps.length;
  return { lat, lon };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd app && npx vitest run src/lib/stampUtils.test.ts
```
Expected: all 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add app/src/lib/stampUtils.ts app/src/lib/stampUtils.test.ts
git commit -m "feat: add stamp math utilities (bounding box, centroid)"
```

---

## Task 3: Draft data model update

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx`

- [ ] **Step 1: Update `LocationMode` type** (line 39)

Change:
```ts
type LocationMode = "pin" | "draw";
```
To:
```ts
type LocationMode = "pin" | "stamp";
```

- [ ] **Step 2: Add `stamps` field to `Draft` interface** (after `polygon` field, ~line 45)

Change:
```ts
interface Draft {
  mode: LocationMode;
  lat: string;
  lon: string;
  polygon: [number, number][];
  name: string;
```
To:
```ts
interface Draft {
  mode: LocationMode;
  lat: string;
  lon: string;
  polygon: [number, number][];
  stamps: { lat: number; lon: number }[];
  name: string;
```

- [ ] **Step 3: Update `emptyDraft()` default values** (lines 60–75)

Change:
```ts
const emptyDraft = (): Draft => ({
  mode: "draw",
  lat: "",
  lon: "",
  polygon: [],
  name: "",
```
To:
```ts
const emptyDraft = (): Draft => ({
  mode: "stamp",
  lat: "",
  lon: "",
  polygon: [],
  stamps: [],
  name: "",
```

- [ ] **Step 4: Update `draftFromField()`** (lines 97–117)

Change (line ~102):
```ts
    mode: field.polygon && field.polygon.length >= 3 ? "draw" : "pin",
```
To:
```ts
    mode: "stamp",
```

And add `stamps: [],` after `polygon: field.polygon ?? [],`:
```ts
    polygon: field.polygon ?? [],
    stamps: [],
```

- [ ] **Step 5: Add import for stampUtils** (at the top of the file, after the last import line)

```ts
import {
  stampHalfDegrees,
  stampsCentroid,
  stampsToBoundingBox,
} from "../lib/stampUtils";
```

- [ ] **Step 6: Verify TypeScript still compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors (TypeScript will flag missing `stamps` in existing spreads — fix those: the spreading of draft in `addMapPoint` etc. will still compile because we're spreading the whole draft object `{ ...d, ... }` which keeps `stamps`).

---

## Task 4: WizardMap — rendering effect

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx`

Replace the entire rendering `useEffect` (starting at line 269, ending just before `const area = polygonAreaHa`). The new effect handles three modes: pin, stamp (with stamps), and stamp (edit — 0 stamps, existing polygon overlay).

- [ ] **Step 1: Replace the rendering useEffect**

Find the block:
```ts
  useEffect(() => {
    const group = layerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();
    const accent = cssColor("--accent", "#16778f");
    const brand = cssColor("--brand", "#0e3a4d");
    const surface = cssColor("--surface", "#ffffff");
    const hasPin = isFiniteCoord(draft.lat, -90, 90) && isFiniteCoord(draft.lon, -180, 180);
    if (draft.mode === "draw" && draft.polygon.length > 0) {
```
…all the way through to the closing `}, [draft.lat, draft.lon, draft.mode, draft.polygon, mapReady]);`

Replace the entire block with:

```ts
  useEffect(() => {
    const group = layerRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();
    const accent = cssColor("--accent", "#16778f");
    const brand = cssColor("--brand", "#0e3a4d");
    const surface = cssColor("--surface", "#ffffff");
    const hasPin = isFiniteCoord(draft.lat, -90, 90) && isFiniteCoord(draft.lon, -180, 180);

    if (draft.mode === "stamp") {
      // Edit mode: show existing polygon as a read-only grey overlay when no stamps yet
      if (draft.stamps.length === 0 && draft.polygon.length >= 3) {
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

      // Render each stamp as a 1-ha rectangle with a label
      const allCorners: L.LatLngTuple[] = [];
      for (const stamp of draft.stamps) {
        const { halfLat, halfLon } = stampHalfDegrees(stamp.lat);
        const sw: L.LatLngTuple = [stamp.lat - halfLat, stamp.lon - halfLon];
        const ne: L.LatLngTuple = [stamp.lat + halfLat, stamp.lon + halfLon];
        allCorners.push(sw, ne);
        L.rectangle([sw, ne], {
          color: accent,
          fillColor: accent,
          fillOpacity: 0.24,
          weight: 2.5,
        }).addTo(group);
        L.marker([stamp.lat + halfLat, stamp.lon - halfLon], {
          icon: L.divIcon({
            className: "stamp-label",
            html: "1 ha",
            iconSize: undefined,
            iconAnchor: [0, 14],
          }),
          interactive: false,
        }).addTo(group);
      }

      if (draft.stamps.length > 0) {
        map.fitBounds(L.latLngBounds(allCorners), { padding: [42, 42], maxZoom: 16 });
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
  }, [draft.lat, draft.lon, draft.mode, draft.polygon, draft.stamps, mapReady]);
```

- [ ] **Step 2: Remove the unused variables `area` and `pointCount`** (lines ~316–317)

Delete:
```ts
  const area = polygonAreaHa(draft.polygon);
  const pointCount = draft.polygon.length;
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```
Expected: no errors

---

## Task 5: WizardMap — addMapPoint + auto-place initial stamp

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx`

- [ ] **Step 1: Update `addMapPoint` for stamp mode**

Find the `addMapPoint` useCallback (lines ~184–201):

```ts
  const addMapPoint = useCallback(
    (latlng: L.LatLng) => {
      const point: [number, number] = [
        Number(latlng.lat.toFixed(6)),
        Number(latlng.lng.toFixed(6)),
      ];
      setDraft((d) =>
        d.mode === "pin"
          ? { ...d, lat: String(point[0]), lon: String(point[1]) }
          : {
              ...d,
              lat: String(point[0]),
              lon: String(point[1]),
              polygon: [...d.polygon, point],
            },
      );
    },
    [setDraft],
  );
```

Replace with:
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

- [ ] **Step 2: Add auto-placement of initial stamp in map init effect**

In the map init `useEffect`, after `window.setTimeout(() => map.invalidateSize(), 0);` and before `setMapReady((value) => value + 1);`, insert:

```ts
      // Auto-place one stamp at map center when entering stamp mode with no stamps yet
      setDraft((d) => {
        if (d.mode !== "stamp" || d.stamps.length > 0) return d;
        return { ...d, stamps: [{ lat: NUKUS[0], lon: NUKUS[1] }] };
      });
```

The full surrounding context after the change:
```ts
      map.setView(NUKUS, 11);
      window.setTimeout(() => map.invalidateSize(), 0);
      // Auto-place one stamp at map center when entering stamp mode with no stamps yet
      setDraft((d) => {
        if (d.mode !== "stamp" || d.stamps.length > 0) return d;
        return { ...d, stamps: [{ lat: NUKUS[0], lon: NUKUS[1] }] };
      });
      setMapReady((value) => value + 1);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```

---

## Task 6: WizardMap — replace draw card with stamp card UI

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx`

Replace the entire JSX returned by `WizardMap` (everything inside `return ( ... )`) with the version below. The key changes are:
- Mode toggle segment replaces nothing (was implicit; now explicit `pin | stamp`)
- Stamp controls card replaces draw actions card
- `map-point-count` overlay removed; `drawHelp` replaced with `stampHelp`

- [ ] **Step 1: Replace the WizardMap return JSX**

Find:
```tsx
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
        </div>
        <div className="map-help">
          {draft.mode === "pin"
            ? t("wizard.location.pinHelp")
            : t("wizard.location.drawHelp")}
        </div>
        {draft.mode === "draw" && (
          <div className="map-point-count">
            {t("wizard.location.points", { count: pointCount })}
          </div>
        )}
      </div>

      {tilesFailed && (
        <p className="inline-error" role="status">
          {t("wizard.location.tilesFailed")}
        </p>
      )}

      <div className="card">
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
        {draft.mode === "draw" && (
          <div className="review-line" style={{ marginTop: 10 }}>
            <span>{t("wizard.location.areaLive")}</span>
            <strong className="num">
              {fmtHa(area)} {t("common.ha")}
            </strong>
          </div>
        )}
        {draft.mode === "draw" && (
          <div className="wizard-map-actions">
            <button
              className="btn sec"
              disabled={draft.polygon.length === 0}
              onClick={() =>
                setDraft((d) => ({ ...d, polygon: d.polygon.slice(0, -1) }))
              }
            >
              <Ic d={P.undo} size={18} sw={2} />
              {t("wizard.location.undo")}
            </button>
            <button
              className="btn ghost"
              disabled={draft.polygon.length === 0}
              onClick={() => setDraft((d) => ({ ...d, polygon: [] }))}
            >
              <Ic d={P.trash} size={18} sw={2} />
              {t("wizard.location.clear")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
```

Replace with:
```tsx
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
        </div>
        <div className="map-help">
          {draft.mode === "pin"
            ? t("wizard.location.pinHelp")
            : t("wizard.location.stampHelp")}
        </div>
      </div>

      {tilesFailed && (
        <p className="inline-error" role="status">
          {t("wizard.location.tilesFailed")}
        </p>
      )}

      <div className="card">
        <div className="seg" role="group">
          <button
            className={draft.mode === "pin" ? "on" : ""}
            aria-pressed={draft.mode === "pin"}
            onClick={() => setDraft((d) => ({ ...d, mode: "pin" }))}
          >
            {t("wizard.location.pin")}
          </button>
          <button
            className={draft.mode === "stamp" ? "on" : ""}
            aria-pressed={draft.mode === "stamp"}
            onClick={() => setDraft((d) => ({ ...d, mode: "stamp" }))}
          >
            {t("wizard.location.stamp")}
          </button>
        </div>

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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```

---

## Task 7: FieldWizard — updateDraft, validation, payload

**Files:**
- Modify: `app/src/pages/FieldWizard.tsx`

- [ ] **Step 1: Update `updateDraft` to auto-fill area and centroid for stamp mode**

Find the `updateDraft` useCallback (lines ~458–469):

```ts
  const updateDraft = useCallback((updater: (d: Draft) => Draft) => {
    setDraft((current) => {
      const next = updater(current);
      if (next.mode === "draw" && next.polygon.length >= 3) {
        const computed = polygonAreaHa(next.polygon);
        if (!current.areaHa || current.areaHa === fmtHa(polygonAreaHa(current.polygon))) {
          return { ...next, areaHa: fmtHa(computed) };
        }
      }
      return next;
    });
  }, []);
```

Replace with:
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

- [ ] **Step 2: Update `errors` useMemo — replace polygon validation with stamps validation**

Find (lines ~493–495):
```ts
    if (draft.mode === "draw" && draft.polygon.length < 3) {
      e.polygon = t("wizard.validation.polygon");
    }
```

Replace with:
```ts
    if (draft.mode === "stamp" && draft.stamps.length < 1 && !editMode) {
      e.stamps = t("wizard.validation.stamps");
    }
```

- [ ] **Step 3: Update `stepValid` for step 1**

Find (lines ~507–510):
```ts
  const stepValid =
    step === 1
      ? !errors.lat && !errors.lon && !errors.polygon
```

Replace with:
```ts
  const stepValid =
    step === 1
      ? !errors.lat && !errors.lon && !errors.stamps
```

- [ ] **Step 4: Update `payload()` to derive bounding-box polygon from stamps**

Find the `payload` function (lines ~519–536):
```ts
  const payload = (): FieldPayload => ({
    name: draft.name.trim(),
    crop: draft.crop || "vegetables",
    area_ha: Number(draft.areaHa),
    lat: Number(draft.lat),
    lon: Number(draft.lon),
    polygon:
      draft.mode === "draw" && draft.polygon.length >= 3
        ? draft.polygon
        : undefined,
    sowing_date: draft.sowingDate,
    soil_texture: draft.soilTexture || "loam",
    irrigation_method: draft.irrigationMethod || "furrow",
    farmer_name: draft.farmerName.trim(),
    phone: `+998${draft.phoneLocal}`,
    sms_language: draft.smsLanguage,
    sms_frequency: draft.smsFrequency,
  });
```

Replace with:
```ts
  const payload = (): FieldPayload => {
    let polygon: [number, number][] | undefined;
    if (draft.stamps.length >= 1) {
      polygon = stampsToBoundingBox(draft.stamps);
    } else if (draft.polygon.length >= 3) {
      polygon = draft.polygon;
    }
    return {
      name: draft.name.trim(),
      crop: draft.crop || "vegetables",
      area_ha: Number(draft.areaHa),
      lat: Number(draft.lat),
      lon: Number(draft.lon),
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
```

- [ ] **Step 5: Update the ErrorText display in step 1**

Find (line ~624):
```tsx
            <ErrorText>{errors.lat || errors.lon || errors.polygon}</ErrorText>
```

Replace with:
```tsx
            <ErrorText>{errors.lat || errors.lon || errors.stamps}</ErrorText>
```

- [ ] **Step 6: Final TypeScript check**

```bash
cd app && npx tsc --noEmit
```
Expected: zero errors

- [ ] **Step 7: Commit**

```bash
git add app/src/pages/FieldWizard.tsx
git commit -m "feat: replace draw mode with hectare stamp in field wizard"
```

---

## Task 8: CSS — stamp-controls layout and stamp-label style

**Files:**
- Modify: `app/src/styles/base.css`

- [ ] **Step 1: Add stamp styles after the `.wizard-map-actions` block** (after line ~997)

Find the end of the `.wizard-map-actions` block:
```css
.wizard-map-actions .btn {
  min-width: 0;
  padding-inline: 10px;
}
```

Insert immediately after:
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

- [ ] **Step 2: Commit all remaining changes**

```bash
git add app/src/styles/base.css app/src/i18n/locales.ts
git commit -m "feat: add stamp-controls and stamp-label CSS; update i18n for stamp mode"
```

---

## Task 9: Manual verification (browser)

- [ ] **Step 1: Start the dev server**

```bash
cd app && npm run dev
```

- [ ] **Step 2: Verify new field flow**

Navigate to Add Field (Step 1):
- Map shows with one 1-ha teal rectangle already placed at Nukus (42.46, 59.61)
- Below the map: mode toggle shows "Pin / Stamp 1 ha" with "Stamp 1 ha" selected
- Stamp controls show: "1 ha placed" counter + "+ Add 1 ha" button + "↩ Undo" button
- Help overlay reads the `stampHelp` string
- Tapping the map adds another rectangle at the tapped point; counter increments
- "+ Add 1 ha" adds a rectangle at map center; counter increments
- "↩ Undo" removes the last rectangle; counter decrements
- Undo with 1 stamp → counter shows "0 ha placed"; undo button disabled
- Next button is disabled when 0 stamps; enabled when ≥1
- After placing stamps, Step 2 area field pre-fills with `stamps.length`

- [ ] **Step 3: Verify edit field flow**

Navigate to Edit an existing field (Step 1):
- Existing polygon is shown as a grey dashed overlay
- No stamps initially (counter shows "0 ha placed")
- `areaHa` in step 2 already pre-filled from `field.area_ha`
- User can proceed to step 2 without placing any stamps (0 stamps OK in edit mode)
- If user adds stamps, the grey overlay disappears (new stamps render), area updates

- [ ] **Step 4: Verify pin mode**

Switch to "Pin" mode via toggle:
- Map tap sets a single point (no rectangle)
- Help overlay shows pinHelp string

- [ ] **Step 5: Verify save produces correct payload**

Open browser DevTools → Network → XHR. Save a field with 3 stamps spread ~1 km apart.
- `polygon` in the payload should be a 4-point bounding box array
- `lat` / `lon` should be the mean of the 3 stamp centers
- `area_ha` should be 3
