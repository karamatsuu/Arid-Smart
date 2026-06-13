'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { default: OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildSystemPrompt } = require('./prompt');

const app = express();
app.use(express.json({ limit: '32kb' }));
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));

const PORT = process.env.CHAT_PORT || 3001;
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';

async function streamOpenAI(systemPrompt, messages, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const ac = new AbortController();
  res.on('close', () => ac.abort());
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
  }, { signal: ac.signal });
  for await (const chunk of stream) {
    const text = chunk.choices?.[0]?.delta?.content ?? '';
    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

async function streamGemini(systemPrompt, messages, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  let aborted = false;
  res.on('close', () => { aborted = true; });
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
  for await (const chunk of result.stream) {
    if (aborted) break;
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
      res.status(502).json({ error: 'LLM error', detail: 'Request failed' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'stream_error' })}\n\n`);
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Maslahatchi proxy listening on http://localhost:${PORT}`);
});
