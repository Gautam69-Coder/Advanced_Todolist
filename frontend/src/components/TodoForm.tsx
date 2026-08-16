import React, { useState, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { TactileButton } from './TactileButton';
import type { Todo } from '../types';

interface TodoFormProps {
  onSubmit: (title: string) => void;
  editingTodo?: Todo | null;
  onCancelEdit?: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  onSubmit,
  editingTodo = null,
  onCancelEdit,
}) => {
  const [title, setTitle] = useState('');

  // Pre-populate input when editingTodo changes
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
    } else {
      setTitle('');
    }
  }, [editingTodo]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim());
    setTitle('');
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="bg-neu-bg p-4 rounded-3xl shadow-neu-out border border-neu-border w-full flex gap-3 select-none"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={editingTodo ? "Update task title..." : "Add a new task..."}
        required
        maxLength={100}
        className="shadow-neu-in border border-neu-border focus:border-accent bg-neu-bg text-neu-text text-sm rounded-2xl p-3.5 flex-1 outline-none transition-all placeholder-neu-text-muted/40 font-medium"
      />
      
      <div className="flex gap-2">
        {/* Cancel Edit Button */}
        {editingTodo && onCancelEdit && (
          <TactileButton
            type="button"
            onClick={onCancelEdit}
            className="w-12 h-12 rounded-2xl shadow-neu-out flex items-center justify-center shrink-0 hover:bg-rose-500/5 text-neu-text-muted hover:text-rose-500"
            aria-label="Cancel edit"
          >
            <X className="w-5 h-5" />
          </TactileButton>
        )}

        {/* Submit Action Button */}
        <TactileButton
          type="submit"
          accent
          className="w-12 h-12 rounded-2xl shadow-neu-out flex items-center justify-center shrink-0"
          aria-label={editingTodo ? "Apply task changes" : "Add task"}
        >
          {editingTodo ? (
            <Check className="w-5 h-5 text-accent" />
          ) : (
            <Plus className="w-5 h-5 text-accent" />
          )}
        </TactileButton>
      </div>
    </form>
  );
};
