import mongoose from 'mongoose';

export const CATEGORIES = ['health', 'learning', 'career', 'personal', 'discipline'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];

const questSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    category: { type: String, enum: CATEGORIES, default: 'personal' },
    difficulty: { type: String, enum: DIFFICULTIES, default: 'easy' },
    xpReward: { type: Number, required: true, min: 1 }, // server-derived from difficulty
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

questSchema.index({ user: 1, status: 1, createdAt: -1 });

export const Quest = mongoose.model('Quest', questSchema);
