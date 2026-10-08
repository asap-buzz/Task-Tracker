import { Check, Pencil, Trash2, Flame } from 'lucide-react';
import { Badge } from './ui.jsx';
import { fmtDate, isOverdue } from '../utils/format.js';

export function QuestCard({ quest, onComplete, onEdit, onDelete }) {
  const done = quest.status === 'completed';
  return (
    <div className={`item ${done ? 'item--done' : ''}`}>
      <button className={`check ${done ? 'on' : ''}`} disabled={done} onClick={() => onComplete(quest)} aria-label={done ? 'Completed' : `Complete ${quest.title}`}>{done && <Check size={15} />}</button>
      <div className="item__body">
        <div className="item__title">{quest.title}</div>
        <div className="item__meta">
          <Badge>{quest.category[0].toUpperCase() + quest.category.slice(1)}</Badge><Badge kind={quest.difficulty} /><Badge kind="xp">{quest.xpReward} XP</Badge>
          {quest.dueDate && <span className={isOverdue(quest) ? 'overdue' : 'small'}>{isOverdue(quest) ? 'Overdue · ' : 'Due '}{fmtDate(quest.dueDate)}</span>}
          {done && <span className="small">Completed {fmtDate(quest.completedAt)}</span>}
        </div>
      </div>
      {onEdit && <button className="icon-btn" onClick={() => onEdit(quest)} aria-label="Edit quest"><Pencil size={16} /></button>}
      {onDelete && <button className="icon-btn" onClick={() => onDelete(quest)} aria-label="Delete quest"><Trash2 size={16} /></button>}
    </div>
  );
}

export function HabitRow({ habit, onComplete, onEdit, onDelete, showHistory }) {
  return (
    <div className={`item ${habit.completedToday ? 'item--done' : ''}`}>
      <button className={`check ${habit.completedToday ? 'on' : ''}`} disabled={habit.completedToday} onClick={() => onComplete(habit)} aria-label={habit.completedToday ? 'Done today' : `Complete ${habit.title}`}>{habit.completedToday && <Check size={15} />}</button>
      <div className="item__body">
        <div className="item__title">{habit.title}</div>
        <div className="item__meta">
          <Badge kind="xp">{habit.xpReward} XP</Badge>
          <span className="small" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Flame size={13} />{habit.streak} day streak</span>
          {showHistory && <span className="dots" title="Last 14 days">{habit.history.map((h) => <i key={h.date} className={h.done ? 'on' : ''} title={h.date} />)}</span>}
        </div>
      </div>
      {onEdit && <button className="icon-btn" onClick={() => onEdit(habit)} aria-label="Edit habit"><Pencil size={16} /></button>}
      {onDelete && <button className="icon-btn" onClick={() => onDelete(habit)} aria-label="Delete habit"><Trash2 size={16} /></button>}
    </div>
  );
}
