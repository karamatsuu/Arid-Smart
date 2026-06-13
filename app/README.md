# AridSmart PWA — Part 0 output (foundation & app shell)

React + TypeScript + Vite. `npm run dev` to develop, `npm run build` to ship.

This is the foundation every later part (1–5) builds on. **Do not reinvent
tokens, components, or strings — import them.**

## What exists (for Parts 1–5)

- **Tokens:** `src/styles/tokens.css` — status colors (`--ok/--warn/--bad/--na`
  + `-bg`/`-line` variants), brand, ink, radii, fonts. Component classes in
  `src/styles/base.css` (`.card`, `.btn`, `.pill`, `.chip`, `.seg`, `.input`,
  `.big-num`, `.lrow`, `.fab`, …).
- **Shared components:** import from `src/components` (barrel):
  `StatusPill, FieldCard, RecommendationHero, DepletionGauge, WeatherStrip,
  SalinityScale, Sparkline, SmsBubble, WizardFrame, BottomSheet, ConfirmDialog,
  ToastProvider/useToast, Skeleton/SkeletonCard, AppBar, TabBar,
  LanguageSwitcher, OfflineBanner, InstallHint, ErrorBoundary, CropIcon/
  CropBadge (7 crops), Ic/P (SVG icon paths), StatusIcon`.
- **i18n:** `useI18n()` → `t(key, params)`; all strings in
  `src/i18n/locales.ts` (kaa default → uz → en fallback). Add new keys to all
  four dictionaries. Never hardcode user-facing strings.
- **Data layer:** `apiGet<T>(path)` in `src/api/client.ts` implements the
  global `{stale, as_of}` contract — stale responses and network failures fall
  back to the localStorage cache and raise the app-wide amber banner
  automatically. Use it for every GET. When `VITE_API_BASE` is unset, GETs are
  served from the dev fixtures in `src/api/mock.ts` (same envelope, same
  pipeline) — add new endpoints' fixtures there. Contract types live in
  `src/api/types.ts`. Note: concurrent GETs race on the global stale flag;
  re-assert it after `Promise.all` like `Home.tsx` does. `GET /weather`
  (Home header) is an assumed endpoint, not in the handoff contract.
- **SMS math:** `smsInfo(text)` in `src/lib/sms.ts` (UCS-2 = 70 chars/segment,
  warn >2 segments) — already wired into `SmsBubble`.
- **Routes:** `/` Home and `/onboarding` are built (Part 1; first launch
  redirects `/` → `/onboarding` until the `aridsmart:onboarded` flag in
  `src/lib/firstRun.ts` is set). Placeholders to replace: `/fields` ·
  `/messages` · `/settings` (tab layout) · `/fields/new` ·
  `/fields/:id/edit` · `/fields/:id` report · `/fields/:id/salinity`
  (sub-page layout, back arrow). `/styleguide` is the Part 0 component
  gallery — keep it working.

## Hard rules (from the spec, apply to every part)

- 360×640 first; desktop is the same column stretched (max 720px).
- Status = color + icon + word, never color alone (`StatusPill` enforces this).
- Numbers are the product — biggest elements on screen.
- Tap targets ≥48px, body ≥16px, AA contrast, SVG icons only, no CDN assets.
- Every screen needs loading + offline states; never a blank screen.
- Out of scope, never build: login/profile, payments, admin dashboards,
  sensors/IoT, chat/AI UI, push-notification permission flows.
