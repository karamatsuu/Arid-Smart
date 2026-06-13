# AridSmart — PART 5 of 6: Salinity Detail + Messages + Settings

> **Depends on:** Part 0 (status pill, salinity tolerance scale, sparkline, SMS bubble, confirm
> dialog, toast, banner). Reached from Part 4 (Salinity "Details" and SMS "History") and from the
> bottom tab bar (Messages, Settings).
> **Covers:** Page 5 (Salinity Detail), Page 6 (Messages), Page 7 (Settings) — the three lighter
> remaining screens, grouped into one part.

## Foundation recap — DO NOT VIOLATE (full detail in Part 0)

- Mobile-first 360×640; `kaa` default; no hardcoded strings; render Karakalpak special chars.
- Status = **color + icon + label**, never color alone (green/amber/red/grey tokens).
- **Numbers are the product** — ECe (dS/m) is the largest element on the salinity screen.
- Tap targets ≥48×48, body ≥16px, WCAG AA, sunlight-readable. SVG icons only.
- Every screen has loading + offline states; `{stale, as_of}` → global banner; never blank/white.

---

## PAGE 5 — Salinity Detail

**Purpose:** explain the region's defining problem for one field, and what to do.

- **Status header:** big status (OK / Caution / Warning) + estimated soil salinity ECe in **dS/m**
  (largest number on screen).
- **Tolerance scale** (Part 0 Salinity tolerance scale): horizontal scale from **0–16 dS/m** with
  two markers — this field's estimated ECe and the crop's tolerance threshold (e.g. cotton 7.7 dS/m).
  Shaded zones: **safe / yield loss / severe**.
- **Yield impact line:** "At this salinity, expected yield loss: ~{nn}%" (plain sentence).
- **Leaching advice card:** when status ≥ Caution: "Apply an extra {nn} mm with the next irrigation
  to flush salts below the root zone" + a one-line caution about drainage.
- **Trend chart:** simple line of salinity estimate over the season (monthly points) — Part 0 sparkline/line.
- **How-we-know note:** collapsible "Where does this number come from?" — one short paragraph
  (satellite indices + soil maps + irrigation history), to build trust. No jargon.
- **States:** loading skeleton; **no-data state** ("Not enough satellite data yet for this field —
  first estimate expected {date}"); offline = cached + banner.

**Contract:** `GET /fields/{id}/salinity` →
`{ ece_ds_m, crop_threshold_ds_m, yield_loss_pct, leaching_mm, trend[], status }`
(`leaching_mm` drives the leaching card; show it only when `status` ≥ caution.)

---

## PAGE 6 — Messages (SMS Center)

**Purpose:** what was sent to whom, and prove the system works (also the live-demo screen).

- **Filter row:** by field (dropdown), by status (**All / Sent / Failed / Test**).
- **Message log:** reverse-chronological cards (Part 0 SMS bubble): timestamp, field name, farmer
  phone (partially masked: **+998 ●● ●●● 45 67**), language badge (**KAA/UZ/RU**), full message text,
  delivery status chip (**Sent / Failed → retried / Test-logged**). Mock-provider messages get a
  **"TEST" badge** — visually distinct so demos are honest.
- **"Send test SMS" button** (top right): small dialog — pick field, pick language, shows the
  generated text, Send. Result appears at top of log.
- **Empty state:** "No messages yet. Messages appear here when a field needs action."
- **Offline state:** log renders from cache; "Send test" disabled with explanation.

**Contract:** `GET /messages?field_id=` (log; `field_id` optional → all fields) and
`POST /messages/test` (send-test dialog; result prepends to log).

---

## PAGE 7 — Settings

**Purpose:** the few global controls. Keep it short, grouped lists.

- **Language:** app language selector (same four options as onboarding; `kaa` default).
- **Units:** irrigation amount display — **"mm" (default)** vs **"m³/ha"** (the app always shows both
  on the Field Report hero; this sets which is primary).
- **Data:** "Refresh all data now" button + per-source freshness (Weather / Satellite); cache size
  + "Clear cached data" (**confirm dialog**, Part 0).
- **About:** app version, data sources list (FAO-56 methodology, weather provider, satellite source),
  short methodology statement, contact line for the cooperative.
- **No** account, profile, login, or notification-permission sections — they don't exist in MVP.

> The Units choice here flips which unit is primary in Part 4's hero. The Language choice reuses the
> Part 0 language system (same as onboarding).

---

## OUT OF SCOPE reminder (applies to this and every part)
No login/signup/profile, no payments/plans, no admin dashboards, no sensor/IoT, no chat/AI assistant,
no push-notification permission flows (farmer notifications are SMS only). Delete any that appear.

---

## Acceptance checklist for Part 5 (done when…)

**Salinity (Page 5)**
- [ ] ECe in dS/m is the largest number; status header is color + icon + word.
- [ ] Tolerance scale 0–16 dS/m with TWO markers (field ECe + crop threshold) and safe/yield-loss/severe zones.
- [ ] Yield-loss line + leaching card (only when status ≥ Caution, driven by `leaching_mm`).
- [ ] Seasonal trend line (monthly); collapsible "Where does this number come from?".
- [ ] Loading skeleton + no-data ("first estimate expected {date}") + offline-cached states.

**Messages (Page 6)**
- [ ] Filter by field + by status (All/Sent/Failed/Test) works.
- [ ] Log cards: timestamp, field, masked phone (+998 ●● ●●● 45 67), KAA/UZ/RU badge, full text, delivery chip.
- [ ] Mock/test messages clearly carry a distinct "TEST" badge.
- [ ] "Send test SMS" dialog (field + language + generated text) prepends result to log.
- [ ] Empty + offline ("Send test" disabled) states implemented.

**Settings (Page 7)**
- [ ] Language selector (4 options, `kaa` default) drives app language.
- [ ] Units mm/m³ toggle sets the primary unit in Part 4's hero.
- [ ] Refresh-all + per-source freshness; Clear cached data → confirm dialog.
- [ ] About block lists FAO-56 + providers + methodology + contact. No account/login/notification sections.
- [ ] All three pages verified at 360×640 with `kaa` strings.
