import { User } from '../models/User.js';
import { levelFromXp } from '../utils/leveling.js';
import { todayKey } from '../utils/dates.js';
import { advanceStreak } from '../utils/streak.js';

export async function awardXp(userId, xp, { quest = false } = {}) {
  const user = await User.findByIdAndUpdate(userId, { $inc: { totalXp: xp, questsCompleted: quest ? 1 : 0 } }, { new: true });
  return { user, levelsGained: levelFromXp(user.totalXp) - levelFromXp(user.totalXp - xp) };
}

// Optimistic concurrency: the write only applies if lastActiveDate is unchanged since we read it.
export async function recordActivity(userId, tz) {
  const today = todayKey(tz);
  for (let i = 0; i < 3; i++) {
    const u = await User.findById(userId).select('currentStreak longestStreak lastActiveDate');
    if (!u) return;
    const next = advanceStreak(u, today);
    if (!next.changed) return;
    const { changed, ...set } = next;
    if (await User.findOneAndUpdate({ _id: userId, lastActiveDate: u.lastActiveDate }, { $set: set })) return;
  }
}
