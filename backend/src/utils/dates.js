// All "calendar day" logic uses 'YYYY-MM-DD' strings computed in the USER'S timezone.
export const isValidTimezone = (tz) => {
  try { new Intl.DateTimeFormat('en-CA', { timeZone: tz }); return true; } catch { return false; }
};
export const todayKey = (tz = 'UTC', now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: isValidTimezone(tz) ? tz : 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
const toDay = (key) => { const [y, m, d] = key.split('-').map(Number); return Date.UTC(y, m - 1, d) / 86400000; };
export const dayDiff = (a, b) => toDay(b) - toDay(a);
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
