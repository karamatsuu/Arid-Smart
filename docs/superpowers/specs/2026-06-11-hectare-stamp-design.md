# Hectare stamp — add field redesign

**Date:** 2026-06-11
**Status:** Approved

## Summary

Replace the manual polygon-drawing tool in Step 1 of the field wizard with a "hectare stamp" interaction. One 1-ha rectangle is auto-placed when the user enters the step; tapping the map or pressing "+ Add 1 ha" places additional 1-ha squares. Area auto-fills from the stamp count. The bounding box of all stamps becomes the field polygon.

## Interaction model (Step 1)

### Mode toggle
`"pin" | "stamp"` — replaces the old `"pin" | "draw"` toggle. Default for new fields: stamp.

### Layout
Split panel: map occupies the top ~60% of screen height; a control card sits below it.

### Auto-placement
On entering stamp mode, one 1-ha rectangle is placed at the current map center (Nukus default). The map renders it immediately — no tap required.

### Controls (card below the map)
| Element | Position | Behavior |
|---|---|---|
| "N ha placed" counter | left | increments / decrements with stamps |
| "+ Add 1 ha" (primary teal button) | center | places a stamp at current map center |
| "↩ Undo" (secondary button) | right | removes the most recent stamp; min 0 |

### Tap interaction
Tapping anywhere on the map places a new 1-ha stamp centered at the tap point. This is the same pointer-up mechanic already used by draw mode.

### Validation
Step 1 requires `stamps.length >= 1` to proceed. Error shown if 0 stamps.

### Visual rendering
Each stamp renders as an `L.rectangle` with the existing accent color (`--accent`), fill opacity 0.24, weight 2.5 — matching the current polygon style. A small "1 ha" label appears near the top-left corner of each rectangle.

### Edit mode
When editing an existing field, `stamps` starts empty and the existing `polygon` is shown as a read-only overlay. `areaHa` pre-fills from `field.area_ha`. The user can add stamps to replace the old polygon, or leave it unchanged and only edit fields in steps 2–3.

## Data model

### Draft interface changes
```ts
mode: "pin" | "stamp"           // was "pin" | "draw"
stamps: { lat: number; lon: number }[]  // added — centers of placed rectangles
polygon: [number, number][]     // kept for edit-mode display of legacy polygons
```

### Area auto-fill
Whenever `stamps` changes, `areaHa` is set to `String(stamps.length)`. The area field in Step 2 remains manually editable for non-integer cases.

### Polygon on save
If `stamps.length >= 1`: derive bounding-box polygon from stamps (see below) and use it as the payload polygon.
If `stamps.length === 0` (edit mode, user didn't re-stamp): use the existing `draft.polygon` unchanged.

### Polygon derivation
On save, stamps are converted to a bounding-box polygon:

```
halfLat = 50 / 111_320                              // degrees
halfLon = 50 / (111_320 × cos(lat × π / 180))       // degrees

For each stamp: 4 corners = lat ± halfLat, lon ± halfLon
Bounding box: [minLat, minLon], [minLat, maxLon], [maxLat, maxLon], [maxLat, minLon]
```

This 4-point rectangle is stored as `polygon` in the API payload.

### Centroid (lat / lon)
`lat = mean of all stamp.lat`, `lon = mean of all stamp.lon`.

## i18n strings to add

```ts
"wizard.location.stamp":     "1 ga belgisi"         // mode label
"wizard.location.stampHelp": "Kartadan atız ornın basıń"  // help text
"wizard.location.addHa":     "+ 1 ga qos"           // button
"wizard.location.haPlaced":  "{count} ga qoyıldı"   // counter
```

Existing `"wizard.location.draw"` and `"wizard.location.drawHelp"` strings are no longer used and can be removed.

## Files affected

| File | Change |
|---|---|
| `app/src/pages/FieldWizard.tsx` | Replace draw mode with stamp mode; new `WizardMap` rendering; stamp-to-polygon conversion; auto area fill |
| `app/src/i18n/locales.ts` | Add stamp strings; remove draw strings |

## Out of scope

- Dragging existing stamps to reposition them
- Non-rectangular field shapes from stamps
- Fractional-hectare stamps (0.5 ha etc.)
