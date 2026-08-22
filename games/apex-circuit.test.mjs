import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const html = await readFile(new URL('./apex-circuit.html', import.meta.url), 'utf8');
const moduleSource = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];

test('Apex Circuit is a self-contained Three.js racing page', () => {
  assert.ok(moduleSource, 'module script should exist');
  assert.doesNotThrow(() => new Function(moduleSource.replace(/import \* as THREE from [^;]+;/, 'const THREE = {};')));
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/three@0\.181\.2/);
  assert.match(html, /id="game"/);
  assert.match(html, /id="joystick"/);
  assert.match(html, /id="joystickKnob"/);
  assert.match(html, /pointerdown/);
  assert.match(html, /setPointerCapture/);
  assert.match(html, /touch-action:none/);
});

test('the race has the requested flow, HUD, loop, AI, and feedback systems', () => {
  for (const id of ['titleScreen', 'resultsScreen', 'startButton', 'restartButton', 'minimap', 'speedValue', 'lapValue', 'positionValue']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const feature of ['state.phase=\'countdown\'', 'state.phase=\'race\'', 'state.phase=\'results\'', 'racers=[]', 'function updateCamera', 'function updateMap', 'AudioContext', 'speedLines', 'laps:3']) {
    assert.ok(html.includes(feature), `missing ${feature}`);
  }
  assert.doesNotMatch(html, /accelerateButton|brakeButton|steerButton/);
});

test('the portal links to the new game', async () => {
  const portal = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(portal, /games\/apex-circuit\.html/);
});
