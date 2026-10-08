import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { progressFromXp } from '../utils/leveling.js';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    totalXp: { type: Number, default: 0, min: 0 },
    questsCompleted: { type: Number, default: 0, min: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null }, // 'YYYY-MM-DD' (streaks: step 2)
    tokenVersion: { type: Number, default: 0 }, // bump to revoke all refresh tokens
    timezone: { type: String, default: 'UTC' }, // IANA zone; defines what 'today' means for this user
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 12);

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.tokenVersion;
    delete ret.__v;
    delete ret.id;
    ret.progress = progressFromXp(ret.totalXp);
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
