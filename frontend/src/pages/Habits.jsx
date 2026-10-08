import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { habitApi, errMsg } from '../services/api.js';
import { Spinner, ErrorBox, EmptyState, ConfirmDialog } from '../components/ui.jsx';
import { HabitRow } from '../components/items.jsx';
import { HabitForm } from '../components/forms.jsx';
import { rewardMessage } from '../utils/format.js';

export default function Habits() {
  const { setUser } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, reload } = useFetch(() => habitApi.list());
  useEffect(() => { if (params.get('new')) { setEditing({}); setParams({}, { replace: true }); } }, [params, setParams]);

  const save = async (values) => {
    if (editing._id) await habitApi.update(editing._id, values); else await habitApi.create(values);
    toast.success(editing._id ? 'Habit updated' : 'Habit created'); setEditing(null); reload();
  };
  const complete = async (h) => {
    try { const { data: r } = await habitApi.complete(h._id); toast.success(rewardMessage(r)); setUser(r.user); } catch (e) { toast.error(errMsg(e)); }
    reload();
  };
  const remove = async () => {
    setBusy(true);
    try { await habitApi.remove(deleting._id); toast.success('Habit deleted'); setDeleting(null); reload(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const habits = data?.habits || [];
  const done = habits.filter((h) => h.completedToday).length;

  return (
    <>
      <div className="row row--between"><p className="muted">{habits.length ? `${done} of ${habits.length} completed today. The checklist resets at midnight in your timezone.` : 'Build routines that earn XP every day.'}</p><button className="btn btn--primary" onClick={() => setEditing({})}><Plus size={16} />New habit</button></div>
      {loading && !data ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : habits.length === 0 ?
        <div className="card"><EmptyState title="No habits yet" text="Try “Read for 20 minutes” or “Exercise”." action={<button className="btn btn--primary btn--sm" onClick={() => setEditing({})}>New habit</button>} /></div> :
        <div className="stack">{habits.map((h) => <HabitRow key={h._id} habit={h} showHistory onComplete={complete} onEdit={setEditing} onDelete={setDeleting} />)}</div>}
      {editing && <HabitForm habit={editing} onSave={save} onClose={() => setEditing(null)} />}
      {deleting && <ConfirmDialog title="Delete habit?" message={`"${deleting.title}" and its completion history will be deleted. XP you already earned is kept.`} busy={busy} onConfirm={remove} onClose={() => setDeleting(null)} />}
    </>
  );
}
