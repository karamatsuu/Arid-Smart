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
