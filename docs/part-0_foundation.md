# AridSmart — PART 0 of 6: Foundation & App Shell

> **Build order:** This is the FIRST part. Build it before any other part.
> Every other part (1–5) imports the tokens, components, and shell defined here.
> **Goal of this part:** produce the design-token layer, the navigation shell, all
> shared/reusable components, and all system overlays — so the page-parts only have
> to assemble existing pieces.

**App in one line:** AridSmart turns free satellite + weather data into a simple
irrigation schedule and soil-salinity warning for smallholder farmers in
Karakalpakstan (Aral Sea basin, Uzbekistan). Farmers receive advice by SMS on feature
phones. This installable PWA is used by agricultural cooperatives and water-user
associations to register fields, review advice, and manage SMS delivery. **Salinity is
a first-class feature, equal to irrigation.**

---

## 0.1 GLOBAL DESIGN CONSTRAINTS (apply to EVERY screen in every part)

- **Mobile-first.** Design/build at 360×640 first; tablet/desktop is a stretched single
  column or two-column layout, never a separate design. Many users are on cheap Android phones.
- **Languages:** Karakalpak (`kaa`) is the PRIMARY and default language. Uzbek (`uz`) is the
  secondary/fallback. Russian (`ru`) and English (`en`) also supported. Every screen must have a
  reachable language switcher. **No user-facing string may be hardcoded** — build with the
  longest translation in mind (Russian strings run ~30% longer than English).
- **Karakalpak script:** Latin alphabet with special characters: Á á, Ǵ ǵ, Í ı, Ń ń, Ó ó, Ú ú,
  Sh sh. Choose a font that renders these correctly (e.g. Inter, Noto Sans). Test headings with
  real `kaa` text, not lorem ipsum.
- **Low bandwidth:** no hero images, no background photos, no icon fonts loaded from CDNs.
  System fonts or one self-hosted font. **SVG icons only.** Map tiles are the only heavy asset.
- **Accessibility / outdoor use:** tap targets ≥ 48×48 px, body text ≥ 16 px, WCAG AA contrast
  minimum (design for bright sunlight — prefer near-black on white). **Status must never be
  conveyed by color alone: always color + icon + label.**
- **Numbers are the product.** Irrigation amounts, dates, and salinity values are the most
  important content on any screen — make them the largest elements, not the headings.
- **Offline-tolerant:** every screen has a defined offline state. A persistent thin banner
  appears app-wide when showing cached data: `"Offline — showing data from {date}"`. The app
  **never** shows a blank/white screen.
- **PWA:** installable; lightweight install hint (dismissible banner, not a modal).

### Status color system (used everywhere — build as tokens)

| Token | Meaning | Required pairing |
|---|---|---|
| `status-green` | OK / no action needed | color + check icon + word |
| `status-amber` | Caution / action soon | color + caution icon + word |
| `status-red` | Warning / act now | color + warning icon + word |
| `status-grey` | No data / stale data | color + dash/clock icon + word |

> Reminder: color alone is forbidden. Each status renders as **color + icon + label** everywhere.

---

## 0.2 NAVIGATION MODEL (build the shell here)

**Bottom tab bar, 4 tabs, icons + labels:**

1. **Home** (dashboard) — Part 1
2. **Fields** (map + list) — Part 2
3. **Messages** (SMS center) — Part 5
4. **Settings** — Part 5

Field Report (Part 4) and Salinity Detail (Part 5) are **sub-pages** reached from Home or
Fields — show a back arrow in a top app bar.

**Top app bar on every screen:** page title + language switcher (globe icon showing current
code, e.g. "KAA").

Deliver in this part: the tab-bar component, the top-app-bar component (with slot for title +
back arrow), and the routing skeleton with empty placeholder screens for Pages 0–7 so later
parts drop into existing routes.

---

## 0.3 SHARED COMPONENT INVENTORY (build all of these here)

Build these as reusable components; the page-parts will mirror them 1:1. The "Used in part"
column tells you who will consume each one.

| Component | Used in part(s) | Notes |
|---|---|---|
| **Status pill** | 1, 2, 4, 5 | color + icon + word, never color alone |
| **Field card** | 1 | name, crop icon, area, 2 status pills, timestamp |
| **Recommendation hero** | 4 | biggest text on screen: date + mm + m³/ha |
| **Depletion gauge** | 4 | horizontal bar + threshold marker |
| **7-day weather strip** | 4 | 7 columns, highlight irrigation day |
| **Salinity tolerance scale** | 5 | 0–16 dS/m, two markers, shaded zones |
| **Sparkline** | 4, 5 | NDVI + salinity trend |
| **SMS bubble** | 4, 5 | message text + lang badge + segment count + status |
| **Wizard frame** | 3 | progress dots, fixed Back/Next |
| **Bottom sheet** | 2 | map field summary |
| **Language switcher** | all | globe + current code, full-name menu |
| **Banner / toast / confirm dialog** | all | see system overlays below |
| **Skeleton blocks** | 1, 4, 5 | loading states |
| **Crop icon set** | 1, 2, 3, 4 | Cotton, Winter wheat, Rice, Alfalfa, Maize, Melon/gourds, Vegetables |

> Some components (hero, gauge, tolerance scale) are only *assembled* in their page-part, but
> their visual primitives, tokens, and the crop/status icon SVGs should be defined here so the
> page-parts don't reinvent them.

---

## 0.4 SYSTEM SCREENS / OVERLAYS (design once here, reused everywhere)

- **Global offline banner** (thin, amber): `"Offline — showing data from {date}"`.
- **Full error fallback** (only if the app itself fails to boot): logo, `"Something went wrong"`,
  Reload button. Localized.
- **Toast / snackbar** style for confirmations (`"Field saved"`, `"Test SMS logged"`).
- **Confirm dialog** style (used for delete field, clear cache): title, one sentence,
  danger + cancel buttons.
- **PWA install hint:** dismissible bottom banner: `"Add AridSmart to your home screen — works
  offline"` + Install / Later.

---

## 0.5 SMS CONTENT TEMPLATES (used by SMS preview/bubble in Parts 4 & 5)

Design SMS previews around these templates (engine fills numbers; values never change in
formatting). **Karakalpak Latin characters force UCS-2 encoding = 70 characters per SMS
segment** — previews must show segment count and warn at >2 segments.

- **Irrigation:** `"{Field}: suwǵarıń {date}. {nn} mm ({nnn} m³/ha). Jawın kútilmeydi."`
  (≈ "{Field}: irrigate {date}. {nn} mm. No rain expected.")
- **Salinity:** `"{Field}: shorlanıw qáwpi joqarı. Keyingi suwǵarıwda +{nn} mm qosıń."`
  (≈ "{Field}: high salinity risk. Add +{nn} mm at next irrigation.")
- **All-clear (daily-summary mode):** `"{Field}: bárí jaqsı. Keyingi tekseriw {date}."`
  (≈ "{Field}: all good. Next check {date}.")

> Treat the `kaa` strings as placeholders for now — final translations come later.
> The **SMS bubble** component must compute and display: character count, segment count
> (70 chars/segment for UCS-2), and a warning at >2 segments.

---

## 0.6 GLOBAL DATA / STALE-DATA CONTRACT (shared by all GET screens)

The FastAPI backend returns JSON; field names are final at build time, shapes are stable.
Per-page endpoints travel with their page-part. The one **global** rule:

> **Every GET may return `{stale: true, as_of: timestamp}`.** When `stale` is true, render from
> cache AND show the global offline/stale banner with `as_of` as `{date}`. This is the single
> trigger for the app-wide banner — wire it once, here, in the data layer.

---

## 0.7 OUT OF SCOPE — never build these (propagated to every part)

No login/signup/profile screens. No payments or plans. No multi-cooperative admin dashboards.
No sensor/IoT screens. No chat/AI assistant UI. No push-notification permission flows
(notifications to farmers are SMS only). If a tool generates any of these, delete them.

---

## 0.8 ACCEPTANCE CHECKLIST FOR PART 0 (done when…)

- [ ] Color tokens for green/amber/red/grey exist; each only ever used with icon + label.
- [ ] One self-hosted font renders all Karakalpak special characters (Á Ǵ Í Ń Ó Ú).
- [ ] Bottom tab bar (4 tabs) + top app bar (title, back slot, language switcher) build and route.
- [ ] Language switcher works app-wide; `kaa` is default; no hardcoded user-facing strings.
- [ ] All components in 0.3 exist as reusable, importable pieces (even if only fully assembled later).
- [ ] System overlays in 0.4 exist and are localized.
- [ ] SMS bubble computes char + segment count (70/segment) and warns at >2 segments.
- [ ] Data layer surfaces `{stale, as_of}` → global banner; no screen can render blank/white.
- [ ] Layout verified at 360×640 and as a stretched single/two-column at desktop width.
