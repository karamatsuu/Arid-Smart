# Maslahatchi Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 5th "Maslahatchi" tab with an AI chat assistant that answers agronomic questions in Karakalpak, with optional field-context injection when opened from a Field Report.

**Architecture:** A minimal Express proxy server (`server/`) sits between the PWA and the LLM API, assembling a multi-layer Karakalpak system prompt server-side so API keys never reach the browser. The frontend streams responses via SSE. Field context is passed as optional JSON in the POST body.

**Tech Stack:** Node.js + Express (proxy), OpenAI SDK or `@google/generative-ai` (LLM), React + TypeScript (frontend), Vitest (frontend tests), Node built-in `node:test` (server tests).

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `server/package.json` | Server dependencies |
| Create | `server/.env.example` | Env var documentation |
| Create | `server/prompt.js` | System prompt layers 1-3 + assembly |
| Create | `server/prompt.test.js` | Unit tests for prompt assembly |
| Create | `server/chat.js` | Express proxy — POST /api/chat |
| Modify | `app/vite.config.ts` | Add `/api/chat` dev proxy |
| Modify | `app/package.json` | Add vitest + dev scripts |
| Modify | `app/src/components/icons.tsx` | Add `P.bot` icon path |
| Modify | `app/src/i18n/locales.ts` | Add `tabs.chat`, `pages.chat`, `chat.*` keys |
| Modify | `app/src/styles/base.css` | Chat bubble + layout styles |
| Create | `app/src/api/chat.ts` | `FieldContext`, `buildFieldContext`, `sendChatMessage` |
| Create | `app/src/api/chat.test.ts` | Unit tests for `buildFieldContext` |
| Create | `app/src/pages/Chat.tsx` | Chat page component |
| Modify | `app/src/components/TabBar.tsx` | Add 5th chat tab |
| Modify | `app/src/App.tsx` | Add `/chat` route |
| Modify | `app/src/pages/FieldReport.tsx` | Add "Ask Maslahatchi" button |

---

## Task 1: Server scaffold

**Files:**
- Create: `server/package.json`
- Create: `server/.env.example`

- [ ] **Step 1: Create `server/package.json`**

```json
{
  "name": "aridsmart-chat-server",
  "version": "1.0.0",
  "type": "commonjs",
  "main": "chat.js",
  "scripts": {
    "start": "node chat.js",
    "test": "node --test prompt.test.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "openai": "^4.52.0",
    "@google/generative-ai": "^0.18.0"
  }
}
```

- [ ] **Step 2: Create `server/.env.example`**

```
# Copy to .env and fill in your values
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
CHAT_PORT=3001
```

- [ ] **Step 3: Add `server/.env` to `.gitignore`**

Open the root `.gitignore` (create it if it doesn't exist) and add:

```
server/.env
.superpowers/
```

- [ ] **Step 4: Install server dependencies**

```bash
cd server && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 5: Commit**

```bash
git add server/package.json server/package-lock.json server/.env.example .gitignore
git commit -m "feat: add chat server scaffold and dependencies"
```

---

## Task 2: System prompt module + tests

**Files:**
- Create: `server/prompt.js`
- Create: `server/prompt.test.js`

- [ ] **Step 1: Create `server/prompt.js`**

```javascript
'use strict';

const LAYER_1 = `Sen "Maslahatchi" — AridSmart agronomiya kómekshisisen.

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
  ápiwayı tek tekst.`;

const LAYER_2 = `ÚLGI SÓYLESIWLER:

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
bólimine baǵlı bolǵan bolsańız, hawa boljiynı appda kóre alasız.`;

const LAYER_3_TEMPLATE = `HÁZIRGI JER BÓLIMI KONTEKSTI — {FIELD_NAME}:

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
umumı bilimińe tayın.`;

function renderFieldContext(ctx) {
  return LAYER_3_TEMPLATE
    .replace('{FIELD_NAME}', ctx.fieldName)
    .replace('{CROP}', ctx.crop)
    .replace('{AREA_HA}', String(ctx.areaHa))
    .replace('{SOWING_DATE}', ctx.sowingDate)
    .replace('{SOIL_TEXTURE}', ctx.soilTexture)
    .replace('{IRRIGATION_METHOD}', ctx.irrigationMethod)
    .replace('{IRRIGATION_ACTION}', ctx.irrigationAction)
    .replace('{IRRIGATION_DATE}', ctx.irrigationDate)
    .replace('{DEPTH_MM}', String(ctx.depthMm))
    .replace('{VOLUME_M3HA}', String(ctx.volumeM3ha))
    .replace('{DEPLETION_PCT}', String(ctx.depletionPct))
    .replace('{CURRENT_MM}', String(ctx.currentMm))
    .replace('{TOTAL_MM}', String(ctx.totalMm))
    .replace('{SALINITY_LEVEL}', ctx.salinityLevel)
    .replace('{ECE_DS_M}', String(ctx.eceDsM))
    .replace('{UPDATED_AT}', ctx.updatedAt);
}

function buildSystemPrompt(fieldContext) {
  const parts = [LAYER_1, LAYER_2];
  if (fieldContext) parts.push(renderFieldContext(fieldContext));
  return parts.join('\n\n');
}

module.exports = { buildSystemPrompt, renderFieldContext, LAYER_1, LAYER_2 };
```

- [ ] **Step 2: Create `server/prompt.test.js`**

```javascript
'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildSystemPrompt, renderFieldContext, LAYER_1, LAYER_2 } = require('./prompt');

const SAMPLE_CTX = {
  fieldName: 'Kegeyli paxta',
  crop: 'cotton',
  areaHa: 4.2,
  sowingDate: '2026-04-04',
  soilTexture: 'loam',
  irrigationMethod: 'furrow',
  irrigationAction: 'irrigate',
  irrigationDate: '2026-06-12',
  depthMm: 55,
  volumeM3ha: 550,
  depletionPct: 68,
  currentMm: 68,
  totalMm: 100,
  salinityLevel: 'caution',
  eceDsM: 4.1,
  updatedAt: '2026-06-11T06:40:00Z',
};

test('buildSystemPrompt without context includes layers 1 and 2 only', () => {
  const prompt = buildSystemPrompt(undefined);
  assert.ok(prompt.includes('Maslahatchi'), 'should include persona name');
  assert.ok(prompt.includes('ÚLGI SÓYLESIWLER'), 'should include few-shot examples');
  assert.ok(!prompt.includes('HÁZIRGI JER BÓLIMI'), 'should not include field context');
});

test('buildSystemPrompt with context includes all three layers', () => {
  const prompt = buildSystemPrompt(SAMPLE_CTX);
  assert.ok(prompt.includes(LAYER_1), 'should include layer 1');
  assert.ok(prompt.includes(LAYER_2), 'should include layer 2');
  assert.ok(prompt.includes('HÁZIRGI JER BÓLIMI KONTEKSTI'), 'should include layer 3 header');
  assert.ok(prompt.includes('Kegeyli paxta'), 'should include field name');
});

test('renderFieldContext substitutes all placeholders', () => {
  const rendered = renderFieldContext(SAMPLE_CTX);
  assert.ok(!rendered.includes('{FIELD_NAME}'), 'FIELD_NAME placeholder must be replaced');
  assert.ok(!rendered.includes('{CROP}'), 'CROP placeholder must be replaced');
  assert.ok(!rendered.includes('{AREA_HA}'), 'AREA_HA placeholder must be replaced');
  assert.ok(!rendered.includes('{SOWING_DATE}'), 'SOWING_DATE placeholder must be replaced');
  assert.ok(!rendered.includes('{SOIL_TEXTURE}'), 'SOIL_TEXTURE placeholder must be replaced');
  assert.ok(!rendered.includes('{IRRIGATION_METHOD}'), 'IRRIGATION_METHOD placeholder must be replaced');
  assert.ok(!rendered.includes('{IRRIGATION_ACTION}'), 'IRRIGATION_ACTION placeholder must be replaced');
  assert.ok(!rendered.includes('{IRRIGATION_DATE}'), 'IRRIGATION_DATE placeholder must be replaced');
  assert.ok(!rendered.includes('{DEPTH_MM}'), 'DEPTH_MM placeholder must be replaced');
  assert.ok(!rendered.includes('{VOLUME_M3HA}'), 'VOLUME_M3HA placeholder must be replaced');
  assert.ok(!rendered.includes('{DEPLETION_PCT}'), 'DEPLETION_PCT placeholder must be replaced');
  assert.ok(!rendered.includes('{CURRENT_MM}'), 'CURRENT_MM placeholder must be replaced');
  assert.ok(!rendered.includes('{TOTAL_MM}'), 'TOTAL_MM placeholder must be replaced');
  assert.ok(!rendered.includes('{SALINITY_LEVEL}'), 'SALINITY_LEVEL placeholder must be replaced');
  assert.ok(!rendered.includes('{ECE_DS_M}'), 'ECE_DS_M placeholder must be replaced');
  assert.ok(!rendered.includes('{UPDATED_AT}'), 'UPDATED_AT placeholder must be replaced');
  assert.ok(rendered.includes('4.2'), 'should include area value');
  assert.ok(rendered.includes('4.1'), 'should include ECe value');
  assert.ok(rendered.includes('caution'), 'should include salinity level');
});

test('system prompt always begins with language lock', () => {
  const prompt = buildSystemPrompt(undefined);
  assert.ok(
    prompt.startsWith('Sen "Maslahatchi"'),
    'prompt must open with identity statement'
  );
});
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
cd server && npm test
```

Expected output: 4 passing tests, no failures.

- [ ] **Step 4: Commit**

```bash
git add server/prompt.js server/prompt.test.js
git commit -m "feat: add Maslahatchi system prompt module with tests"
```

---

## Task 3: Chat proxy server

**Files:**
- Create: `server/chat.js`

- [ ] **Step 1: Create `server/chat.js`**

```javascript
'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { buildSystemPrompt } = require('./prompt');

const app = express();
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));

const PORT = process.env.CHAT_PORT || 3001;
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';

async function streamOpenAI(systemPrompt, messages, res) {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-8),
    ],
    max_tokens: 400,
    temperature: 0.4,
    stream: true,
  });
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? '';
    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

async function streamGemini(systemPrompt, messages, res) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
  });
  const history = messages.slice(-8, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
  const chat = model.startChat({ history });
  const lastMsg = messages[messages.length - 1]?.content ?? '';
  const result = await chat.sendMessageStream(lastMsg);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

app.post('/api/chat', async (req, res) => {
  const { messages, fieldContext } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }
  const systemPrompt = buildSystemPrompt(fieldContext ?? undefined);
  try {
    if (LLM_PROVIDER === 'gemini') {
      await streamGemini(systemPrompt, messages, res);
    } else {
      await streamOpenAI(systemPrompt, messages, res);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'LLM error', detail: err.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Maslahatchi proxy listening on http://localhost:${PORT}`);
});
```

- [ ] **Step 2: Create `server/.env` from the example**

```bash
cp server/.env.example server/.env
```

Then open `server/.env` and fill in your `OPENAI_API_KEY` or `GOOGLE_API_KEY`.

- [ ] **Step 3: Smoke-test the server**

```bash
cd server && node chat.js
```

Expected: `Maslahatchi proxy listening on http://localhost:3001`

In a second terminal:

```bash
curl -s -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Shor neme?"}]}' \
  --no-buffer
```

Expected: streaming `data: {"text":"..."}` lines in Karakalpak, ending with `data: [DONE]`.

Stop the server with `Ctrl-C` after the test.

- [ ] **Step 4: Commit**

```bash
git add server/chat.js
git commit -m "feat: add chat proxy server (OpenAI + Gemini streaming)"
```

---

## Task 4: Vite proxy config + dev scripts

**Files:**
- Modify: `app/vite.config.ts`
- Modify: `app/package.json`

- [ ] **Step 1: Add proxy to `app/vite.config.ts`**

Replace the entire file with:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "AridSmart",
        short_name: "AridSmart",
        description:
          "Suwǵarıw keńesi hám shorlanıw qáwip belgisi — Qaraqalpaqstan fermerlerine",
        lang: "kaa",
        theme_color: "#0e3a4d",
        background_color: "#f3f6f7",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "index.html",
      },
    }),
  ],
  server: {
    proxy: {
      "/api/chat": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 2: Add dev scripts to `app/package.json`**

Add `"dev:server"` and `"dev:all"` to the scripts section. Install `concurrently` first:

```bash
cd app && npm install --save-dev concurrently
```

Then update `app/package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "dev:server": "node ../server/chat.js",
  "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview"
}
```

- [ ] **Step 3: Verify proxy works**

```bash
cd app && npm run dev:all
```

Expected: both Vite (port 5173) and the chat server (port 3001) start. The Vite terminal shows the proxy forwarding. Stop with `Ctrl-C`.

- [ ] **Step 4: Commit**

```bash
git add app/vite.config.ts app/package.json app/package-lock.json
git commit -m "feat: add Vite proxy for /api/chat and dev:all script"
```

---

## Task 5: Add `P.bot` icon

**Files:**
- Modify: `app/src/components/icons.tsx`

- [ ] **Step 1: Add `bot` to the `P` object in `app/src/components/icons.tsx`**

Find the line `download: "M12 4v11m0 0 5-5m-5 5-5-5M4 20h16",` and add after it:

```typescript
  bot: "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14M9.5 12v.01M12 12v.01M14.5 12v.01",
```

This renders as a circle (AI bubble) with three dots — the universal "AI / thinking" icon, distinct from the rectangular `P.msg` speech bubble used for the Messages tab.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/components/icons.tsx
git commit -m "feat: add P.bot icon for AI chat tab"
```

---

## Task 6: i18n keys — all 4 locales

**Files:**
- Modify: `app/src/i18n/locales.ts`

- [ ] **Step 1: Add chat keys to the `kaa` dict**

After `"pages.wizard.edit": "Atızdı ózgertiw",` add:

```typescript
  "tabs.chat": "Chat",
  "pages.chat": "Maslahatchi",

  "chat.title": "Maslahatchi",
  "chat.subtitle": "Aqılly agronomiya kómekshisi",
  "chat.placeholder": "Soraw jazıń…",
  "chat.clearContext": "Óshiriw",
  "chat.offline": "Internet bolǵanda jumıs isleydi",
  "chat.aiLabel": "Maslahatchi",
  "chat.error": "Xata ketti. Qayta urınıń.",
  "chat.empty.title": "Agronomiya boyınsha soraw beriń",
  "chat.empty.subtitle": "Atız jazbınan ashsańız, málimat awtomatik qosıladı",
  "chat.chips.irrigate": "Suwarıw haqqında",
  "chat.chips.salinity": "Shor haqqında",
  "chat.chips.sms": "SMS mátn",
  "chat.chips.advice": "Másláhát",
  "chat.chips.waterTime": "Suwarıw waqtı",
  "chat.chips.salinityGeneral": "Shor máselesi",
  "chat.chips.cropHealth": "Daqıl kórinisi",
  "chat.chips.weather": "Hawa rayı",
```

- [ ] **Step 2: Add chat keys to the `uz` dict**

Find the `uz` dict and add the same block after its `pages.wizard.edit` entry:

```typescript
  "tabs.chat": "Chat",
  "pages.chat": "Maslahatchi",

  "chat.title": "Maslahatchi",
  "chat.subtitle": "Aqlli agronomiyanı yordamchisi",
  "chat.placeholder": "Savol yozing…",
  "chat.clearContext": "Oʻchirish",
  "chat.offline": "Internet boʻlganda ishlaydi",
  "chat.aiLabel": "Maslahatchi",
  "chat.error": "Xato yuz berdi. Qayta urinib koʻring.",
  "chat.empty.title": "Agronomiyan boʻyicha savol bering",
  "chat.empty.subtitle": "Dala kartasidan ochsangiz, maʼlumot avtomatik qoʻshiladi",
  "chat.chips.irrigate": "Sugʻorish haqida",
  "chat.chips.salinity": "Shor haqida",
  "chat.chips.sms": "SMS matn",
  "chat.chips.advice": "Maslahat",
  "chat.chips.waterTime": "Sugʻorish vaqti",
  "chat.chips.salinityGeneral": "Shor muammosi",
  "chat.chips.cropHealth": "Ekin holati",
  "chat.chips.weather": "Ob-havo",
```

- [ ] **Step 3: Add chat keys to the `ru` dict**

```typescript
  "tabs.chat": "Чат",
  "pages.chat": "Маслаҳатчы",

  "chat.title": "Маслаҳатчы",
  "chat.subtitle": "Умный агрономический помощник",
  "chat.placeholder": "Напишите вопрос…",
  "chat.clearContext": "Убрать",
  "chat.offline": "Работает при наличии интернета",
  "chat.aiLabel": "Маслаҳатчы",
  "chat.error": "Произошла ошибка. Попробуйте снова.",
  "chat.empty.title": "Задайте вопрос об агрономии",
  "chat.empty.subtitle": "Откройте из карточки поля — данные добавятся автоматически",
  "chat.chips.irrigate": "О поливе",
  "chat.chips.salinity": "О засолении",
  "chat.chips.sms": "Текст SMS",
  "chat.chips.advice": "Совет",
  "chat.chips.waterTime": "Время полива",
  "chat.chips.salinityGeneral": "Проблема засоления",
  "chat.chips.cropHealth": "Состояние урожая",
  "chat.chips.weather": "Погода",
```

- [ ] **Step 4: Add chat keys to the `en` dict**

```typescript
  "tabs.chat": "Chat",
  "pages.chat": "Maslahatchi",

  "chat.title": "Maslahatchi",
  "chat.subtitle": "Smart agronomy assistant",
  "chat.placeholder": "Ask a question…",
  "chat.clearContext": "Clear",
  "chat.offline": "Requires internet connection",
  "chat.aiLabel": "Maslahatchi",
  "chat.error": "Something went wrong. Please try again.",
  "chat.empty.title": "Ask an agronomy question",
  "chat.empty.subtitle": "Open from a field report to include field context automatically",
  "chat.chips.irrigate": "About irrigation",
  "chat.chips.salinity": "About salinity",
  "chat.chips.sms": "SMS text",
  "chat.chips.advice": "Get advice",
  "chat.chips.waterTime": "Irrigation timing",
  "chat.chips.salinityGeneral": "Salinity problem",
  "chat.chips.cropHealth": "Crop health",
  "chat.chips.weather": "Weather",
```

- [ ] **Step 5: Verify TypeScript**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/src/i18n/locales.ts
git commit -m "feat: add chat i18n keys for all 4 locales"
```

---

## Task 7: Chat CSS styles

**Files:**
- Modify: `app/src/styles/base.css`

- [ ] **Step 1: Append chat styles to `app/src/styles/base.css`**

Add at the end of the file:

```css
/* ─── Chat page ────────────────────────────────── */

.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg-row {
  display: flex;
  flex-direction: column;
  max-width: 82%;
}

.msg-row.user {
  align-self: flex-end;
  align-items: flex-end;
}

.msg-row.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.ai-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 4px;
  margin-bottom: 3px;
}

.msg-bubble {
  padding: 10px 13px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
}

.msg-bubble.user {
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.msg-bubble.assistant {
  background: var(--surface);
  color: var(--ink-1);
  border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}

.msg-time {
  font-size: 10px;
  color: var(--ink-3);
  margin-top: 3px;
  padding: 0 4px;
}

/* Three-dot typing indicator */
.chat-typing {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 2px 0;
}

.chat-typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ink-3);
  animation: chat-blink 1.2s infinite;
}

.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes chat-blink {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}

/* Context banner */
.context-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: color-mix(in srgb, var(--accent) 8%, var(--surface));
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  font-size: 12px;
}

.context-banner .ctx-text {
  flex: 1;
  font-weight: 600;
  color: var(--accent);
}

.context-banner .ctx-clear {
  color: var(--ink-3);
  font-size: 12px;
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  min-height: 32px;
}

/* Suggestion chips */
.chat-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px 4px;
  border-top: 1px solid var(--border);
}

.chat-chip {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  font-size: 13px;
  color: var(--ink-2);
  background: var(--surface);
  cursor: pointer;
  min-height: 32px;
  white-space: nowrap;
}

.chat-chip:active {
  background: var(--surface-2);
}

/* Input area */
.chat-input-area {
  padding: 8px 12px 12px;
  border-top: 1px solid var(--border);
  background: var(--bg);
}

.chat-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 15px;
  color: var(--ink-1);
  outline: none;
  min-height: 44px;
}

.chat-input:focus {
  border-color: var(--accent);
}

.chat-input:disabled {
  opacity: 0.5;
}

.chat-send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.chat-send-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/src/styles/base.css
git commit -m "feat: add chat page CSS styles"
```

---

## Task 8: Chat API client + Vitest

**Files:**
- Create: `app/src/api/chat.ts`
- Create: `app/src/api/chat.test.ts`
- Modify: `app/package.json`

- [ ] **Step 1: Install Vitest**

```bash
cd app && npm install --save-dev vitest
```

Add `"test": "vitest run"` to the scripts in `app/package.json`:

```json
"scripts": {
  "dev": "vite",
  "dev:server": "node ../server/chat.js",
  "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "test": "vitest run"
}
```

- [ ] **Step 2: Create `app/src/api/chat.ts`**

```typescript
import type { Field, FieldReportResponse } from "./types";

export interface FieldContext {
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

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function buildFieldContext(
  field: Field,
  report: FieldReportResponse,
): FieldContext {
  const total = report.depletion.total_mm;
  return {
    fieldName: field.name,
    crop: field.crop,
    areaHa: field.area_ha,
    sowingDate: field.sowing_date ?? field.updated_at,
    soilTexture: field.soil_texture ?? "loam",
    irrigationMethod: field.irrigation_method ?? "furrow",
    irrigationAction: report.recommendation.action,
    irrigationDate: report.recommendation.weekday_date,
    depthMm: report.recommendation.depth_mm,
    volumeM3ha: report.recommendation.volume_m3_ha,
    depletionPct: total > 0 ? Math.round((report.depletion.current_mm / total) * 100) : 0,
    currentMm: report.depletion.current_mm,
    totalMm: total,
    salinityLevel: report.salinity_summary.level,
    eceDsM: report.salinity_summary.ece_ds_m,
    updatedAt: report.freshness.calculated,
  };
}

const API_BASE = (import.meta as { env: Record<string, string> }).env
  .VITE_API_BASE ?? "/api";

export async function sendChatMessage(
  messages: ChatMessage[],
  fieldContext: FieldContext | null,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      fieldContext: fieldContext ?? undefined,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data) as { text: string };
        onChunk(parsed.text);
      } catch {
        // skip malformed SSE chunk
      }
    }
  }
}
```

- [ ] **Step 3: Create `app/src/api/chat.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { buildFieldContext } from "./chat";
import type { Field, FieldReportResponse } from "./types";

const FIELD: Field = {
  id: "f1",
  name: "Kegeyli paxta",
  crop: "cotton",
  area_ha: 4.2,
  lat: 42.78,
  lon: 59.6,
  sowing_date: "2026-04-04",
  soil_texture: "loam",
  irrigation_method: "furrow",
  farmer_name: "Allanazar",
  phone: "+998901234567",
  sms_language: "kaa",
  sms_frequency: "action",
  irrigation_status: { action: "irrigate", date: "2026-06-12", depth_mm: 55, volume_m3_ha: 550 },
  salinity_status: { level: "caution", ece_ds_m: 4.1 },
  updated_at: "2026-06-11T06:40:00Z",
};

const REPORT: FieldReportResponse = {
  recommendation: {
    action: "irrigate",
    weekday_date: "2026-06-12",
    depth_mm: 55,
    volume_m3_ha: 550,
    reason: "High depletion",
    next_check: "2026-06-15",
  },
  depletion: { current_mm: 68, threshold_mm: 65, total_mm: 100 },
  forecast: [],
  ndvi: [],
  salinity_summary: { level: "caution", ece_ds_m: 4.1, tolerance_ds_m: 7.7, advice: "Monitor" },
  sms_preview: { text: "Suwarıw kerek", lang: "kaa", segments: 1 },
  freshness: { weather: "2026-06-11T06:00:00Z", satellite: "2026-06-10", calculated: "2026-06-11T06:40:00Z" },
};

describe("buildFieldContext", () => {
  it("maps field name and crop", () => {
    const ctx = buildFieldContext(FIELD, REPORT);
    expect(ctx.fieldName).toBe("Kegeyli paxta");
    expect(ctx.crop).toBe("cotton");
  });

  it("calculates depletionPct correctly", () => {
    const ctx = buildFieldContext(FIELD, REPORT);
    expect(ctx.depletionPct).toBe(68);
  });

  it("maps salinity from report summary, not field status", () => {
    const ctx = buildFieldContext(FIELD, REPORT);
    expect(ctx.salinityLevel).toBe("caution");
    expect(ctx.eceDsM).toBe(4.1);
  });

  it("uses sowing_date when present", () => {
    const ctx = buildFieldContext(FIELD, REPORT);
    expect(ctx.sowingDate).toBe("2026-04-04");
  });

  it("falls back to updated_at when sowing_date missing", () => {
    const fieldNoSow: Field = { ...FIELD, sowing_date: undefined };
    const ctx = buildFieldContext(fieldNoSow, REPORT);
    expect(ctx.sowingDate).toBe("2026-06-11T06:40:00Z");
  });

  it("handles zero total_mm without divide-by-zero", () => {
    const reportZero: FieldReportResponse = {
      ...REPORT,
      depletion: { current_mm: 0, threshold_mm: 0, total_mm: 0 },
    };
    const ctx = buildFieldContext(FIELD, reportZero);
    expect(ctx.depletionPct).toBe(0);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd app && npm test
```

Expected: 6 passing tests, no failures.

- [ ] **Step 5: Commit**

```bash
git add app/src/api/chat.ts app/src/api/chat.test.ts app/package.json app/package-lock.json
git commit -m "feat: add chat API client and buildFieldContext with tests"
```

---

## Task 9: Chat page component

**Files:**
- Create: `app/src/pages/Chat.tsx`

- [ ] **Step 1: Create `app/src/pages/Chat.tsx`**

```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { sendChatMessage, type ChatMessage, type FieldContext } from "../api/chat";
import { AppBar, Ic, P } from "../components";
import { useI18n } from "../i18n";

const CHIPS_WITH_CTX = ["irrigate", "salinity", "sms", "advice"] as const;
const CHIPS_WITHOUT_CTX = ["waterTime", "salinityGeneral", "cropHealth", "weather"] as const;

export function Chat() {
  const { t } = useI18n();
  const location = useLocation();
  const [fieldContext, setFieldContext] = useState<FieldContext | null>(
    (location.state as { fieldContext?: FieldContext } | null)?.fieldContext ?? null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const offline = !navigator.onLine;
  const chips = fieldContext ? CHIPS_WITH_CTX : CHIPS_WITHOUT_CTX;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming || offline) return;
      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      const nextMessages = [...messages, userMsg];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);
      const assistantIdx = nextMessages.length;
      abortRef.current = new AbortController();
      try {
        await sendChatMessage(
          nextMessages,
          fieldContext,
          (chunk) => {
            setMessages((prev) => {
              const updated = [...prev];
              updated[assistantIdx] = {
                role: "assistant",
                content: (updated[assistantIdx]?.content ?? "") + chunk,
              };
              return updated;
            });
          },
          abortRef.current.signal,
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIdx] = { role: "assistant", content: t("chat.error") };
            return updated;
          });
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, offline, fieldContext, t],
  );

  return (
    <div className="scr chat-layout">
      <AppBar title={t("chat.title")} sub={t("chat.subtitle")} />

      {fieldContext && (
        <div className="context-banner">
          <Ic d={P.sprout} size={14} sw={2} color="var(--accent)" />
          <span className="ctx-text">
            {fieldContext.fieldName} · {fieldContext.salinityLevel}
          </span>
          <button className="ctx-clear" onClick={() => setFieldContext(null)}>
            {t("chat.clearContext")}
          </button>
        </div>
      )}

      <div className="chat-body">
        {messages.length === 0 && (
          <div className="center-note" style={{ margin: "auto" }}>
            <Ic d={P.bot} size={34} color="var(--ink-3)" sw={1.6} />
            <p style={{ margin: 0 }}>{t("chat.empty.title")}</p>
            <p className="report-muted" style={{ margin: 0, textAlign: "center" }}>
              {t("chat.empty.subtitle")}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`msg-row ${msg.role}`}>
            {msg.role === "assistant" && (
              <div className="ai-label">{t("chat.aiLabel")}</div>
            )}
            <div className={`msg-bubble ${msg.role}`}>
              {msg.role === "assistant" && msg.content === "" && streaming ? (
                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {messages.length === 0 && (
        <div className="chat-chips">
          {chips.map((chip) => (
            <button
              key={chip}
              className="chat-chip"
              onClick={() => void send(t(`chat.chips.${chip}`))}
              disabled={offline}
            >
              {t(`chat.chips.${chip}`)}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-area">
        {offline && (
          <p className="inline-error" style={{ margin: "0 0 6px" }}>
            {t("chat.offline")}
          </p>
        )}
        <div className="chat-input-row">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) void send(input);
            }}
            placeholder={t("chat.placeholder")}
            disabled={offline || streaming}
          />
          <button
            className="chat-send-btn"
            onClick={() => void send(input)}
            disabled={!input.trim() || offline || streaming}
            aria-label={t("chat.placeholder")}
          >
            <Ic d={P.send} size={18} sw={1.9} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/src/pages/Chat.tsx
git commit -m "feat: add Chat page component"
```

---

## Task 10: TabBar + App routing

**Files:**
- Modify: `app/src/components/TabBar.tsx`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Add chat tab to `app/src/components/TabBar.tsx`**

Replace the entire file:

```typescript
import { NavLink } from "react-router-dom";
import { useI18n } from "../i18n";
import { Ic, P } from "./icons";

const TABS = [
  { to: "/", key: "tabs.home", d: P.home },
  { to: "/fields", key: "tabs.fields", d: P.layers },
  { to: "/chat", key: "tabs.chat", d: P.bot },
  { to: "/messages", key: "tabs.messages", d: P.msg },
  { to: "/settings", key: "tabs.settings", d: P.sliders },
] as const;

/** Bottom tab bar — 5 tabs, icons + labels (spec §0.2 + Maslahatchi chat). */
export function TabBar() {
  const { t } = useI18n();
  return (
    <nav className="tabbar">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) => "tab" + (isActive ? " on" : "")}
        >
          {({ isActive }) => (
            <>
              <span className="tabglow">
                <Ic d={tab.d} size={21} sw={isActive ? 2.2 : 1.8} />
              </span>
              {t(tab.key)}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Add `/chat` route to `app/src/App.tsx`**

Add the import after the `Settings` import line:

```typescript
import { Chat } from "./pages/Chat";
```

Then add the route inside the `<Route element={<TabLayout />}>` block, after the `/settings` route:

```typescript
{/* Maslahatchi — AI chat assistant */}
<Route path="/chat" element={<Chat />} />
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/TabBar.tsx app/src/App.tsx
git commit -m "feat: add /chat route and Maslahatchi tab to tab bar"
```

---

## Task 11: FieldReport "Ask Maslahatchi" button

**Files:**
- Modify: `app/src/pages/FieldReport.tsx`

- [ ] **Step 1: Add `buildFieldContext` import to `app/src/pages/FieldReport.tsx`**

At the top of the file, after the existing `../api/client` import, add:

```typescript
import { buildFieldContext } from "../api/chat";
```

- [ ] **Step 2: Add the button inside the SMS card**

In `FieldReport.tsx`, find the existing `<div className="report-actions">` block (the one with the "Send now" primary button and "History" secondary button). Add a third button after "History":

```typescript
<button
  className="btn sec"
  onClick={() =>
    report &&
    field &&
    navigate("/chat", {
      state: { fieldContext: buildFieldContext(field, report) },
    })
  }
>
  <Ic d={P.bot} size={18} sw={1.9} />
  {t("chat.title")}
</button>
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd app && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run the app and verify the full flow**

```bash
cd app && npm run dev:all
```

1. Open http://localhost:5173
2. Navigate to a field report (tap a field card → field report page)
3. Scroll to the SMS card — confirm the "Maslahatchi" button appears
4. Tap it — confirm navigation to `/chat` with the context banner showing the field name
5. Type a question in Karakalpak or another language — confirm the response streams in Karakalpak
6. Tap the tab bar "Chat" icon directly — confirm context banner is absent and general chips appear

- [ ] **Step 5: Commit**

```bash
git add app/src/pages/FieldReport.tsx
git commit -m "feat: add Ask Maslahatchi button to FieldReport SMS card"
```

---

## Self-Review Checklist

- [x] Spec §Layer 1 identity + language lock → Task 2 `LAYER_1` constant
- [x] Spec §Layer 2 few-shot examples → Task 2 `LAYER_2` constant (5 examples, including Cyrillic-Uzbek and English inputs)
- [x] Spec §Layer 3 field context → Task 2 `LAYER_3_TEMPLATE` + `renderFieldContext`
- [x] Spec §Layer 4 conversation history → Task 3 `messages.slice(-8)` in both stream functions
- [x] Spec `temperature: 0.4` + `max_tokens: 400` → Task 3 both stream functions
- [x] Spec `FieldContext` interface → Task 8 `app/src/api/chat.ts`
- [x] Spec `buildFieldContext` → Task 8, tested in Task 8 Step 3
- [x] Spec context banner + clear button → Task 9 `Chat.tsx`
- [x] Spec suggestion chips (4 with context, 4 without) → Task 9
- [x] Spec offline state → Task 9 (input disabled + error message)
- [x] Spec 5th tab with bot icon → Task 10
- [x] Spec FieldReport "Ask Maslahatchi" button → Task 11
- [x] Spec API key never on client → Task 3 (proxy only)
- [x] All 4 locales have chat keys → Task 6
