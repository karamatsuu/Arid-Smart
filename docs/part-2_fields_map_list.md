# AridSmart — PART 2 of 6: Fields (Map + List)

> **Depends on:** Part 0 (shell, status pill, bottom sheet, crop icons, skeleton, banner).
> **Covers:** Page 2 only. This part stands alone because it introduces the Leaflet map stack
> (the only heavy asset in the app). Reuse this map setup later in Part 3, Step 1.

## Foundation recap — DO NOT VIOLATE (full detail in Part 0)

- Mobile-first 360×640; `kaa` default; no hardcoded strings; render Karakalpak special chars.
- Status = **color + icon + label**, never color alone (green/amber/red/grey tokens).
- Tap targets ≥48×48 (map zoom/locate buttons must be LARGE), body ≥16px, WCAG AA, sunlight-readable.
- SVG icons only; map **tiles are the only permitted heavy asset** — no other images.
- Every screen has loading + offline states; `{stale, as_of}` → global banner; never blank/white.

---

## PAGE 2 — Fields (Map + List)

**Purpose:** see all fields geographically; entry point for adding fields.

- **Map view (default):** Leaflet map centered on Karakalpakstan (around Nukus, ~42.46N 59.61E),
  zoom to fit all field polygons. Each field drawn as a polygon **tinted by its worst status**
  (green/amber/red). Tapping a polygon opens a **bottom sheet** (Part 0 component): field name,
  crop, area, both status pills, **"Open report"** button (→ Part 4).
- **List view toggle** (segmented control top-right: **Map | List**): same fields as compact rows
  for when tiles won't load. **List is the offline fallback — build it as a first-class view,**
  not an afterthought.
- **Floating action button:** **"+ Add field"** → Part 3.
- **Map controls:** zoom buttons (large), "locate me" button. No tile-provider clutter beyond
  required attribution.
- **Empty state:** map with a pulsing hint pointing at the + button: "Tap to add your first field".
- **Offline state:** if tiles fail, **auto-switch to List view** with an explanatory one-liner.

> "Worst status" = the more severe of `irrigation_status` and `salinity_status` for the field
> (red > amber > green; grey if no data). Polygon tint uses the same status tokens as pills.

---

## Backend contract for this part (from handoff §7)

Reuses `GET /fields` (full shape in Part 1). Fields used here:

- `lat`, `lon` → map center / marker when no polygon.
- `polygon?` → drawn polygon (optional; pin-only fields have no polygon).
- `irrigation_status`, `salinity_status` → compute worst status for polygon tint + bottom-sheet pills.
- `name`, `crop`, `area_ha` → bottom sheet + list rows.
- `{stale, as_of}` may be present → render cache + global banner.

---

## Acceptance checklist for Part 2 (done when…)

- [ ] Leaflet map centers on Nukus (~42.46N, 59.61E) and zoom-fits all polygons on load.
- [ ] Each field polygon is tinted by its WORST status (color + a status label in the bottom sheet).
- [ ] Tapping a polygon opens the Part 0 bottom sheet with name, crop, area, both pills, "Open report".
- [ ] Map | List segmented toggle works; List view is fully usable on its own.
- [ ] FAB "+ Add field" routes to Part 3.
- [ ] Zoom + "locate me" controls are ≥48×48 and usable in sunlight.
- [ ] Empty state shows the pulsing hint at the + button.
- [ ] Tile failure auto-switches to List view with an explanation (offline fallback verified).
- [ ] `{stale}` shows global banner. Verified at 360×640 with `kaa` strings.
