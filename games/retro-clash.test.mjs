import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const gameUrl = new URL('./retro-clash.html', import.meta.url);
const html = await readFile(gameUrl, 'utf8');

function inlineScript(source) {
  const start = source.indexOf('<script>');
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

test('the single-file game JavaScript parses without external libraries', () => {
  assert.doesNotThrow(() => new Function(inlineScript(html)));
  assert.doesNotMatch(html, /<script\s+src=/i);
  assert.doesNotMatch(html, /https?:\/\//i);
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
