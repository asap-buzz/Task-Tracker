import test from 'node:test';
import assert from 'node:assert/strict';
import { xpForLevel, levelFromXp, progressFromXp } from '../src/utils/leveling.js';

test('level 1 starts at 0 XP and thresholds strictly increase', () => {
  assert.equal(xpForLevel(1), 0);
  for (let l = 1; l < 50; l++) assert.ok(xpForLevel(l + 1) > xpForLevel(l));
});

test('levelFromXp is exact at and just below each threshold', () => {
  for (let l = 2; l <= 30; l++) {
    assert.equal(levelFromXp(xpForLevel(l)), l);
    assert.equal(levelFromXp(xpForLevel(l) - 1), l - 1);
  }
});

test('a single large reward can cross multiple levels', () => {
  assert.ok(levelFromXp(0 + 1000) - levelFromXp(0) >= 3);
});

test('progressFromXp reports consistent in-level values', () => {
  const p = progressFromXp(xpForLevel(3) + 5);
  assert.equal(p.level, 3);
  assert.equal(p.xpIntoLevel, 5);
  assert.ok(p.percent >= 0 && p.percent < 100);
});
