import { Quest } from '../models/Quest.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { awardXp, recordActivity } from './xpService.js';

/**
 * Idempotent completion: the active->completed flip is one atomic findOneAndUpdate guarded
 * by status:'active', so of N repeated/concurrent requests exactly one wins and awards XP.
 */
export async function completeQuest(userId, questId, tz) {
  const quest = await Quest.findOneAndUpdate(
    { _id: questId, user: userId, status: 'active' },
    { $set: { status: 'completed', completedAt: new Date() } },
    { new: true }
  );
  if (!quest) {
    const owned = await Quest.exists({ _id: questId, user: userId });
    throw new AppError(owned ? 409 : 404, owned ? 'Quest already completed' : 'Quest not found');
  }
  const { levelsGained } = await awardXp(userId, quest.xpReward, { quest: true });
  await recordActivity(userId, tz);
  return { quest, user: await User.findById(userId), xpAwarded: quest.xpReward, levelsGained };
}
