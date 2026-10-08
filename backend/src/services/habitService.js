import { Habit, HabitCompletion } from '../models/Habit.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { todayKey, addDays } from '../utils/dates.js';
import { streakFromDates } from '../utils/streak.js';
import { awardXp, recordActivity } from './xpService.js';

export async function completeHabit(userId, habitId, tz) {
  const habit = await Habit.findOne({ _id: habitId, user: userId });
  if (!habit) throw new AppError(404, 'Habit not found');
  const date = todayKey(tz); // server decides the date; clients cannot backfill
  try {
    // The unique index is the idempotency guard: a second insert for the same day fails BEFORE any XP is granted.
    await HabitCompletion.create({ habit: habit._id, user: userId, date, title: habit.title, category: habit.category, xpAwarded: habit.xpReward });
  } catch (e) {
    if (e.code === 11000) throw new AppError(409, 'Habit already completed today');
    throw e;
  }
  const { levelsGained } = await awardXp(userId, habit.xpReward);
  await recordActivity(userId, tz);
  return { date, user: await User.findById(userId), xpAwarded: habit.xpReward, levelsGained };
}

export async function habitsWithStatus(userId, tz) {
  const today = todayKey(tz);
  const since = addDays(today, -59);
  const [habits, comps] = await Promise.all([
    Habit.find({ user: userId }).sort({ createdAt: 1 }),
    HabitCompletion.find({ user: userId, date: { $gte: since } }).select('habit date'),
  ]);
  const byHabit = new Map();
  for (const c of comps) (byHabit.get(String(c.habit)) || byHabit.set(String(c.habit), []).get(String(c.habit))).push(c.date);
  return habits.map((h) => {
    const dates = byHabit.get(String(h._id)) || [];
    return { ...h.toJSON(), completedToday: dates.includes(today), streak: streakFromDates(dates, today),
      history: Array.from({ length: 14 }, (_, i) => { const d = addDays(today, i - 13); return { date: d, done: dates.includes(d) }; }) };
  });
}
