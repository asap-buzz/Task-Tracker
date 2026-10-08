import { Link } from 'react-router-dom';
import { Shield, Swords, Repeat, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { XPBar } from '../components/ui.jsx';

const FEATURES = [
  { icon: Swords, title: 'Quests', text: 'Turn real responsibilities into quests with categories, difficulty and due dates.' },
  { icon: Repeat, title: 'Daily habits', text: 'Check off habits once per calendar day and keep your history visible.' },
  { icon: Flame, title: 'Streaks & levels', text: 'Earn XP, level up automatically and keep your daily streak alive.' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="landing">
      <nav>
        <div className="logo" style={{ padding: 0 }}><Shield size={22} /> Life RPG</div>
        <div className="row">{user ? <Link className="btn btn--primary" to="/dashboard">Open dashboard</Link> : <><Link className="btn btn--ghost" to="/login">Log in</Link><Link className="btn btn--primary" to="/register">Get started</Link></>}</div>
      </nav>
      <section className="hero">
        <div>
          <h1>Level up your real life.</h1>
          <p className="muted">Life RPG turns your goals, chores and habits into quests. Earn XP, build streaks and watch your character grow with every task you finish.</p>
          <Link className="btn btn--primary" to={user ? '/dashboard' : '/register'}>Create your character</Link>
        </div>
        <div className="card hero-card stack" aria-label="Sample preview">
          <span className="small">SAMPLE PREVIEW</span>
          <XPBar progress={{ level: 4, xpIntoLevel: 120, xpForNextLevel: 200, percent: 60 }} />
          <div className="item"><span className="check on" /><div className="item__body"><div className="item__title">Finish chapter 3</div></div></div>
          <div className="item"><span className="check" /><div className="item__body"><div className="item__title">Workout</div></div></div>
        </div>
      </section>
      <section className="features">
        {FEATURES.map(({ icon: Icon, title, text }) => <div className="card" key={title}><Icon size={22} /><h3>{title}</h3><p className="muted">{text}</p></div>)}
      </section>
    </div>
  );
}
