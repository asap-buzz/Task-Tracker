import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { userApi, errMsg, setAccessToken } from '../services/api.js';
import { Field, Modal } from '../components/ui.jsx';

const ZONES = (() => { const z = Intl.supportedValuesOf?.('timeZone') ?? []; return z.includes('UTC') ? z : ['UTC', ...z]; })();

export default function Settings() {
  const { user, setUser, startSession, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ username: user.username, timezone: user.timezone });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [confirming, setConfirming] = useState(false);
  const [delPw, setDelPw] = useState('');
  const [delErr, setDelErr] = useState('');
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault(); setBusy('profile');
    try { const { data } = await userApi.update(profile); setUser(data.user); toast.success('Profile updated'); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };
  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    setBusy('pw');
    try { startSession(await userApi.password(pw)); setPw({ currentPassword: '', newPassword: '' }); toast.success('Password changed'); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(''); }
  };
  const deleteAccount = async (e) => {
    e.preventDefault(); setBusy('del'); setDelErr('');
    try { await userApi.remove(delPw); setAccessToken(null); setUser(null); navigate('/'); } catch (err) { setDelErr(errMsg(err)); setBusy(''); }
  };

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <form className="card stack" onSubmit={saveProfile}>
        <h2>Profile</h2>
        <Field label="Username"><input className="input" value={profile.username} minLength={3} maxLength={30} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /></Field>
        <Field label="Email"><input className="input" value={user.email} disabled /></Field>
        <Field label="Timezone (defines when your day resets)"><select className="input" value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></Field>
        <p className="small">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        <div><button className="btn btn--primary" disabled={busy === 'profile'}>{busy === 'profile' ? 'Saving…' : 'Save profile'}</button></div>
      </form>
      <form className="card stack" onSubmit={savePassword}>
        <h2>Change password</h2>
        <Field label="Current password"><input className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></Field>
        <Field label="New password (min 8 characters)"><input className="input" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></Field>
        <div><button className="btn btn--primary" disabled={busy === 'pw'}>{busy === 'pw' ? 'Saving…' : 'Update password'}</button></div>
      </form>
      <div className="card stack"><h2>Session</h2><div><button className="btn btn--secondary" onClick={async () => { await logout(); navigate('/'); }}>Log out</button></div></div>
      <div className="card stack danger-zone"><h2>Delete account</h2><p className="muted">Permanently deletes your account, quests, habits and history. This cannot be undone.</p><div><button className="btn btn--danger" onClick={() => setConfirming(true)}>Delete my account</button></div></div>
      {confirming && (
        <Modal title="Delete account?" onClose={() => setConfirming(false)}>
          <form className="stack" onSubmit={deleteAccount}>
            <p className="muted">Enter your password to confirm. All of your data will be removed.</p>
            {delErr && <div className="alert alert--error" role="alert">{delErr}</div>}
            <input className="input" type="password" placeholder="Password" value={delPw} onChange={(e) => setDelPw(e.target.value)} autoFocus required />
            <div className="row row--end"><button type="button" className="btn btn--secondary" onClick={() => setConfirming(false)}>Cancel</button><button className="btn btn--danger" disabled={busy === 'del'}>{busy === 'del' ? 'Deleting…' : 'Delete forever'}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
