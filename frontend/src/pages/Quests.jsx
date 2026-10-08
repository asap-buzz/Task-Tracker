import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { questApi, errMsg } from '../services/api.js';
import { Spinner, ErrorBox, EmptyState, ConfirmDialog } from '../components/ui.jsx';
import { QuestCard } from '../components/items.jsx';
import { QuestForm } from '../components/forms.jsx';
import { CATEGORIES, DIFFICULTIES, cap, rewardMessage } from '../utils/format.js';

export default function Quests() {
  const { setUser } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [f, setF] = useState({ category: '', difficulty: '', status: '', q: '' });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useFetch(() => questApi.list({ category: f.category || undefined, difficulty: f.difficulty || undefined, status: f.status || undefined }), [f.category, f.difficulty, f.status]);

  useEffect(() => { if (params.get('new')) { setEditing({}); setParams({}, { replace: true }); } }, [params, setParams]);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const save = async (values) => {
    if (editing._id) await questApi.update(editing._id, values); else await questApi.create(values);
    toast.success(editing._id ? 'Quest updated' : 'Quest created');
    setEditing(null); reload();
  };
  const complete = async (q) => {
    try { const { data: r } = await questApi.complete(q._id); toast.success(rewardMessage(r)); setUser(r.user); } catch (e) { toast.error(errMsg(e)); }
    reload();
  };
  const remove = async () => {
    setBusy(true);
    try { await questApi.remove(deleting._id); toast.success('Quest deleted'); setDeleting(null); reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const quests = (data?.quests || []).filter((q) => q.title.toLowerCase().includes(f.q.toLowerCase()));

  return (
    <>
      <div className="row row--between"><p className="muted">Create, track and complete your quests.</p><button className="btn btn--primary" onClick={() => setEditing({})}><Plus size={16} />New quest</button></div>
      <div className="filters">
        <div style={{ position: 'relative' }}><Search size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--muted)' }} /><input className="input" style={{ paddingLeft: 32 }} placeholder="Search quests" value={f.q} onChange={set('q')} aria-label="Search quests" /></div>
        <select className="input" value={f.category} onChange={set('category')} aria-label="Category"><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}</select>
        <select className="input" value={f.difficulty} onChange={set('difficulty')} aria-label="Difficulty"><option value="">All difficulties</option>{DIFFICULTIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}</select>
        <select className="input" value={f.status} onChange={set('status')} aria-label="Status"><option value="">Any status</option><option value="active">Active</option><option value="completed">Completed</option></select>
      </div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : quests.length === 0 ?
        <div className="card"><EmptyState title="No quests found" text="Adjust your filters or create a new quest." action={<button className="btn btn--primary btn--sm" onClick={() => setEditing({})}>New quest</button>} /></div> :
        <div className="stack">{quests.map((q) => <QuestCard key={q._id} quest={q} onComplete={complete} onEdit={setEditing} onDelete={setDeleting} />)}</div>}
      {editing && <QuestForm quest={editing} onSave={save} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDialog title="Delete quest?" message={`"${deleting.title}" will be permanently deleted. XP you already earned is kept.`} busy={busy} onConfirm={remove} onClose={() => setDeleting(null)} />}
    </>
  );
}
