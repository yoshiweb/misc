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

test('ペット向けの主要3ツールが犬・猫ガイド内に表示される', () => {
  const guideStart = html.indexOf('<section class="guide-section"');
  const guideEnd = html.indexOf('</section>', guideStart);
  const guide = html.slice(guideStart, guideEnd);

  assert.match(guide, /href="tools\/pet-welcome\/"/);
  assert.match(guide, /href="tools\/pet-timeline\/"/);
  assert.match(guide, /href="tools\/pet-end-of-life\/"/);
  assert.match(guide, /welcome-preparation\.png/);
  assert.match(guide, /growth-calendar\.png/);
  assert.match(guide, /end-of-life-notebook\.png/);
});

test('ヒーロー見出しは意図した2行に分かれている', () => {
  assert.match(html, /<span class="hero-line">毎日の「ちょっと困った」を、<\/span>/);
  assert.match(html, /<span class="hero-line"><em>よし!<\/em>に変える。<\/span>/);
});

test('用途カードと人気ツールに生成画像が組み込まれている', () => {
  const quickImages = html.match(/assets\/images\/home\/quick\/[a-z-]+\.png/g) ?? [];
  const popularImages = html.match(/assets\/images\/home\/popular-tools\/[a-z-]+\.png/g) ?? [];

  assert.equal(new Set(quickImages).size, 4);
  assert.equal(new Set(popularImages).size, 4);
  assert.doesNotMatch(html, /class="q-icon"/);
});
