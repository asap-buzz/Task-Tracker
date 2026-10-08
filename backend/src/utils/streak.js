import { dayDiff, addDays } from './dates.js';

// Active day = a day on which the user completed at least one quest OR one habit.
export function advanceStreak({ currentStreak = 0, longestStreak = 0, lastActiveDate = null }, today) {
  if (lastActiveDate && lastActiveDate >= today) return { currentStreak, longestStreak, lastActiveDate, changed: false };
  const current = lastActiveDate && dayDiff(lastActiveDate, today) === 1 ? currentStreak + 1 : 1;
  return { currentStreak: current, longestStreak: Math.max(longestStreak, current), lastActiveDate: today, changed: true };
}

// A stored streak is still alive only if the last active day was today or yesterday.
export function effectiveStreak({ currentStreak = 0, lastActiveDate = null }, today) {
  if (!lastActiveDate) return 0;
  return dayDiff(lastActiveDate, today) <= 1 ? currentStreak : 0;
}

// Per-habit streak from its completion dates (consecutive days ending today or yesterday).
export function streakFromDates(dates, today) {
  const set = new Set(dates);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(cursor)) { n++; cursor = addDays(cursor, -1); }
  return n;
}
