// Single source of truth for progression. Level is DERIVED from totalXp, never stored.
// Total XP needed to reach level L = round(BASE * (L-1)^EXPONENT)  (L1 = 0 XP)
export const LEVEL_BASE_XP = 100;
export const LEVEL_EXPONENT = 1.6;
export const DIFFICULTY_XP = { easy: 10, medium: 25, hard: 50 };

export const xpForLevel = (level) =>
  level <= 1 ? 0 : Math.round(LEVEL_BASE_XP * Math.pow(level - 1, LEVEL_EXPONENT));

// Loops, so a single large reward can cross multiple thresholds.
export function levelFromXp(totalXp) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  return level;
}

export function progressFromXp(totalXp) {
  const level = levelFromXp(totalXp);
  const floor = xpForLevel(level);
  const span = xpForLevel(level + 1) - floor;
  const into = totalXp - floor;
  return { level, totalXp, xpIntoLevel: into, xpForNextLevel: span, percent: Math.floor((into / span) * 100) };
}
