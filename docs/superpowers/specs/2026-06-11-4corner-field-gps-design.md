# 4-Corner Field Boundary + GPS — design

**Date:** 2026-06-11
**Status:** Approved

## Summary

Replace the stamp (fixed 1-ha squares) interaction in Step 1 of the field wizard with a 4-corner sequential tap tool. User taps 4 map points in order; the app draws the polygon and calculates the real area. Also adds a GPS icon button to fly the map to the user's current location.

## Interaction model (Step 1)

### Mode toggle

`"pin" | "corners"` — replaces the old `"pin" | "stamp"`. Default: corners.

### Corner placement

- Tapping the map places corners **in order: 1 → 2 → 3 → 4**.
- After each tap, a numbered circle marker (`L.circleMarker` + `L.divIcon` number overlay) appears at that point.
- Dashed lines (`L.polyline`, dashArray `"6 4"`) connect placed corners in sequence. After corner 3, the line also closes back to corner 1 as a preview.
- After corner 4: the polygon closes and fills with teal (accent color, fillOpacity 0.24, weight 2.5). The dashed lines are replaced by the solid polygon. An area label (`L.divIcon`, class `corner-area-label`) appears at the polygon centroid.
- Undo removes the last placed corner; disabled at 0 corners.
- No auto-placement on mode entry (user must tap all 4).

### Instruction banner

A strip below the map shows context-sensitive text:
- 0–3 corners: `"Tap corner {n} of 4"` where n = corners.length + 1
- 4 corners: `"✓ {area} ha — tap Next"` (green background)

### Card controls

| Element | Position | Behavior |
|---|---|---|
| Corner progress | left | `"{n} / 4 corners"` → green `"✓ {area} ha"` when n=4 |
| `↩ Undo` (secondary) | right | removes last corner; disabled at 0 |

The `+ Add 1 ha` button from stamp mode is removed. No center-add button needed — all corners come from map taps.

### GPS button

A compact icon button placed below the zoom +/− buttons in the map controls overlay.
- Tap → `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy: true, timeout: 10000 }`.
- While waiting: the GPS icon spins (CSS `animation: spin 1s linear infinite`).
- On success: `map.setView([lat, lon], 16)`. Spinner stops.
- On error/timeout: spinner stops silently (no error message; user can scroll map manually).

### Validation

Step 1 valid when `corners.length === 4` (new mode). Error shown if < 4.

Edit mode: `corners.length === 0` is valid (falls back to existing polygon).

### Visual rendering

- Corner marker: teal filled circle (`L.circleMarker`, radius 8, color accent, fillOpacity 0.9) + small numbered `L.divIcon` (class `corner-number`, text `"1"`–`"4"`) anchored above the circle.
- Connecting lines: `L.polyline`, accent color, weight 2, dashArray `"6 4"`.
- Completed polygon: `L.polygon`, accent color, fillOpacity 0.24, weight 2.5.
- Area label: `L.divIcon`, class `corner-area-label`, e.g. `"2.8 ha"`, anchored at polygon centroid.
- Edit-mode existing polygon: unchanged — grey dashed overlay.

## Data model

### Draft interface changes

```ts
type LocationMode = "pin" | "corners";              // was "pin" | "stamp"
corners: { lat: number; lon: number }[];            // replaces stamps[]
polygon: [number, number][];                        // kept for edit-mode display
```

### Area auto-fill

Whenever `corners` changes:
- If `corners.length === 4`: `areaHa = cornersAreaHa(corners).toFixed(2)`; lat/lon = centroid of corners.
- If `corners.length < 4`: `areaHa = "0"`.

### Polygon on save

- If `corners.length === 4`: polygon payload = the 4 corners in placement order.
- If `corners.length === 0` (edit mode, no re-cornering): use existing `draft.polygon`.

### Area calculation (Shoelace)

```ts
function cornersAreaHa(corners: CornerPoint[]): number {
  let area = 0;
  const n = corners.length;          // always 4 at call site
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
```

### Centroid

Mean of corner lat / corner lon (adequate for field-scale polygons).

## i18n strings

### Replace (all 4 locales)

| Old key | New key |
|---|---|
| `wizard.location.stamp` | `wizard.location.corners` |
| `wizard.location.stampHelp` | (removed — banner now shows `wizard.location.cornersTap`) |
| `wizard.location.addHa` | (removed) |
| `wizard.location.haPlaced` | `wizard.location.cornersProgress` |
| `wizard.validation.stamps` | `wizard.validation.corners` |

### New keys (all 4 locales)

```
wizard.location.corners         mode label (toggle button)
wizard.location.cornersTap      "Tap corner {n} of 4"  — banner during placement
wizard.location.cornersDone     "✓ {area} ha — tap Next" — banner when complete
wizard.location.cornersProgress "{n} / 4 corners"       — card counter
wizard.location.gps             aria-label for GPS button
wizard.validation.corners       "Place all 4 corners of your field"
```

### Translations

| Key | kaa | uz | ru | en |
|---|---|---|---|---|
| `corners` | `Burıshlarını belgile` | `Burchaklarni belgilash` | `Отметить углы` | `Mark corners` |
| `cornersTap` | `{n}/4 burıshtı basıń` | `{n}/4 burchakni bosing` | `Нажмите угол {n} из 4` | `Tap corner {n} of 4` |
| `cornersDone` | `✓ {area} ga — Keyingini basıń` | `✓ {area} ga — Keyingini bosing` | `✓ {area} га — нажмите Далее` | `✓ {area} ha — tap Next` |
| `cornersProgress` | `{n} / 4 burısh` | `{n} / 4 burchak` | `{n} / 4 угла` | `{n} / 4 corners` |
| `gps` | `Ornımdı tabıw` | `Joylashuvimni topish` | `Моё местоположение` | `My location` |
| `validation.corners` | `4 burıshtı belgileń` | `4 burchakni belgilang` | `Отметьте все 4 угла поля` | `Place all 4 corners` |

## CSS additions

```css
.corner-number {
  background: transparent; border: none;
  font-size: 11px; font-weight: 800; color: white;
  text-shadow: 0 0 3px rgba(0,0,0,.6);
  pointer-events: none; white-space: nowrap;
}
.corner-area-label {
  background: transparent; border: none;
  font-size: 13px; font-weight: 800; color: var(--ink-1);
  pointer-events: none; white-space: nowrap;
}
.gps-btn.loading svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

## Files affected

| File | Change |
|---|---|
| `app/src/lib/stampUtils.ts` | Rename → `fieldUtils.ts`; replace stamp functions with `cornersAreaHa`, `cornersCentroid` |
| `app/src/lib/stampUtils.test.ts` | Rename → `fieldUtils.test.ts`; replace tests |
| `app/src/pages/FieldWizard.tsx` | Replace stamp logic with corners; add GPS button |
| `app/src/i18n/locales.ts` | Swap stamp strings → corners strings |
| `app/src/styles/base.css` | Add corner/GPS CSS; remove stamp CSS |

## Out of scope

- Dragging corners to reposition after placement
- More than 4 corners (irregular polygons)
- GPS accuracy indicator
- Snapping corners to grid or roads
