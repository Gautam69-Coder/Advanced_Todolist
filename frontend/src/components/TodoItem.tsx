import React from 'react';
import { Check, Trash2, Edit3, Calendar } from 'lucide-react';
import type { Todo } from '../types';
import { TactileButton } from './TactileButton';
import { audioService } from '../utils/audio';

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  const handleToggleClick = () => {
    const nextCompleted = !todo.completed;
    if (nextCompleted) {
      audioService.playComplete();
    } else {
      audioService.playToggle(false);
    }
    onToggleComplete(todo.id);
  };

  const handleDeleteClick = () => {
    audioService.playToggle(false);
    onDelete(todo.id);
  };

  const handleEditClick = () => {
    audioService.playClick();
    onEdit(todo);
  };

  const formatCreationTime = (isoString: string) => {
    const d = new Date(isoString);
    const day = d.toLocaleDateString(undefined, { weekday: 'long' });
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${time}`;
  };

  return (
    <div
      className={`bg-neu-bg rounded-3xl p-4 border border-neu-border shadow-neu-out flex flex-col gap-2 transition-all duration-300 ${
        todo.completed ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Checkbox */}
          <button
            type="button"
            onClick={handleToggleClick}
            className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center cursor-pointer transition-all duration-300 outline-none border ${
              todo.completed
                ? 'shadow-neu-sm-in border-transparent bg-accent/5'
                : 'shadow-neu-sm-out border-neu-border bg-neu-bg hover:scale-105'
          }`}
          aria-label={todo.completed ? 'Mark task incomplete' : 'Mark task complete'}
        >
          {todo.completed && (
            <Check className="w-4 h-4 text-accent stroke-[3]" />
          )}
        </button>

        {/* Title */}
        <span
          className={`text-sm font-bold text-neu-text tracking-wide break-words pr-2 transition-all duration-300 select-none ${
            todo.completed ? 'line-through text-neu-text-muted opacity-50' : ''
          }`}
        >
          {todo.title}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Edit Button */}
        <TactileButton
          onClick={handleEditClick}
          className="w-8 h-8 rounded-full"
          title="Edit task settings"
        >
          <Edit3 className="w-3.5 h-3.5 text-neu-text-muted hover:text-accent" />
        </TactileButton>

        {/* Delete Button */}
        <TactileButton
          onClick={handleDeleteClick}
          className="w-8 h-8 rounded-full hover:bg-rose-500/5"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5 text-neu-text-muted hover:text-rose-500" />
        </TactileButton>
      </div>
    </div>

    {/* Creation Timestamp Label */}
    <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-neu-text-muted select-none border-t border-neu-border/30 pt-2 mt-1">
      <Calendar className="w-3 h-3 text-accent" />
      <span>Created: {formatCreationTime(todo.createdAt)}</span>
    </div>
  </div>
  );
};
