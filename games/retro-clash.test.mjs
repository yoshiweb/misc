import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { inflateSync } from 'node:zlib';

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

async function jpegMetadata(relativePath) {
  const bytes = await readFile(new URL(relativePath, import.meta.url));
  assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff');
  for (let offset = 2; offset < bytes.length - 9;) {
    if (bytes[offset] !== 0xff) { offset++; continue; }
    const marker = bytes[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        width: bytes.readUInt16BE(offset + 7),
        height: bytes.readUInt16BE(offset + 5),
        components: bytes[offset + 9]
      };
    }
    if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  assert.fail(`${relativePath} has no JPEG size marker`);
}

async function pngRgba(relativePath) {
  const bytes = await readFile(new URL(relativePath, import.meta.url));
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert.equal(bytes[24], 8, `${relativePath} must use 8-bit channels`);
  assert.equal(bytes[25], 6, `${relativePath} must be RGBA`);
  const idat = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString();
    if (type === 'IDAT') idat.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const rgba = Buffer.alloc(stride * height);
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : (pb <= pc ? b : c);
  };
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const source = y * (stride + 1) + 1;
    const target = y * stride;
    for (let x = 0; x < stride; x++) {
      const value = raw[source + x];
      const left = x >= 4 ? rgba[target + x - 4] : 0;
      const up = y ? rgba[target + x - stride] : 0;
      const upperLeft = y && x >= 4 ? rgba[target + x - stride - 4] : 0;
      const predictor = filter === 0 ? 0
        : filter === 1 ? left
          : filter === 2 ? up
            : filter === 3 ? Math.floor((left + up) / 2)
              : paeth(left, up, upperLeft);
      rgba[target + x] = (value + predictor) & 255;
    }
  }
  return { width, height, rgba };
}

function alphaComponentCount(image, cell) {
  const col = cell % 4;
  const row = Math.floor(cell / 4);
  const x0 = Math.round(col * image.width / 4);
  const x1 = Math.round((col + 1) * image.width / 4);
  const y0 = Math.round(row * image.height / 3);
  const y1 = Math.round((row + 1) * image.height / 3);
  const width = x1 - x0;
  const height = y1 - y0;
  const seen = new Uint8Array(width * height);
  let components = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = y * width + x;
      if (seen[start] || image.rgba[((y0 + y) * image.width + x0 + x) * 4 + 3] === 0) continue;
      components++;
      const stack = [start];
      seen[start] = 1;
      while (stack.length) {
        const point = stack.pop();
        const px = point % width;
        const py = Math.floor(point / width);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            const next = ny * width + nx;
            if (seen[next] || image.rgba[((y0 + ny) * image.width + x0 + nx) * 4 + 3] === 0) continue;
            seen[next] = 1;
            stack.push(next);
          }
        }
      }
    }
  }
  return components;
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
  assert.match(html, /navigator\.serviceWorker\.register\('retro-clash-sw\.js', \{ scope: '\.\/', updateViaCache: 'none' \}\)/);
  for (const asset of [
    'retro-clash.html', 'retro-clash.webmanifest', 'azure-sprites.png',
    'crimson-sprites.png', 'azure-portrait.png', 'crimson-portrait.png',
    'knockdown-sprites.png', 'moonlit-dojo.png', 'neon-street.png',
    'key-visual.png', 'versus-dojo.jpg', 'versus-neon.jpg',
    'victory-dojo.jpg', 'victory-neon.jpg',
    'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'
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

test('title presents the key visual without duplicate content in every orientation', () => {
  assert.match(html, /#title \{[\s\S]*?justify-content: flex-end;[\s\S]*?key-visual\.png[\s\S]*?center \/ cover no-repeat;/);
  assert.match(html, /#title > \.logo,[\s\S]*?#title > \.controls-grid \{ display: none; \}/);
  assert.match(html, /class="title-quickstart"/);
  assert.match(html, /#title > \.action \{[\s\S]*?min-height: 46px;[\s\S]*?drop-shadow/);
  assert.match(html, /@media \(pointer: coarse\)[\s\S]*?\.title-quickstart \{ display: none; \}/);
  assert.match(serviceWorker, /CACHE_NAME = `\$\{CACHE_PREFIX\}v6`/);
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

test('easy touch mode is the default and uses only the joystick for combat', () => {
  assert.match(html, /id="touch" class="easy-mode"/);
  assert.match(html, /easyControls: true/);
  assert.match(html, /data-control-mode="easy" aria-pressed="true"/);
  assert.match(html, /#touch\.easy-mode \.touch-group \{ display: none; \}/);
  assert.match(html, /TAP 連撃 · 敵へFLICK 攻撃 · 逆へHOLD 防御/);
  assert.match(html, /function finishEasyGesture\(/);
  assert.match(html, /maxDistance < rect\.width \* \.16/);
  assert.match(html, /const toward = Math\.sign\(x\) === fighter\.facing/);
  assert.match(html, /special = y < -rect\.height \* \.17 \? 'rising'/);
  assert.match(html, /processEasyAction\(\);/);
  assert.match(html, /easyActionQueue\.length >= 3/);
  assert.match(html, /easyActionQueue\.length = 0/);
});

test('classic touch controls remain available as an explicit option', () => {
  assert.match(html, /data-control-mode="classic" aria-pressed="false"/);
  assert.match(html, /function setControlMode\(mode\)/);
  assert.match(html, /touch\.classList\.toggle\('easy-mode', game\.easyControls\)/);
  for (const key of ['j', 'k', 'l', 'u', 'i', 'o']) {
    assert.match(html, new RegExp(`data-key="${key}"`));
  }
});

test('mobile zoom is blocked and stage selection has visual feedback', () => {
  assert.match(html, /touch-action: none/);
  assert.match(html, /addEventListener\('dblclick'/);
  assert.match(html, /addEventListener\('gesturestart'/);
  assert.match(html, /now - lastTouchEnd < 340/);
  assert.match(html, /--stage-preview/);
  assert.match(html, /neon-street/);
  assert.match(html, /\.fighter-card img \{[^}]*object-fit: contain/);
  assert.match(html, /\.fighter-card\.p2 img \{ transform: scaleX\(-1\); \}/);
});

test('specials use complete sprite cells and knockdowns use dedicated artwork', async () => {
  assert.match(html, /attack\?\.special === 'wave'\) cell = 6/);
  assert.match(html, /attack\?\.special === 'rising'\) cell = 3/);
  assert.match(html, /attack\?\.special === 'spin'\) cell = 9/);
  assert.doesNotMatch(html, /attack\?\.special === 'wave'\) cell = 10/);
  assert.match(html, /assets\.knockdown/);
  assert.match(html, /if \(isDown && assets\.knockdown\.complete/);
  assert.match(html, /ctx\.scale\(this\.facing \/ nativeFacing, 1\)/);
  assert.match(html, /const drawH = drawW \* sourceH \/ sourceW/);
  assert.match(html, /-drawW \/ 2, -drawH \* \.76, drawW, drawH/);
  assert.doesNotMatch(html, /-112, -70, 224, 112/);
  const knockdown = await pngMetadata('./assets/retro-clash/knockdown-sprites.png');
  assert.ok(knockdown.width >= 1600 && knockdown.height >= 800);
  assert.equal(knockdown.colorType, 6);
});

test('every runtime sprite cell contains only one connected fighter silhouette', async () => {
  for (const fighter of ['azure', 'crimson']) {
    const sprite = await pngRgba(`./assets/retro-clash/${fighter}-sprites.png`);
    for (let cell = 0; cell < 12; cell++) {
      assert.equal(alphaComponentCount(sprite, cell), 1, `${fighter} cell ${cell} contains a detached body fragment`);
    }
  }
});

test('fighter portraits preserve aspect ratio and power the winner presentation', async () => {
  assert.match(html, /src="assets\/retro-clash\/azure-portrait\.png"/);
  assert.match(html, /src="assets\/retro-clash\/crimson-portrait\.png"/);
  assert.match(html, /id="resultFighter"/);
  assert.match(html, /resultFighter\.classList\.toggle\('crimson', winner === 1\)/);
  assert.match(html, /#result[\s\S]*?victory-dojo\.jpg/);
  assert.match(html, /id="resultRounds"/);
  assert.match(html, /id="resultHits"/);
  assert.match(html, /\.result-actions \{ display: flex/);
  assert.match(html, /\.result-copy \{[\s\S]*?width: 58%/);
  for (const name of ['azure', 'crimson']) {
    const portrait = await pngMetadata(`./assets/retro-clash/${name}-portrait.png`);
    assert.deepEqual(portrait, { width: 480, height: 360, colorType: 6 });
  }
});

test('stage-specific pre-fight and victory visuals are wired into match flow', async () => {
  for (const name of ['versus-dojo', 'versus-neon', 'victory-dojo', 'victory-neon']) {
    assert.match(html, new RegExp(`assets/retro-clash/${name}\\.jpg`));
    const visual = await jpegMetadata(`./assets/retro-clash/${name}.jpg`);
    assert.deepEqual(visual, { width: 1672, height: 941, components: 3 });
  }
  assert.match(html, /const presentationVisuals = \[/);
  assert.match(html, /--vs-visual/);
  assert.match(html, /--result-visual/);
  assert.match(html, /presentationVisuals\[game\.stage\]/);
  assert.match(html, /function preloadPresentation\(stage\)/);
  assert.match(html, /presentationPreloads\.set\(path, loadImage\(path\)\)/);
  assert.match(html, /<small>STAGE<\/small>/);
  assert.match(html, /NEXT BATTLE/);
  assert.match(html, /BEST OF 3/);
  assert.match(html, /@keyframes versus-mark/);
  assert.match(html, /}, 1800\);/);
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
