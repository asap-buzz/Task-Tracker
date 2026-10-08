import { Link, useNavigate } from 'react-router-dom';
import { Flame, Trophy, Zap, Plus, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { statsApi, questApi, habitApi, errMsg } from '../services/api.js';
import { Spinner, ErrorBox, EmptyState, XPBar, Badge } from '../components/ui.jsx';
import { QuestCard, HabitRow } from '../components/items.jsx';
import { fmtDateTime, cap, rewardMessage } from '../utils/format.js';

export const chartProps = { tick: { fill: '#A7B4C8', fontSize: 12 } };
export const tooltipStyle = { contentStyle: { background: '#131F33', border: '1px solid #3B5475', borderRadius: 8, color: '#F1F5F9' }, cursor: { fill: 'rgba(59,130,246,.08)' } };

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(() => statsApi.dashboard());

  const run = async (call) => {
    try { const { data: r } = await call(); toast.success(rewardMessage(r)); setUser(r.user); reload(); }
    catch (e) { toast.error(errMsg(e)); reload(); }
  };
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const u = data.user;
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const week = data.weeklyXp.map((d) => ({ day: new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' }), xp: d.xp }));
  const cats = data.categories.map((c) => ({ name: cap(c.category), count: c.count }));

  return (
    <>
      <div className="row row--between">
        <div><h1>Welcome back, {u.username}</h1><p className="muted"><Calendar size={14} style={{ verticalAlign: '-2px' }} /> {today} — every quest you finish makes you stronger.</p></div>
        <div className="row"><button className="btn btn--primary" onClick={() => navigate('/quests?new=1')}><Plus size={16} />Add quest</button><button className="btn btn--secondary" onClick={() => navigate('/habits?new=1')}><Plus size={16} />Add habit</button></div>
      </div>

      <section className="card hero-card">
        <div className="row" style={{ alignItems: 'center', flexWrap: 'nowrap' }}>
          <div className="level-badge"><div><small>LEVEL</small><br /><b>{u.progress.level}</b></div></div>
          <div style={{ flex: 1, minWidth: 0 }}><XPBar progress={u.progress} /><p className="small" style={{ marginTop: 6 }}>{u.progress.totalXp} total XP</p></div>
        </div>
      </section>

      <section className="grid grid--4">
        <div className="stat"><Flame size={22} /><div><b>{data.effectiveStreak}</b><span>Current streak (best {u.longestStreak})</span></div></div>
        <div className="stat"><Trophy size={22} /><div><b>{u.questsCompleted}</b><span>Quests completed</span></div></div>
        <div className="stat"><Zap size={22} /><div><b>{u.progress.totalXp}</b><span>Total XP</span></div></div>
        <div className="stat"><Calendar size={22} /><div><b>{data.habits.filter((h) => h.completedToday).length}/{data.habits.length}</b><span>Habits today</span></div></div>
      </section>

      <section className="grid grid--2">
        <div className="card"><div className="card__head"><h2>Active quests</h2><Link to="/quests">View all</Link></div>
          {data.quests.length === 0 ? <EmptyState title="No active quests" text="Create a quest to start earning XP." action={<Link className="btn btn--primary btn--sm" to="/quests?new=1">New quest</Link>} /> :
            <div className="stack">{data.quests.map((q) => <QuestCard key={q._id} quest={q} onComplete={(x) => run(() => questApi.complete(x._id))} />)}</div>}
        </div>
        <div className="card"><div className="card__head"><h2>Today's habits</h2><Link to="/habits">Manage</Link></div>
          {data.habits.length === 0 ? <EmptyState title="No habits yet" text="Add a daily habit to build a streak." action={<Link className="btn btn--primary btn--sm" to="/habits?new=1">New habit</Link>} /> :
            <div className="stack">{data.habits.map((h) => <HabitRow key={h._id} habit={h} onComplete={(x) => run(() => habitApi.complete(x._id))} />)}</div>}
        </div>
      </section>

      <section className="grid grid--2">
        <div className="card"><h2 className="card__head">XP — last 7 days</h2>
          <div style={{ height: 220 }}><ResponsiveContainer><BarChart data={week}><CartesianGrid stroke="#26354B" vertical={false} /><XAxis dataKey="day" {...chartProps} stroke="#26354B" /><YAxis {...chartProps} stroke="#26354B" allowDecimals={false} /><Tooltip {...tooltipStyle} /><Bar dataKey="xp" fill="#60A5FA" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="card"><h2 className="card__head">Completed quests by category</h2>
          {cats.length === 0 ? <EmptyState title="No data yet" text="Complete a quest to see category stats." /> :
            <div style={{ height: 220 }}><ResponsiveContainer><BarChart data={cats}><CartesianGrid stroke="#26354B" vertical={false} /><XAxis dataKey="name" {...chartProps} stroke="#26354B" /><YAxis {...chartProps} stroke="#26354B" allowDecimals={false} /><Tooltip {...tooltipStyle} /><Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}
        </div>
      </section>

      <section className="card"><h2 className="card__head">Recent activity</h2>
        {data.recent.length === 0 ? <EmptyState title="Nothing yet" text="Your completed quests and habits will appear here." /> :
          <div className="stack">{data.recent.map((a) => <div className="item" key={`${a.type}${a.id}`}><div className="item__body"><div className="item__title">{a.title}</div><div className="item__meta"><Badge>{a.type === 'quest' ? 'Quest' : 'Habit'}</Badge><span className="small">{fmtDateTime(a.at)}</span></div></div><Badge kind="xp">+{a.xp} XP</Badge></div>)}</div>}
      </section>
    </>
  );
}
