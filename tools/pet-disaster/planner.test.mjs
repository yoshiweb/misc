import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('./planner.js', import.meta.url), 'utf8');
const context = { globalThis: {} };
vm.runInNewContext(source, context);
const planner = context.globalThis.PetDisasterPlanner;

test('普段の1日量と備蓄日数から必要量を計算する', () => {
    assert.deepEqual(
        { ...planner.calculateSupplies({ days: 7, dailyFood: 180, dailyWater: 500 }) },
        { days: 7, foodGrams: 1260, waterMilliliters: 3500 }
    );
});

test('不正な入力を安全な範囲へ補正する', () => {
    const result = planner.calculateSupplies({ days: 99, dailyFood: -1, dailyWater: 'abc' });
    assert.deepEqual({ ...result }, { days: 14, foodGrams: 0, waterMilliliters: 0 });
});

test('犬と猫で持ち出し品を切り替える', () => {
    const dogLabels = planner.createChecklist('dog').map(([, label]) => label);
    const catLabels = planner.createChecklist('cat').map(([, label]) => label);
    assert.ok(dogLabels.includes('予備の首輪・ハーネス・リード'));
    assert.ok(!dogLabels.includes('猫砂・簡易トイレ'));
    assert.ok(catLabels.includes('猫砂・簡易トイレ'));
    assert.ok(!catLabels.includes('予備の首輪・ハーネス・リード'));
});
