import mongoose from 'mongoose';
import { CATEGORIES } from './Quest.js';

const habitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'personal' },
    xpReward: { type: Number, default: 10, min: 1 },
  },
  { timestamps: true }
);
export const Habit = mongoose.model('Habit', habitSchema);

const completionSchema = new mongoose.Schema(
  {
    habit: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD' in the user's timezone
    title: String, // snapshots so history survives habit deletion
    category: String,
    xpAwarded: { type: Number, required: true },
  },
  { timestamps: true }
);
// DB-level guarantee: one completion per habit per calendar day.
completionSchema.index({ habit: 1, date: 1 }, { unique: true });
completionSchema.index({ user: 1, date: -1 });
export const HabitCompletion = mongoose.model('HabitCompletion', completionSchema);
