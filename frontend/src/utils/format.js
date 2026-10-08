export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '');
export const fmtDateTime = (iso) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
export const CATEGORIES = ['health', 'learning', 'career', 'personal', 'discipline'];
export const DIFFICULTIES = ['easy', 'medium', 'hard'];
export const isOverdue = (q) => q.status === 'active' && q.dueDate && new Date(q.dueDate) < new Date(new Date().toDateString());
export const rewardMessage = (r) => `+${r.xpAwarded} XP${r.levelsGained > 0 ? ` — Level up! You are now level ${r.user.progress.level}` : ''}`;
