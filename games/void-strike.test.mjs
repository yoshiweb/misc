import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const gameUrl = new URL('./void-strike.html', import.meta.url);
const html = await readFile(gameUrl, 'utf8');
const manifest = JSON.parse(await readFile(new URL('./void-strike.webmanifest', import.meta.url), 'utf8'));
const serviceWorker = await readFile(new URL('./void-strike-sw.js', import.meta.url), 'utf8');

function inlineScript(source) {
  const marker = "'use strict';";
  const markerIndex = source.indexOf(marker);
  const start = source.lastIndexOf('<script>', markerIndex);
  const end = source.indexOf('</script>', start);
  assert.notEqual(start, -1, 'inline game script should exist');
  assert.notEqual(end, -1, 'inline game script should close');
  return source.slice(start + '<script>'.length, end);
}

async function pngMetadata(relativePath) {
  const bytes = await readFile(new URL(relativePath, import.meta.url));
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function jpegMetadata(relativePath) {
  const bytes = await readFile(new URL(relativePath, import.meta.url));
  assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff');
  for (let offset = 2; offset < bytes.length - 9;) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  throw new Error(`JPEG dimensions not found: ${relativePath}`);
}

test('the game script parses and only loads the GA4 measurement script', () => {
  assert.doesNotThrow(() => new Function(inlineScript(html)));
  const externalScripts = [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi)].map(match => match[1]);
  assert.deepEqual(externalScripts, ['https://www.googletagmanager.com/gtag/js?id=G-W2L9NES4NJ']);
  assert.match(html, /<canvas id="game"/);
  assert.match(html, /assets\/void-strike\/orbital-citadel\.jpg/);
});

test('mobile movement uses a floating analog joystick at the touched position', () => {
  assert.match(html, /id="joystick"/);
  assert.match(html, /id="joystickKnob"/);
  assert.match(html, /function placeJoystick\(/);
  assert.match(html, /function moveJoystick\(/);
  assert.match(html, /player\.vx\+=\(ix\*target-player\.vx\)/);
  assert.match(html, /canvas\.addEventListener\('pointerdown'/);
  assert.match(html, /canvas\.addEventListener\('pointermove'/);
  assert.match(html, /canvas\.setPointerCapture\(ev\.pointerId\)/);
  assert.match(html, /ev\.clientX-shell\.left/);
  assert.match(html, /ev\.clientY-shell\.top/);
  assert.match(html, /ui\.stick\.style\.display='block'/);
  assert.match(html, /ui\.stick\.style\.display='none'/);
  assert.match(html, /touch-action:none/);
  assert.match(html, /#joystick \{[^}]*left:0;[^}]*top:0;[^}]*transform:translate\(-50%,-50%\)/);
  assert.match(html, /pointer-events:none/);
  assert.doesNotMatch(html, /fireButton|shootButton/);
});

test('enemy bullet density starts low and increases with elapsed time and stage', () => {
  assert.match(html, /function bulletIntensity\(\)/);
  assert.match(html, /\(state\.stageTime-10\)\/78\+\(state\.stage-1\)\*\.24/);
  assert.match(html, /intensity<\.38\?1:2/);
  assert.match(html, /intensity<\.3\?1:intensity<\.82\?2:3/);
  assert.match(html, /6\+Math\.floor\(intensity\*3\)/);
  assert.match(html, /cadence=\.78\+intensity\*\.38/);
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

test('GA4 tracks the meaningful game loop without collecting player input', () => {
  assert.match(html, /gtag\('config', 'G-W2L9NES4NJ'\)/);
  for (const event of ['game_start', 'level_start', 'level_end', 'boss_start', 'game_over', 'game_pause', 'auto_bomb', 'power_up', 'pwa_installed']) {
    assert.match(html, new RegExp(`track\\('${event}'`));
  }
});

test('PWA manifest and isolated service worker provide an offline fullscreen install', () => {
  assert.match(html, /rel="manifest" href="void-strike\.webmanifest"/);
  assert.match(html, /rel="apple-touch-icon" href="assets\/void-strike\/icon-192\.png"/);
  assert.match(html, /serviceWorker\.register\('void-strike-sw\.js',\{scope:'\.\/void-strike\.html'\}\)/);
  assert.equal(manifest.start_url, './void-strike.html?source=pwa');
  assert.equal(manifest.scope, './void-strike.html');
  assert.equal(manifest.display, 'fullscreen');
  assert.equal(manifest.orientation, 'portrait');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512', '512x512']);
  for (const asset of ['void-strike.html', 'void-strike.webmanifest', 'orbital-citadel.jpg', 'key-visual.jpg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) {
    assert.ok(serviceWorker.includes(asset), `service worker should cache ${asset}`);
  }
  assert.match(serviceWorker, /CACHE_NAME = 'void-strike-v2'/);
  assert.doesNotThrow(() => new Function(serviceWorker));
});

test('PWA icons have production dimensions and include a maskable variant', async () => {
  assert.deepEqual(await pngMetadata('./assets/void-strike/icon-192.png'), { width: 192, height: 192 });
  assert.deepEqual(await pngMetadata('./assets/void-strike/icon-512.png'), { width: 512, height: 512 });
  assert.deepEqual(await pngMetadata('./assets/void-strike/icon-maskable-512.png'), { width: 512, height: 512 });
  assert.equal(manifest.icons.at(-1).purpose, 'maskable');
});

test('OGP uses the generated 1200 by 630 key visual with complete social metadata', async () => {
  assert.match(html, /property="og:image" content="https:\/\/misc\.yoshiweb\.net\/games\/assets\/void-strike\/key-visual\.jpg"/);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /property="og:image:height" content="630"/);
  assert.match(html, /property="og:image:alt"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:image" content="https:\/\/misc\.yoshiweb\.net\/games\/assets\/void-strike\/key-visual\.jpg"/);
  assert.deepEqual(await jpegMetadata('./assets/void-strike/key-visual.jpg'), { width: 1200, height: 630 });
});
