import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('./apex-car-preview.html',import.meta.url),'utf8');

test('Apex car preview is a standalone low-poly Three.js showcase',()=>{
  assert.match(html,/APEX <span>RAPTOR/);
  assert.match(html,/PREVIEW ONLY · GAME NOT CHANGED/);
  assert.match(html,/three@0\.181\.2\/build\/three\.module\.js/);
  assert.match(html,/function wedgeGeometry/);
  assert.match(html,/flatShading:true/);
  assert.match(html,/pointerdown/);
  assert.match(html,/data-color="0x35d9e5"/);
  assert.match(html,/key-visual\.png/);
  assert.doesNotMatch(html,/apex-circuit\.html/);
});
