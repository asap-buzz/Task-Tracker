import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceStreak, effectiveStreak, streakFromDates } from '../src/utils/streak.js';
import { todayKey, addDays, dayDiff } from '../src/utils/dates.js';

test('first activity starts a streak of 1', () => {
  const s = advanceStreak({}, '2026-03-10');
  assert.deepEqual([s.currentStreak, s.longestStreak, s.changed], [1, 1, true]);
});
test('same-day repeats do not increase the streak', () => {
  const s = advanceStreak({ currentStreak: 3, longestStreak: 3, lastActiveDate: '2026-03-10' }, '2026-03-10');
  assert.equal(s.currentStreak, 3); assert.equal(s.changed, false);
});
test('consecutive day increments, longest tracks max', () => {
  const s = advanceStreak({ currentStreak: 3, longestStreak: 3, lastActiveDate: '2026-03-09' }, '2026-03-10');
  assert.deepEqual([s.currentStreak, s.longestStreak], [4, 4]);
});
test('missed day resets current but keeps longest', () => {
  const s = advanceStreak({ currentStreak: 5, longestStreak: 9, lastActiveDate: '2026-03-07' }, '2026-03-10');
  assert.deepEqual([s.currentStreak, s.longestStreak], [1, 9]);
});
test('effectiveStreak is 0 once a day has been missed', () => {
  const u = { currentStreak: 5, lastActiveDate: '2026-03-08' };
  assert.equal(effectiveStreak(u, '2026-03-09'), 5);
  assert.equal(effectiveStreak(u, '2026-03-10'), 0);
});
test('streakFromDates counts back from today or yesterday', () => {
  assert.equal(streakFromDates(['2026-03-10', '2026-03-09', '2026-03-08', '2026-03-05'], '2026-03-10'), 3);
  assert.equal(streakFromDates(['2026-03-09', '2026-03-08'], '2026-03-10'), 2);
  assert.equal(streakFromDates(['2026-03-07'], '2026-03-10'), 0);
});
test('dates handle month/year boundaries and timezones', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(dayDiff('2026-02-28', '2026-03-01'), 1);
  const instant = new Date('2026-03-10T23:30:00Z');
  assert.equal(todayKey('UTC', instant), '2026-03-10');
  assert.equal(todayKey('Asia/Kolkata', instant), '2026-03-11'); // already next day in IST
  assert.equal(todayKey('Not/AZone', instant), '2026-03-10'); // invalid tz falls back to UTC
});
