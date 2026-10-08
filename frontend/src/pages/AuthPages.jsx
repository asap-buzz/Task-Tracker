import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Field } from '../components/ui.jsx';
import { errMsg } from '../services/api.js';

function AuthForm({ mode }) {
  const isReg = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [v, setV] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (isReg && v.username.trim().length < 3) errs.username = 'At least 3 characters';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) errs.email = 'Enter a valid email';
    if (v.password.length < (isReg ? 8 : 1)) errs.password = isReg ? 'At least 8 characters' : 'Password required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setError('');
    try {
      await (isReg ? register({ username: v.username.trim(), email: v.email.trim(), password: v.password }) : login({ email: v.email.trim(), password: v.password }));
      navigate('/dashboard');
    } catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card stack" onSubmit={submit} noValidate>
        <div className="logo" style={{ padding: 0 }}><Shield size={22} /> Life RPG</div>
        <div><h1>{isReg ? 'Create your character' : 'Welcome back'}</h1><p className="muted">{isReg ? 'Start turning your goals into quests.' : 'Log in to continue your journey.'}</p></div>
        {error && <div className="alert alert--error" role="alert">{error}</div>}
        {isReg && <Field label="Username" error={errors.username}><input className="input" value={v.username} onChange={set('username')} autoComplete="username" aria-invalid={!!errors.username} /></Field>}
        <Field label="Email" error={errors.email}><input className="input" type="email" value={v.email} onChange={set('email')} autoComplete="email" aria-invalid={!!errors.email} /></Field>
        <Field label="Password" error={errors.password}><input className="input" type="password" value={v.password} onChange={set('password')} autoComplete={isReg ? 'new-password' : 'current-password'} aria-invalid={!!errors.password} /></Field>
        <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Log in'}</button>
        <p className="small" style={{ textAlign: 'center' }}>{isReg ? <>Already have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p>
      </form>
    </div>
  );
}
export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
