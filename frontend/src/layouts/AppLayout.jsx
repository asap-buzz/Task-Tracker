import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Swords, Repeat, TrendingUp, Settings, LogOut, Menu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/quests', label: 'Quests', icon: Swords },
  { to: '/habits', label: 'Habits', icon: Repeat },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => setOpen(false), [pathname]);
  const title = LINKS.find((l) => pathname.startsWith(l.to))?.label ?? '';

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="logo"><Shield size={22} /> Life RPG</div>
        <nav className="nav">
          {LINKS.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={18} />{label}</NavLink>)}
        </nav>
        <button className="btn btn--ghost" style={{ marginTop: 'auto', justifyContent: 'flex-start' }} onClick={async () => { await logout(); navigate('/'); }}>
          <LogOut size={18} /> Log out
        </button>
      </aside>
      <div className={`backdrop ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <div className="row">
            <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <h1>{title}</h1>
          </div>
          <div className="user-chip"><span className="name">{user.username} · Lv {user.progress.level}</span><div className="avatar">{user.username[0].toUpperCase()}</div></div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
