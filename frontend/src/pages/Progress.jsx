import { useState } from 'react';
import { Flame, Trophy, Zap, Medal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useFetch } from '../hooks/useFetch.js';
import { statsApi } from '../services/api.js';
import { Spinner, ErrorBox, EmptyState, XPBar, Badge } from '../components/ui.jsx';
import { chartProps, tooltipStyle } from './Dashboard.jsx';
import { CATEGORIES, cap, fmtDateTime } from '../utils/format.js';

export default function Progress() {
  const [f, setF] = useState({ type: '', category: '', from: '', to: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const dash = useFetch(() => statsApi.dashboard());
  const act = useFetch(() => statsApi.activity({ type: f.type || undefined, category: f.category || undefined, from: f.from || undefined, to: f.to || undefined }), [f.type, f.category, f.from, f.to]);

  if (dash.loading && !dash.data) return <Spinner />;
  if (dash.error) return <ErrorBox message={dash.error} onRetry={dash.reload} />;
  const { user: u, effectiveStreak, categories } = dash.data;
  const catData = categories.map((c) => ({ name: cap(c.category), xp: c.xp }));
  const list = act.data?.activity || [];

  return (
    <>
      <section className="card hero-card"><XPBar progress={u.progress} /></section>
      <section className="grid grid--4">
        <div className="stat"><Zap size={22} /><div><b>{u.progress.totalXp}</b><span>Total XP</span></div></div>
        <div className="stat"><Flame size={22} /><div><b>{effectiveStreak}</b><span>Current streak</span></div></div>
        <div className="stat"><Medal size={22} /><div><b>{u.longestStreak}</b><span>Longest streak</span></div></div>
        <div className="stat"><Trophy size={22} /><div><b>{u.questsCompleted}</b><span>Quests completed</span></div></div>
      </section>
      <section className="card"><h2 className="card__head">XP from completed quests by category</h2>
        {catData.length === 0 ? <EmptyState title="No data yet" text="Complete quests to see where your XP comes from." /> :
          <div style={{ height: 240 }}><ResponsiveContainer><BarChart data={catData}><CartesianGrid stroke="#26354B" vertical={false} /><XAxis dataKey="name" {...chartProps} stroke="#26354B" /><YAxis {...chartProps} stroke="#26354B" /><Tooltip {...tooltipStyle} /><Bar dataKey="xp" fill="#60A5FA" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}
      </section>
      <section className="card">
        <h2 className="card__head">History</h2>
        <div className="filters" style={{ marginBottom: 16 }}>
          <select className="input" value={f.type} onChange={set('type')} aria-label="Type"><option value="">Quests & habits</option><option value="quest">Quests</option><option value="habit">Habits</option></select>
          <select className="input" value={f.category} onChange={set('category')} aria-label="Category"><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}</select>
          <input className="input" type="date" value={f.from} onChange={set('from')} aria-label="From date" /><input className="input" type="date" value={f.to} onChange={set('to')} aria-label="To date" />
        </div>
        {act.loading && !act.data ? <Spinner /> : act.error ? <ErrorBox message={act.error} onRetry={act.reload} /> : list.length === 0 ? <EmptyState title="No activity found" text="Completed quests and habits show up here." /> :
          <div className="stack">{list.map((a) => <div className="item" key={`${a.type}${a.id}`}><div className="item__body"><div className="item__title">{a.title}</div><div className="item__meta"><Badge>{a.type === 'quest' ? 'Quest' : 'Habit'}</Badge><Badge>{cap(a.category)}</Badge><span className="small">{fmtDateTime(a.at)}</span></div></div><Badge kind="xp">+{a.xp} XP</Badge></div>)}</div>}
      </section>
    </>
  );
}
