# AridSmart — PART 1 of 6: Onboarding + Home

> **Depends on:** Part 0 (Foundation & App Shell). Import its tokens, shell, status pill,
> field card, skeleton blocks, language switcher, and system overlays — do not redefine them.
> **Covers:** Page 0 (Onboarding) and Page 1 (Home / Dashboard).

## Foundation recap — DO NOT VIOLATE (full detail in Part 0)

- Mobile-first 360×640. `kaa` default language; `uz`/`ru`/`en` supported; no hardcoded strings;
  design for Russian being ~30% longer; render Karakalpak special chars (Á Ǵ Í Ń Ó Ú).
- Status = **color + icon + label**, never color alone. Tokens: green=OK, amber=caution,
  red=warning, grey=no/stale data.
- Tap targets ≥48×48, body ≥16px, WCAG AA, sunlight-readable. **Numbers are the largest element.**
- Every screen has loading + offline states; `{stale, as_of}` → global banner; never blank/white.
- SVG icons only; no hero images / background photos / CDN icon fonts.

---

## PAGE 0 — Onboarding (first launch only)

**Purpose:** pick language, explain the app in 3 steps, get to the map fast.

- **Screen 0a — language selection.** Four large buttons, each language in its own name:
  "Qaraqalpaqsha" (preselected), "Oʻzbekcha", "Русский", "English". One tap continues.
- **Screen 0b–0d — three swipeable intro cards** (skippable), one sentence + one illustration each:
  1. "Draw your field on the map"
  2. "We calculate when and how much to irrigate from satellite and weather data"
  3. "The farmer gets the advice by SMS"
  Final card has a primary button: **"Add first field"** (→ Part 3, Add field).
- **States:** none (fully offline-capable, no data loaded).

> Illustrations must be lightweight SVG (no photos). The language chosen here sets the app
> default via the Part 0 language system.

---

## PAGE 1 — Home / Dashboard

**Purpose:** answer "which fields need action today?" in 5 seconds.

- **Today header:** date, location name, current weather strip (temp °C, rain probability %,
  wind m/s — small SVG icons, single row).
- **Action summary chips:** "{n} fields need irrigation", "{n} salinity warnings", "{n} OK".
  Tapping a chip filters the list below.
- **Field cards list** (one card per registered field) — use the **Field card** component from Part 0:
  - field name + crop icon + area in ha
  - irrigation status pill: "Irrigate {date} — {amount} mm" / "No irrigation needed until {date}"
  - salinity status pill: OK / Caution / Warning (color + icon + word)
  - last-updated timestamp
  - tap → **Field Report (Part 4)**
- **Empty state:** friendly SVG illustration + "No fields yet" + primary button **"Add a field"**
  (→ Part 3).
- **Loading state:** skeleton cards (2–3 grey blocks), never a spinner-only screen.
- **Error/offline state:** cards render from cache + the global stale-data banner. If no cache at
  all: message "Can't reach the server — check your connection" + **Retry** button.

---

## Backend contract for this part (from handoff §7)

`GET /fields` → list of:

```json
{
  "id": "...",
  "name": "...",
  "crop": "...",
  "area_ha": 0,
  "lat": 0, "lon": 0,
  "polygon": [[lat, lon], "..."],
  "irrigation_status": { "action": "irrigate" | "none", "date": "...", "depth_mm": 0, "volume_m3_ha": 0 },
  "salinity_status": { "level": "ok" | "caution" | "warning", "ece_ds_m": 0 },
  "updated_at": "timestamp"
}
```

- The action summary chips are derived by counting over this list
  (`irrigation_status.action`, `salinity_status.level`).
- Any GET may return `{stale: true, as_of}` → render cache + global banner (Part 0 rule).

---

## Acceptance checklist for Part 1 (done when…)

- [ ] Onboarding 0a preselects "Qaraqalpaqsha"; one tap sets app language and continues.
- [ ] Intro cards 0b–0d are swipeable + skippable; final card "Add first field" routes to Part 3.
- [ ] Home renders Field cards from `GET /fields`; numbers (mm, dates) are the largest text.
- [ ] Summary chips show correct counts and filter the list on tap.
- [ ] Both status pills per card use color + icon + word.
- [ ] Empty, loading (skeleton), and offline/no-cache (Retry) states all implemented.
- [ ] `{stale}` response shows the global banner with `as_of` date.
- [ ] Verified at 360×640 with `kaa` strings (longest-translation safe).
