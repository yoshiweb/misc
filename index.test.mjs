import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');

test('もっと見るに操作可能な4つのタブと対応パネルがある', () => {
  const tabs = html.match(/class="tab-button"/g) ?? [];
  const panels = html.match(/class="tool-panel"/g) ?? [];

  assert.equal(tabs.length, 4);
  assert.equal(panels.length, 4);
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-selected="true"/);
});

test('すべてのツールを見るは全パネルを展開できるボタンである', () => {
  assert.match(html, /<button class="more-link"[^>]+aria-expanded="false"/);
  assert.match(html, /panels\.forEach\(panel => \{ panel\.hidden = false; \}\)/);
  assert.match(html, /allLabel\.textContent = 'カテゴリ表示に戻す'/);
});

test('タブはクリックと矢印キーで切り替えられる', () => {
  assert.match(html, /tab\.addEventListener\('click'/);
  assert.match(html, /'ArrowLeft', 'ArrowRight', 'Home', 'End'/);
  assert.match(html, /panel\.dataset\.panel !== tab\.dataset\.panel/);
});
