import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const gameUrl = new URL('./void-strike.html', import.meta.url);
const html = await readFile(gameUrl, 'utf8');

function inlineScript(source) {
  const marker = "'use strict';";
  const markerIndex = source.indexOf(marker);
  const start = source.lastIndexOf('<script>', markerIndex);
  const end = source.indexOf('</script>', start);
  assert.notEqual(start, -1, 'inline game script should exist');
  assert.notEqual(end, -1, 'inline game script should close');
  return source.slice(start + '<script>'.length, end);
}

test('the standalone game script parses without external libraries', () => {
  assert.doesNotThrow(() => new Function(inlineScript(html)));
  assert.deepEqual([...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi)], []);
  assert.match(html, /<canvas id="game"/);
  assert.match(html, /assets\/void-strike\/orbital-citadel\.jpg/);
});

test('mobile movement is analog, inertial, and movement-only', () => {
  assert.match(html, /id="joystick"/);
  assert.match(html, /id="joystickKnob"/);
  assert.match(html, /function moveJoystick\(/);
  assert.match(html, /player\.vx\+=\(ix\*target-player\.vx\)/);
  assert.match(html, /pointerdown/);
  assert.match(html, /pointermove/);
  assert.match(html, /touch-action:none/);
  assert.doesNotMatch(html, /fireButton|shootButton/);
});

test('combat includes auto-fire, power progression, fair hitbox, and safety systems', () => {
  assert.match(html, /function firePlayer\(/);
  assert.match(html, /player\.fire<=0/);
  assert.match(html, /r:5,lives:3,power:1,bombs:2/);
  assert.match(html, /AUTO BOMB/);
  assert.match(html, /player\.shield=12/);
  assert.match(html, /player\.power=Math\.min\(5/);
  assert.match(html, /player\.options=optionCount/);
});

test('the stage director includes formations, five regular archetypes, midboss, and phased boss', () => {
  for (const type of ['scout', 'sine', 'aimer', 'spinner', 'carrier']) {
    assert.match(html, new RegExp(`${type}:\\{hp:`));
  }
  assert.match(html, /function formation\(/);
  assert.match(html, /function spawnMidboss\(/);
  assert.match(html, /function spawnBoss\(/);
  assert.match(html, /e\.phase=ratio>\.66\?1:ratio>\.32\?2:3/);
  assert.match(html, /function nextStage\(/);
});

test('score, chain, rank, and local high score persistence are connected', () => {
  assert.match(html, /voidStrikeBest/);
  assert.match(html, /localStorage\.setItem/);
  assert.match(html, /CHAIN ×\$\{state\.mult\.toFixed\(1\)\}/);
  assert.match(html, /RANK \$\{ranks\[r\]\}/);
  assert.match(html, /function addScore\(/);
});

test('game flow exposes title, pause, restart, and visibility auto-pause', () => {
  for (const id of ['titleScreen', 'pauseScreen', 'gameOverScreen', 'startButton', 'resumeButton', 'restartButton', 'pauseButton']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /function setPaused\(/);
  assert.match(html, /visibilitychange/);
  assert.match(html, /prefers-reduced-motion/);
});

test('procedural audio and arcade feedback remain wired', () => {
  assert.match(html, /class AudioEngine/);
  assert.match(html, /AudioContext/);
  for (const feature of ['particle(', 'trail(', 'state.shake', 'state.flash', 'audio.boom', 'audio.power']) {
    assert.ok(html.includes(feature), `missing feedback feature: ${feature}`);
  }
});
