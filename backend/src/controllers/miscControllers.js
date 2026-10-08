import { Habit, HabitCompletion } from '../models/Habit.js';
import { Quest } from '../models/Quest.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { todayKey, addDays } from '../utils/dates.js';
import { effectiveStreak } from '../utils/streak.js';
import { habitsWithStatus, completeHabit } from '../services/habitService.js';
import { buildActivity } from '../services/activityService.js';
import { issueSession, cookieOpts } from './authController.js';

const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const HABIT_FIELDS = ['title', 'description', 'category'];

// ---- habits
export const listHabits = async (req, res) => res.json({ habits: await habitsWithStatus(req.user.id, req.user.timezone) });
export async function createHabit(req, res) {
  res.status(201).json({ habit: await Habit.create({ ...pick(req.body, HABIT_FIELDS), user: req.user.id }) });
}
export async function updateHabit(req, res) {
  const habit = await Habit.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, { $set: pick(req.body, HABIT_FIELDS) }, { new: true, runValidators: true });
  if (!habit) throw new AppError(404, 'Habit not found');
  res.json({ habit });
}
export async function deleteHabit(req, res) {
  const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!habit) throw new AppError(404, 'Habit not found');
  await HabitCompletion.deleteMany({ habit: habit._id });
  res.status(204).end();
}
export async function completeHabitCtrl(req, res) {
  res.json(await completeHabit(req.user.id, req.params.id, req.user.timezone));
}

// ---- dashboard + activity
export async function dashboard(req, res) {
  const tz = req.user.timezone;
  const today = todayKey(tz);
  const weekStart = new Date(Date.now() - 8 * 86400000);
  const [habits, active, cats, feed] = await Promise.all([
    habitsWithStatus(req.user.id, tz),
    Quest.find({ user: req.user.id, status: 'active' }).sort({ createdAt: -1 }).limit(50),
    Quest.aggregate([{ $match: { user: req.user._id, status: 'completed' } }, { $group: { _id: '$category', count: { $sum: 1 }, xp: { $sum: '$xpReward' } } }]),
    buildActivity(req.user.id, tz, { since: weekStart }),
  ]);
  const quests = active.sort((a, b) => (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity)).slice(0, 6);
  const weeklyXp = Array.from({ length: 7 }, (_, i) => { const date = addDays(today, i - 6); return { date, xp: feed.filter((e) => e.date === date).reduce((s, e) => s + e.xp, 0) }; });
  res.json({
    user: req.user, today, effectiveStreak: effectiveStreak(req.user, today),
    quests, habits, weeklyXp, recent: feed.slice(0, 8),
    categories: cats.map((c) => ({ category: c._id, count: c.count, xp: c.xp })),
  });
}
export async function activity(req, res) {
  const { type, category, from, to } = req.query;
  res.json({ activity: await buildActivity(req.user.id, req.user.timezone, {
    type: ['quest', 'habit'].includes(type) ? type : undefined, category: category || undefined,
    since: from ? new Date(from) : undefined, until: to ? new Date(`${to}T23:59:59.999Z`) : undefined }) });
}

// ---- users / settings
export const getMe = (req, res) => res.json({ user: req.user });
export async function updateMe(req, res) {
  const user = await User.findByIdAndUpdate(req.user.id, { $set: pick(req.body, ['username', 'timezone']) }, { new: true, runValidators: true });
  res.json({ user });
}
export async function changePassword(req, res) {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!(await user.verifyPassword(req.body.currentPassword))) throw new AppError(401, 'Current password is incorrect');
  user.passwordHash = await User.hashPassword(req.body.newPassword);
  user.tokenVersion += 1; // signs out every other session
  await user.save();
  issueSession(res, user);
}
export async function deleteMe(req, res) {
  const user = await User.findById(req.user.id).select('+passwordHash');
  if (!(await user.verifyPassword(req.body.password))) throw new AppError(401, 'Password is incorrect');
  await Promise.all([Quest.deleteMany({ user: user._id }), Habit.deleteMany({ user: user._id }), HabitCompletion.deleteMany({ user: user._id })]);
  await user.deleteOne();
  res.clearCookie('refreshToken', { ...cookieOpts, maxAge: undefined });
  res.status(204).end();
}
