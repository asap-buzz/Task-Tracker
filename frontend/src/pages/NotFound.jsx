import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-wrap"><div className="card auth-card stack" style={{ textAlign: 'center' }}>
      <h1>404 — Page not found</h1><p className="muted">This part of the map hasn't been explored.</p>
      <Link className="btn btn--primary" to="/">Back to start</Link>
    </div></div>
  );
}
