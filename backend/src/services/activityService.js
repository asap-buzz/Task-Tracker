import { Quest } from '../models/Quest.js';
import { HabitCompletion } from '../models/Habit.js';
import { todayKey } from '../utils/dates.js';

// Unified, newest-first feed of completed quests + habit completions.
export async function buildActivity(userId, tz, { type, category, since, until, limit = 200 } = {}) {
  const range = (field) => (since || until ? { [field]: { ...(since && { $gte: since }), ...(until && { $lte: until }) } } : {});
  const cat = category ? { category } : {};
  const [quests, habits] = await Promise.all([
    type === 'habit' ? [] : Quest.find({ user: userId, status: 'completed', ...cat, ...range('completedAt') }).sort({ completedAt: -1 }).limit(limit),
    type === 'quest' ? [] : HabitCompletion.find({ user: userId, ...cat, ...range('createdAt') }).sort({ createdAt: -1 }).limit(limit),
  ]);
  return [
    ...quests.map((q) => ({ type: 'quest', id: String(q._id), title: q.title, category: q.category, xp: q.xpReward, at: q.completedAt })),
    ...habits.map((h) => ({ type: 'habit', id: String(h._id), title: h.title, category: h.category, xp: h.xpAwarded, at: h.createdAt })),
  ].sort((a, b) => b.at - a.at).slice(0, limit).map((e) => ({ ...e, date: todayKey(tz, e.at) }));
}
