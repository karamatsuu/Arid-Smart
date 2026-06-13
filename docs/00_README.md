# AridSmart UI Spec — split into 6 build parts

The original `UI_SPEC.md` was too large for one AI attempt. It's split here so a **coding agent**
can build one part per attempt without losing quality or drifting on styling.

## Why it's split this way (not by equal size)

Naive "cut into equal chunks" produces an inconsistent UI: each attempt reinvents the buttons,
status pills, and colors because it can't see the others. Instead, **Part 0 is a shared
foundation** (tokens + shell + components + overlays). Every later part imports it and carries a
condensed "do-not-violate" recap so a single attempt can't drift even if Part 0 falls out of context.

## Build order & dependencies

| Order | File | Covers | Depends on |
|---|---|---|---|
| 1 | `part-0_foundation.md` | Global constraints, nav shell, all shared components, system overlays, SMS templates, stale-data contract | — (build first) |
| 2 | `part-1_onboarding_home.md` | Page 0 Onboarding, Page 1 Home | Part 0 |
| 3 | `part-2_fields_map_list.md` | Page 2 Fields (Leaflet map + list) | Part 0 |
| 4 | `part-3_add_edit_wizard.md` | Page 3 Add/Edit 3-step wizard | Part 0, Part 2 (map stack) |
| 5 | `part-4_field_report.md` | Page 4 Field Report (core, heaviest) | Part 0, Part 3 (edit entry) |
| 6 | `part-5_salinity_messages_settings.md` | Page 5 Salinity, Page 6 Messages, Page 7 Settings | Part 0, Part 4 (entry points) |

```
Part 0 ──┬──> Part 1
         ├──> Part 2 ──> Part 3 ──> Part 4 ──> Part 5
         └──────────────────────────^ (Part 4 also reachable from Part 1 & 2)
```

**Strict rule: build Part 0 first.** Parts 1–5 can otherwise be built in any order, but the
dependency column shows the cleanest sequence (2 before 3 because the wizard reuses the map; 3
before 4 because Field Report's ⋮ menu opens the wizard; 4 before 5 because Salinity/Messages are
reached from the report).

## How to feed each part to a coding agent

1. Start a fresh attempt with **`part-0_foundation.md`**. Have it produce the token layer, the
   nav shell, and the shared components as importable pieces.
2. For each later part, give the agent **that part's file** and tell it Part 0's output already
   exists (point it at the generated tokens/components). The "Foundation recap" block at the top of
   each file is the safety net if the agent can't see Part 0's code.
3. Check the **acceptance checklist** at the bottom of each file before moving on — those are the
   "done when" gates, including every required state (loading / empty / offline / error).

## Global rules every part repeats (the anti-drift core)

- Mobile-first 360×640; `kaa` is default language, `uz`/`ru`/`en` supported, **no hardcoded strings**.
- Status = **color + icon + label**, never color alone (green=OK, amber=caution, red=warning, grey=no/stale data).
- **Numbers are the product** — irrigation amounts, dates, salinity values are the largest elements.
- Tap targets ≥48×48, body ≥16px, WCAG AA, sunlight-readable; **SVG icons only**, no photos/CDN fonts (map tiles are the only heavy asset).
- Every screen has loading + offline states; any GET returning `{stale, as_of}` triggers the global banner; never a blank/white screen.

## Out of scope (in every part — delete if generated)

No login/signup/profile, no payments/plans, no multi-cooperative admin dashboards, no sensor/IoT,
no chat/AI assistant UI, no push-notification permission flows (farmer notifications are SMS only).

## Coverage map (nothing from the original was dropped)

- Original §1 Global constraints → Part 0 (§0.1)
- Original §2 Navigation model → Part 0 (§0.2)
- Original §3 Pages 0–1 → Part 1 · Page 2 → Part 2 · Page 3 → Part 3 · Page 4 → Part 4 · Pages 5–7 → Part 5
- Original §3 System screens/overlays → Part 0 (§0.4)
- Original §4 Component inventory → Part 0 (§0.3)
- Original §5 SMS content → Part 0 (§0.5), consumed by Parts 4 & 5
- Original §6 Out of scope → Part 0 (§0.7) + repeated in Part 5
- Original §7 Handoff contract → global rule in Part 0 (§0.6); each endpoint placed with its page-part
