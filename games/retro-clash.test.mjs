import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const gameUrl = new URL('./retro-clash.html', import.meta.url);
const html = await readFile(gameUrl, 'utf8');
const manifest = JSON.parse(await readFile(new URL('./retro-clash.webmanifest', import.meta.url), 'utf8'));
const serviceWorker = await readFile(new URL('./retro-clash-sw.js', import.meta.url), 'utf8');

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
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25]
  };
}

test('the game JavaScript parses and only loads the GA4 measurement script', () => {
  assert.doesNotThrow(() => new Function(inlineScript(html)));
  const externalScripts = [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi)].map(match => match[1]);
  assert.deepEqual(externalScripts, ['https://www.googletagmanager.com/gtag/js?id=G-W2L9NES4NJ']);
});

test('share metadata uses the production key visual and GA4 tracks the game loop', async () => {
  assert.match(html, /property="og:image" content="https:\/\/misc\.yoshiweb\.net\/assets\/images\/ogp\/retro-clash\.jpg"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /url\("assets\/retro-clash\/key-visual\.png"\) center \/ cover/);
  assert.match(html, /gtag\('config', 'G-W2L9NES4NJ'\)/);
  for (const event of ['game_start', 'level_start', 'level_end', 'select_content']) {
    assert.match(html, new RegExp(`track\\('${event}'`));
  }
  const keyVisual = await pngMetadata('./assets/retro-clash/key-visual.png');
  assert.ok(keyVisual.width >= 1200 && keyVisual.height >= 630);
  const ogp = await readFile(new URL('../assets/images/ogp/retro-clash.jpg', import.meta.url));
  assert.equal(ogp.subarray(0, 3).toString('hex'), 'ffd8ff');
});

test('PWA manifest provides installable icons and fullscreen game launch', async () => {
  assert.match(html, /rel="manifest" href="retro-clash\.webmanifest"/);
  assert.match(html, /rel="apple-touch-icon" href="assets\/retro-clash\/icon-192\.png"/);
  assert.equal(manifest.start_url, './retro-clash.html?source=pwa');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'fullscreen');
  assert.equal(manifest.orientation, 'any');
  assert.deepEqual(manifest.icons.map(icon => icon.sizes), ['192x192', '512x512', '512x512']);
  assert.equal(manifest.icons.at(-1).purpose, 'maskable');
  for (const icon of manifest.icons) {
    const metadata = await pngMetadata(`./${icon.src}`);
    const size = Number(icon.sizes.split('x')[0]);
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
  }
});

test('service worker caches the complete game shell without intercepting other games', () => {
  assert.match(html, /navigator\.serviceWorker\.register\('retro-clash-sw\.js', \{ scope: '\.\/' \}\)/);
  for (const asset of [
    'retro-clash.html', 'retro-clash.webmanifest', 'azure-sprites.png',
    'crimson-sprites.png', 'moonlit-dojo.png', 'neon-street.png',
    'key-visual.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'
  ]) {
    assert.ok(serviceWorker.includes(asset), `service worker should cache ${asset}`);
  }
  assert.match(serviceWorker, /if \(!isGamePage && !isGameAsset && !isManifest\) return/);
  assert.doesNotThrow(() => new Function(serviceWorker));
});

test('PWA install prompt has a visible in-game action and analytics', () => {
  assert.match(html, /id="installButton"/);
  assert.match(html, /beforeinstallprompt/);
  assert.match(html, /installPrompt\.prompt\(\)/);
  assert.match(html, /track\('pwa_installed'\)/);
});

test('all required game-flow screens and actions are present', () => {
  for (const id of ['title', 'select', 'vs', 'announcement', 'result']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  for (const action of ['select', 'fight', 'restart', 'title']) {
    assert.match(html, new RegExp(`data-action=["']${action}["']`));
  }
  assert.match(html, /best|game\.wins\[winner\] >= 2|game\.wins\[winner\]>=2/i);
});

test('player controls expose six attacks while the CPU retains internal controls', () => {
  assert.match(html, /left: 'a', right: 'd', down: 's', up: 'w'/);
  assert.match(html, /punch: \['j', 'k', 'l'\], kick: \['u', 'i', 'o'\]/);
  assert.match(html, /left: 'arrowleft', right: 'arrowright', down: 'arrowdown', up: 'arrowup'/);
  assert.match(html, /punch: \['1', '2', '3'\], kick: \['4', '5', '6'\]/);
});

test('single-player CPU manages range, defense, normals, and all three specials', () => {
  assert.match(html, /class CPUController/);
  assert.match(html, /game\.cpuEnabled/);
  assert.match(html, /incomingShot/);
  assert.match(html, /threatened/);
  assert.match(html, /distance > 285/);
  assert.match(html, /distance > 125/);
  assert.match(html, /self\.startNormal\('punch'/);
  assert.match(html, /self\.startNormal\('kick'/);
  for (const move of ['wave', 'rising', 'spin']) {
    assert.match(html, new RegExp(`self\\.startSpecial\\('${move}'`));
  }
});

test('portrait touch layout provides safe controls and an in-game resume action', () => {
  assert.match(html, /@media \(orientation: portrait\) and \(max-width: 700px\)/);
  assert.match(html, /inset: 56\.25vw 0 0/);
  assert.match(html, /id="pauseButton"/);
  assert.match(html, /function setPaused\(/);
  assert.match(html, /RESUMEボタンで再開/);
  assert.match(html, /-webkit-touch-callout: none/);
  assert.match(html, /addEventListener\('contextmenu'/);
  assert.match(html, /addEventListener\('selectstart'/);
  assert.doesNotMatch(html, /id="rotate"/);
});

test('touch movement uses an eight-way joystick instead of direction buttons', () => {
  assert.match(html, /id="joystick"/);
  assert.match(html, /id="joystickKnob"/);
  assert.match(html, /function moveJoystick\(/);
  assert.match(html, /distance < rect\.width \* \.13/);
  assert.match(html, /const threshold = \.34/);
  assert.match(html, /joystick\.addEventListener\('pointermove'/);
  assert.doesNotMatch(html, /data-key="[wasd]"/);
});

test('mobile zoom is blocked and stage selection has visual feedback', () => {
  assert.match(html, /touch-action: none/);
  assert.match(html, /addEventListener\('dblclick'/);
  assert.match(html, /addEventListener\('gesturestart'/);
  assert.match(html, /now - lastTouchEnd < 340/);
  assert.match(html, /--stage-preview/);
  assert.match(html, /neon-street/);
  assert.match(html, /\.fighter-card\.p2[\s\S]*?transform: scaleX\(-1\)/);
});

test('quarter-circle, dragon-punch, and reverse-quarter-circle motions are wired', () => {
  assert.match(html, /hasMotion\(\['2', '3', '6'\]\)/);
  assert.match(html, /hasMotion\(\['6', '2', '3'\]\)/);
  assert.match(html, /hasMotion\(\['2', '1', '4'\]\)/);
  for (const move of ['wave', 'rising', 'spin']) {
    assert.match(html, new RegExp(`${move}: \\{ name:`));
  }
});

test('generated sprite sheets and stage plates have production dimensions', async () => {
  const azure = await pngMetadata('./assets/retro-clash/azure-sprites.png');
  const crimson = await pngMetadata('./assets/retro-clash/crimson-sprites.png');
  const dojo = await pngMetadata('./assets/retro-clash/moonlit-dojo.png');
  const city = await pngMetadata('./assets/retro-clash/neon-street.png');

  assert.deepEqual(azure, { width: 1536, height: 1024, colorType: 6 });
  assert.deepEqual(crimson, { width: 1536, height: 1024, colorType: 6 });
  assert.ok(dojo.width >= 1600 && dojo.height >= 900);
  assert.ok(city.width >= 1600 && city.height >= 900);
});

test('combat feedback and defensive rules remain connected', () => {
  for (const feature of ['canBlock(', 'blockstun', 'chip:', 'knockdown', 'comboTimer', 'game.freeze', 'game.shake']) {
    assert.ok(html.includes(feature), `missing combat feature: ${feature}`);
  }
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /separation > 820/);
});
