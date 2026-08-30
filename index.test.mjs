import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');

test('もっと見るは4カテゴリーを常時表示する', () => {
  const moreStart = html.indexOf('<section class="more"');
  const moreEnd = html.indexOf('<section class="game-lab"', moreStart);
  const more = html.slice(moreStart, moreEnd);
  const categories = more.match(/class="tool-category"/g) ?? [];

  assert.equal(categories.length, 4);
  assert.match(html, /id="category-media">画像・PDF/);
  assert.match(html, /id="category-video">動画/);
  assert.match(html, /id="category-life">暮らし/);
  assert.match(html, /id="category-work">仕事/);
  assert.doesNotMatch(more, /role="tab"/);
  assert.doesNotMatch(more, /class="more-link"/);
  assert.doesNotMatch(more, /\shidden(?:\s|>)/);
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

test('犬種一覧と猫種一覧が1つのガイドにまとまっている', () => {
  const guideStart = html.indexOf('<section class="guide-section"');
  const guideEnd = html.indexOf('</section>', guideStart);
  const guide = html.slice(guideStart, guideEnd);

  assert.equal((guide.match(/class="guide-card"/g) ?? []).length, 1);
  assert.match(guide, /犬種・猫種ガイド/);
  assert.match(guide, /うちの子を迎え入れる前に犬種／猫種による傾向を認識し/);
  assert.match(guide, /href="tools\/pet-welcome\/breeds\/dog\/">犬種一覧/);
  assert.match(guide, /href="tools\/pet-welcome\/breeds\/cat\/">猫種一覧/);
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

test('人気ツールの画像領域と文字領域が分離されている', () => {
  assert.match(html, /\.tool-visual\{[^}]*overflow:hidden/);
  assert.match(html, /\.tool-body\{[^}]*z-index:2/);
  assert.match(html, /\.tool-body\{[^}]*background:#fff/);
});
