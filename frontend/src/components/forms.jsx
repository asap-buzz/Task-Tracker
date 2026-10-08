import { useState } from 'react';
import { Modal, Field } from './ui.jsx';
import { CATEGORIES, DIFFICULTIES, cap } from '../utils/format.js';
import { errMsg } from '../services/api.js';

function useForm(initial, onSubmit) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const bind = (name) => ({ value: values[name] ?? '', onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })), 'aria-invalid': !!errors[name], className: 'input' });
  const submit = async (e, validate) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true); setFormError('');
    try { await onSubmit(values); } catch (err) { setFormError(errMsg(err)); setBusy(false); }
  };
  return { bind, errors, busy, formError, submit };
}

const Select = ({ options, ...p }) => <select {...p}>{options.map((o) => <option key={o} value={o}>{cap(o)}</option>)}</select>;

export function QuestForm({ quest, onSave, onClose }) {
  const editing = !!quest._id;
  const f = useForm(
    { title: quest.title || '', description: quest.description || '', category: quest.category || 'personal', difficulty: quest.difficulty || 'easy', dueDate: quest.dueDate?.slice(0, 10) || '' },
    (v) => onSave({ ...v, title: v.title.trim(), dueDate: v.dueDate || null })
  );
  const locked = editing && quest.status === 'completed';
  return (
    <Modal title={editing ? 'Edit quest' : 'New quest'} onClose={onClose}>
      <form className="stack" noValidate onSubmit={(e) => f.submit(e, (v) => (v.title.trim() ? {} : { title: 'Title is required' }))}>
        {f.formError && <div className="alert alert--error">{f.formError}</div>}
        <Field label="Title" error={f.errors.title}><input {...f.bind('title')} maxLength={120} autoFocus /></Field>
        <Field label="Description"><textarea {...f.bind('description')} maxLength={1000} /></Field>
        <div className="grid grid--2">
          <Field label="Category"><Select {...f.bind('category')} options={CATEGORIES} /></Field>
          <Field label="Difficulty"><Select {...f.bind('difficulty')} options={DIFFICULTIES} disabled={locked} /></Field>
        </div>
        <Field label="Due date (optional)"><input type="date" {...f.bind('dueDate')} /></Field>
        <p className="small">XP reward is set by difficulty: Easy 10 · Medium 25 · Hard 50.</p>
        <div className="row row--end"><button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button><button className="btn btn--primary" disabled={f.busy}>{f.busy ? 'Saving…' : 'Save quest'}</button></div>
      </form>
    </Modal>
  );
}

export function HabitForm({ habit, onSave, onClose }) {
  const editing = !!habit._id;
  const f = useForm({ title: habit.title || '', description: habit.description || '', category: habit.category || 'personal' }, (v) => onSave({ ...v, title: v.title.trim() }));
  return (
    <Modal title={editing ? 'Edit habit' : 'New habit'} onClose={onClose}>
      <form className="stack" noValidate onSubmit={(e) => f.submit(e, (v) => (v.title.trim() ? {} : { title: 'Title is required' }))}>
        {f.formError && <div className="alert alert--error">{f.formError}</div>}
        <Field label="Habit" error={f.errors.title}><input {...f.bind('title')} maxLength={120} placeholder="e.g. Read for 20 minutes" autoFocus /></Field>
        <Field label="Description"><textarea {...f.bind('description')} maxLength={500} /></Field>
        <Field label="Category"><Select {...f.bind('category')} options={CATEGORIES} /></Field>
        <p className="small">Each habit awards 10 XP once per calendar day.</p>
        <div className="row row--end"><button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button><button className="btn btn--primary" disabled={f.busy}>{f.busy ? 'Saving…' : 'Save habit'}</button></div>
      </form>
    </Modal>
  );
}
