# AridSmart — PART 4 of 6: Field Report (the core screen)

> **Depends on:** Part 0 (status pill, recommendation hero, depletion gauge, 7-day strip,
> sparkline, SMS bubble, skeleton, banner) and Part 3 (the ⋮ "Edit field" enters that wizard).
> **Covers:** Page 4 only. This is the heaviest screen in the app — it gets its own part.
> Several Part 0 components are fully *assembled* here for the first time.

## Foundation recap — DO NOT VIOLATE (full detail in Part 0)

- Mobile-first 360×640; `kaa` default; no hardcoded strings; render Karakalpak special chars.
- Status = **color + icon + label**, never color alone (green/amber/red/grey tokens).
- **Numbers are the product** — the recommendation (mm, m³/ha, date) must be the LARGEST element on screen.
- Tap targets ≥48×48, body ≥16px, WCAG AA, sunlight-readable. SVG icons only.
- **Per-card error isolation:** a card that fails shows its OWN small retry; the rest of the page
  still renders. Never a full-page failure.

---

## PAGE 4 — Field Report

**Purpose:** one field's complete advice. This is what a cooperative agronomist shows a farmer.

- **Header:** field name, crop + sowing date, area, growth stage label (e.g. "Mid-season"),
  **⋮ menu** (Edit field → Part 3, Delete field, Send SMS now).
- **Hero block — the recommendation** (largest element on screen — use Part 0 Recommendation hero):
  - If action needed: **"Irrigate on {weekday, date}"** + **"{nn} mm ({nnn} m³/ha)"** + one
    plain-language reason line ("Root zone is {nn}% depleted; no rain expected for 5 days").
  - If not: **"No irrigation needed"** + "Next check: {date}".
  - Card border/background follows status color.
- **Water balance gauge** (Part 0 Depletion gauge): horizontal bar showing root-zone depletion:
  full ↔ refill point ↔ empty, with a marker at current depletion. Label the threshold
  **"Irrigate at this point"**.
- **7-day strip** (Part 0): one column per day — weekday initial, weather icon, rain mm, ET₀ mm.
  The recommended irrigation day is highlighted.
- **Salinity summary card:** status pill + estimated ECe (dS/m) vs. crop tolerance + one-line
  advice. **"Details"** → Part 5 (Salinity Detail).
- **Crop health (NDVI) card:** sparkline of last ~8 NDVI readings + trend arrow + label
  ("Normal for this growth stage" / "Below expected — check field"). Date of last satellite pass.
- **SMS preview card** (Part 0 SMS bubble): the exact SMS text that will be sent, in the farmer's
  language, with character/segment count (e.g. "62 / 70 chars — 1 SMS"). Buttons: **"Send now"**,
  **"History"** → Part 5 Messages, filtered to this field.
- **Data freshness footer:** "Weather: {timestamp} · Satellite: {date} · Calculated: {timestamp}".
- **States:** loading = skeleton blocks per card; stale = global banner + per-card timestamps;
  error per card (failed card shows its own small retry, rest of page still renders) — never a
  full-page failure.

---

## Backend contract for this part (from handoff §7)

`GET /fields/{id}/report` → everything on this page:

```json
{
  "recommendation": { "action": "irrigate" | "none", "weekday_date": "...", "depth_mm": 0, "volume_m3_ha": 0, "reason": "...", "next_check": "..." },
  "depletion": { "current_mm": 0, "threshold_mm": 0, "total_mm": 0 },
  "forecast": [ { "date": "...", "icon": "...", "rain_mm": 0, "et0_mm": 0 } ],   // length 7
  "ndvi": [ { "date": "...", "value": 0, "expected": 0 } ],
  "salinity_summary": { "level": "ok"|"caution"|"warning", "ece_ds_m": 0, "advice": "..." },
  "sms_preview": { "text": "...", "lang": "kaa"|"uz"|"ru", "segments": 0 },
  "freshness": { "weather": "timestamp", "satellite": "date", "calculated": "timestamp" }
}
```

- **Depletion gauge** maps `current_mm` against `threshold_mm` (the "Irrigate at this point" marker) and `total_mm`.
- **7-day strip** binds to `forecast[7]`; highlight the day matching `recommendation.weekday_date`.
- **NDVI card** binds the `ndvi[]` series (value vs expected) into the sparkline + trend label.
- **SMS preview** uses `sms_preview.segments` (70 chars/segment, UCS-2) and warns at >2 segments.
- Any GET may return `{stale, as_of}` → cache + global banner + per-card timestamps.

---

## Acceptance checklist for Part 4 (done when…)

- [ ] Recommendation hero is the largest element; both `{nn} mm` and `{nnn} m³/ha` shown; border follows status.
- [ ] "Action needed" vs "No irrigation needed" branches both render with the reason / next-check line.
- [ ] Depletion gauge marks current depletion against the labeled "Irrigate at this point" threshold.
- [ ] 7-day strip shows weekday / icon / rain mm / ET₀ mm and highlights the recommended day.
- [ ] Salinity summary card → "Details" routes to Part 5; NDVI card shows sparkline + trend + last-pass date.
- [ ] SMS preview shows exact text in farmer's language + "NN / 70 chars — N SMS"; Send now + History work.
- [ ] ⋮ menu: Edit field → Part 3 (pre-filled), Delete field (confirm), Send SMS now.
- [ ] Freshness footer shows all three timestamps.
- [ ] Loading = per-card skeletons; one failed card shows its own retry while others render; no full-page failure.
- [ ] Verified at 360×640 with `kaa` strings.
