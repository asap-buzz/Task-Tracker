import { Quest, CATEGORIES, DIFFICULTIES } from '../models/Quest.js';
import { AppError } from '../utils/AppError.js';
import { DIFFICULTY_XP } from '../utils/leveling.js';
import { completeQuest } from '../services/questService.js';

const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
const EDITABLE = ['title', 'description', 'category', 'difficulty', 'dueDate']; // mass-assignment whitelist

export async function listQuests(req, res) {
  const filter = { user: req.user.id };
  const { category, difficulty, status } = req.query;
  if (CATEGORIES.includes(category)) filter.category = category;
  if (DIFFICULTIES.includes(difficulty)) filter.difficulty = difficulty;
  if (['active', 'completed'].includes(status)) filter.status = status;
  res.json({ quests: await Quest.find(filter).sort({ createdAt: -1 }) });
}

export async function createQuest(req, res) {
  const data = pick(req.body, EDITABLE);
  const quest = await Quest.create({ ...data, user: req.user.id, xpReward: DIFFICULTY_XP[data.difficulty || 'easy'] });
  res.status(201).json({ quest });
}

export async function getQuest(req, res) {
  const quest = await Quest.findOne({ _id: req.params.id, user: req.user.id });
  if (!quest) throw new AppError(404, 'Quest not found');
  res.json({ quest });
}

export async function updateQuest(req, res) {
  const quest = await Quest.findOne({ _id: req.params.id, user: req.user.id });
  if (!quest) throw new AppError(404, 'Quest not found');
  const data = pick(req.body, EDITABLE);
  // Completed quests keep their awarded reward: no difficulty/XP edits after completion.
  if (quest.status === 'completed' && data.difficulty && data.difficulty !== quest.difficulty)
    throw new AppError(409, 'Cannot change difficulty of a completed quest');
  Object.assign(quest, data);
  if (quest.status === 'active' && data.difficulty) quest.xpReward = DIFFICULTY_XP[data.difficulty];
  await quest.save();
  res.json({ quest });
}

export async function deleteQuest(req, res) {
  // Deleting never refunds or re-awards XP; totalXp lives on the user.
  const deleted = await Quest.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!deleted) throw new AppError(404, 'Quest not found');
  res.status(204).end();
}

export async function complete(req, res) {
  const { quest, user, xpAwarded, levelsGained } = await completeQuest(req.user.id, req.params.id);
  res.json({ quest, user, xpAwarded, levelsGained });
}
