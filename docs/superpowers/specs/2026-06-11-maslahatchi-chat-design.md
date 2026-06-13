# Maslahatchi — AI Chat Feature Design

**Date:** 2026-06-11  
**Status:** Approved for implementation

---

## Overview

Add a 5th tab "Maslahatchi" (Маслаҳатшы — Karakalpak for "advisor") to the AridSmart app. An AI-powered chat assistant that answers agronomic questions in Karakalpak. When opened from a Field Report it is automatically seeded with that field's live data. When opened from the tab bar directly it operates as a general agronomic knowledge assistant.

**Backend model:** GPT-4o or Gemini 1.5 Pro — selected by `LLM_PROVIDER=openai|gemini` env var.  
**API keys:** `OPENAI_API_KEY` or `GOOGLE_API_KEY` — server-side only, never sent to the browser.  
**Language enforcement:** system prompt engineering + few-shot examples (Option A).  
**No login required.** Single role. Same experience for agronomists and farmers.

---

## Architecture

```
┌─────────────────────────────────────────┐
│  AridSmart PWA (frontend)               │
│                                         │
│  Chat.tsx                               │
│   ├─ builds prompt context from field   │
│   └─ calls POST /api/chat               │
└────────────────┬────────────────────────┘
                 │ JSON  { messages[], fieldContext? }
                 ▼
┌─────────────────────────────────────────┐
│  /api/chat  (proxy — server-side only)  │
│                                         │
│  1. Assembles system prompt             │
│     Layer 1: identity + language lock   │
│     Layer 2: few-shot Karakalpak Q&A    │
│     Layer 3: field context (if present) │
│  2. Appends conversation history        │
│     (last 8 messages from client)       │
│  3. Calls LLM API (key never on client) │
│  4. Returns streamed text response      │
└────────────────┬────────────────────────┘
                 │
                 ▼
         GPT-4o / Gemini 1.5 Pro
```

API key is **never** sent to the browser. The proxy is the only place it lives.

**Proxy location:** The app currently has no backend. The chat proxy is introduced as a minimal Express server (`server/chat.js`) run alongside Vite in dev. For production it deploys as a single serverless function (Vercel / Netlify). Vite's `server.proxy` config forwards `POST /api/chat` to the local Express server in dev — no changes to the existing frontend API client pattern.

---

## System Prompt

The system prompt is assembled from three layers on every request. Layers 1 and 2 are static strings (bundled in the proxy). Layer 3 is injected only when `fieldContext` is present in the request body.

---

### Layer 1 — Identity + Language Lock

```
Sen "Maslahatchi" — AridSmart agronomiya kómekshisisen.

TIL QAǴIYDASI: Sen hámiyde Qaraqalpaq tilinde jawap beresen.
Paydalanıwshı qaysı tilde jazsa da — Orıssha, Ózbekshe, Inglizsha
yaki basqa tilde — sen hámiyde Qaraqalpaqsha jawap beresen.
Bul qaǵıyda ózgermeydi, istisna joq.

MINEZ-QULIQ:
- Ápiwayı, qısqa, anıq sóyle. Fermerlerde smartfon joq bolıwı
  múmkin — uzın tekstten qashan.
- Tek agronomiyanı, suwarıwdı, shor máselesin, topıraq, daqıl,
  hawa rayı sıyaqlı temalar boyınsha másláhát ber.
- Agronomiyaǵa baylanıslı bolmaǵan sorawǵa: "Kechirim, men tek
  agronomiya máselelerinde kómek bere alaman" dep qısqa jawap ber.
- Sanlar men ólshemlerdi tekstte qaldır: 55 mm, 4.2 ha, 7.7 dS/m.
- Smaylik yaki emoji qospá.
- Tekst formatlanıwın qospá (markdown bold, bullet, header joq) —
  ápiwayı tek tekst.
```

---

### Layer 2 — Few-Shot Karakalpak Examples

This is the strongest language-enforcement mechanism. Five example exchanges written entirely in Karakalpak anchor the model's output format, vocabulary, and language before any user message arrives.

```
ÚLGI SÓYLESIWLER:

Adam: Erteng suwarıw kerekpe?
Maslahatchi: Bul jerdiń suǵarıw derejesi menen baylanıslı. Eger
depletsiyanız 65-70 procentten asıp ketse, suwarıw waqtı jetedi.
Naqtı maǵluwmat ushın jer bólimi jazbın ashıń.

Adam: Пахта учун қанча сув керак?
Maslahatchi: Paxta ushın arıq (furrow) usılında 500-700 m³/ha
suwarıw talap etiledi. Topıraq qumlı bolsa azıraw, gilli bolsa
kóbirek suwarıw kerek.

Adam: Cotton salinity tolerance?
Maslahatchi: Paxta ECe 7.7 dS/m ge shekem chıdamlı. Bunnan artıq
bolsa ónim kemeyedi. 10 dS/m de ónim 25 procent kemeyedi, 16
dS/m de paxta óspes.

Adam: Shor neme úshin ziyanlı?
Maslahatchi: Shor topıraqta osmotik basım artadı — ósimlik su ala
almaydı. Daqıl soltıray baslaydı, ósiwi toqtaydı, ónim azayadı.

Adam: Ob-havo qalay?
Maslahatchi: Men real waqıt hawa rayı maǵluwmatına iye emes. Jer
bólimine baǵlı bolǵan bolsańız, hawa boljiynı appda kóre alasız.
```

**Why five examples:** Empirically, fewer than three examples let the model drift to Russian or Uzbek when the user writes in those languages. Five examples covering code-switch attempts (example 2 is in Cyrillic Uzbek, example 3 is in English) train the model to hold Karakalpak even under pressure.

---

### Layer 3 — Field Context Block

Injected **only** when `fieldContext` is present. Populated from the same data the Field Report page already fetches (`GET /fields` + `GET /fields/:id/report`).

Template (values substituted server-side from the request body):

```
HÁZIRGI JER BÓLIMI KONTEKSTI — {FIELD_NAME}:

Daqıl: {CROP}
Maydanı: {AREA_HA} ga
Egilgen kúni: {SOWING_DATE}
Topıraq túri: {SOIL_TEXTURE}
Suwarıw usılı: {IRRIGATION_METHOD}

Suwarıw jaǵdayı:
  Táwsiye: {IRRIGATION_ACTION} — {IRRIGATION_DATE}
  Kerekli suwarıw: {DEPTH_MM} mm ({VOLUME_M3HA} m³/ha)
  Depletsiyanıń kemsitiliwi: {DEPLETION_PCT}% ({CURRENT_MM}/{TOTAL_MM} mm)

Shor jaǵdayı:
  Dáreje: {SALINITY_LEVEL} ({ECE_DS_M} dS/m)

Maǵluwmat jaŋartılǵan: {UPDATED_AT}

Bul konkret jer bólimi haqqında soraw bolsa, joqarıdaǵı
maǵluwmatqa tayın. Eger soraw umumı agronomiyadán bolsa,
umumı bilimińe tayın.
```

**`fieldContext` request payload shape:**

```typescript
interface FieldContext {
  fieldName: string;
  crop: string;
  areaHa: number;
  sowingDate: string;
  soilTexture: string;
  irrigationMethod: string;
  irrigationAction: "irrigate" | "none";
  irrigationDate: string;
  depthMm: number;
  volumeM3ha: number;
  depletionPct: number;
  currentMm: number;
  totalMm: number;
  salinityLevel: "ok" | "caution" | "warning";
  eceDsM: number;
  updatedAt: string;
}
```

---

### Layer 4 — Conversation History

The client sends the last 8 messages (4 turns) as the `messages` array in the request body. The proxy appends them after the system prompt before calling the LLM. 8 messages keeps context coherent without inflating token cost.

```typescript
interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  fieldContext?: FieldContext;
}
```

---

## Prompt Assembly (pseudo-code)

```typescript
function buildSystemPrompt(fieldContext?: FieldContext): string {
  let prompt = LAYER_1_IDENTITY + "\n\n" + LAYER_2_FEW_SHOT;
  if (fieldContext) {
    prompt += "\n\n" + renderFieldContext(fieldContext);
  }
  return prompt;
}

// LLM call shape
{
  model: "gpt-4o",           // or "gemini-1.5-pro"
  messages: [
    { role: "system", content: buildSystemPrompt(req.fieldContext) },
    ...req.messages.slice(-8),   // last 8 turns
  ],
  max_tokens: 400,           // keep responses short for mobile
  temperature: 0.4,          // low — factual agronomic answers
  stream: true,
}
```

`temperature: 0.4` and `max_tokens: 400` enforce the "short, plain, mobile-readable" tone.

---

## Frontend Integration Points

### New files
- `app/src/pages/Chat.tsx` — chat page component
- `app/src/api/chat.ts` — `sendMessage(messages, fieldContext?)` → streaming response

### Modified files
- `app/src/App.tsx` — add `/chat` route
- `app/src/components/TabBar.tsx` — add 5th tab (chat icon)
- `app/src/i18n/locales.ts` — add `pages.chat`, `chat.*` keys
- `app/src/styles/base.css` — chat bubble + input styles
- `app/src/pages/FieldReport.tsx` — "Ask Maslahatchi" button that navigates to `/chat` with field context passed via location state

### Context passing

FieldReport navigates with `react-router-dom` state:

```typescript
navigate("/chat", {
  state: { fieldContext: buildFieldContext(field, report) }
});
```

Chat.tsx reads it on mount:

```typescript
const location = useLocation();
const [fieldContext, setFieldContext] = useState<FieldContext | null>(
  location.state?.fieldContext ?? null
);
```

---

## UI Summary

- **Tab name:** "Chat" (i18n key `pages.chat`) with speech-bubble icon
- **Page title:** "Maslahatchi" — "Aqılly agronomiya kómekshisi" (subtitle)
- **Context banner:** shown when `fieldContext` is set — field name + salinity tone + `✕ Clear` button
- **Suggestion chips:** 4 chips, change based on context presence
  - With context: "Suwarıw haqqında", "Shor haqqında", "SMS mátn", "Másláhát"
  - Without context: "Suwarıw waqtı", "Shor máselesi", "Daqıl kórinisi", "Hawa rayı"
- **AI bubbles:** labelled "Maslahatchi" above each
- **Offline state:** input disabled + inline message ("Internet bolǵanda jumıs isleydi")
- **Loading state:** three-dot typing indicator while streaming

---

## Testing Checklist

- [ ] User writes in Uzbek (Cyrillic) → response is Karakalpak
- [ ] User writes in English → response is Karakalpak
- [ ] User writes in Russian → response is Karakalpak
- [ ] Field context present → answer references field name and actual values
- [ ] No field context → answer is general, no hallucinated field data
- [ ] Off-topic question (weather, politics) → short Karakalpak deflection
- [ ] Offline → input disabled, no API call attempted
- [ ] Long conversation (>8 turns) → older messages dropped, context coherent
- [ ] `max_tokens: 400` respected — no wall-of-text responses
