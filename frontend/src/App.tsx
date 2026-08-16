import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Sun, Moon, CheckCircle2, ListTodo, BarChart2, History, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import type { Todo, Theme, AccentColor, ActiveTab } from './types';
import { TactileButton } from './components/TactileButton';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { WeeklyChart } from './components/WeeklyChart';
import { HistoryTimeline } from './components/HistoryTimeline';
import { audioService } from './utils/audio';

const API_URL = 'https://advanced-todolist-r0re.onrender.com/api/todos';
// const API_URL = 'http://localhost:5000/api/todos';

export const App: React.FC = () => {
  // --- Persistent Storage State & Network State ---
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('neu-todo-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    try {
      const saved = localStorage.getItem('neu-todo-accent');
      return (saved as AccentColor) || 'blue';
    } catch {
      return 'blue';
    }
  });

  const [isMuted, setIsMuted] = useState(() => audioService.isMuted());
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // --- Fetch API on load ---
  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Todo[]>(API_URL);
      setTodos(response.data);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Cannot connect to MongoDB server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // --- Theme/Accent Sync Effects ---
  useEffect(() => {
    localStorage.setItem('neu-todo-theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('neu-todo-accent', accentColor);
    const root = window.document.documentElement;
    root.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  // --- Handlers ---
  const handleFormSubmit = async (title: string) => {
    if (editingTodo) {
      try {
        const response = await axios.put<Todo>(`${API_URL}/${editingTodo.id}`, { title });
        setTodos(todos.map((t) => (t.id === editingTodo.id ? response.data : t)));
        setEditingTodo(null);
        audioService.playComplete();
      } catch (err) {
        console.error('Error updating todo title:', err);
        alert('Failed to update task.');
      }
    } else {
      try {
        const response = await axios.post<Todo>(API_URL, { title });
        setTodos([response.data, ...todos]);
        audioService.playClick();
      } catch (err) {
        console.error('Error adding todo:', err);
        alert('Failed to save task.');
      }
    }
  };

  const handleToggleTodoComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const nextCompleted = !todo.completed;
    const completedAt = nextCompleted ? new Date().toISOString() : undefined;

    try {
      const response = await axios.put<Todo>(`${API_URL}/${id}`, {
        completed: nextCompleted,
        completedAt,
      });
      setTodos(todos.map((t) => (t.id === id ? response.data : t)));
    } catch (err) {
      console.error('Error toggling todo completion:', err);
      alert('Failed to toggle task completion.');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
      if (editingTodo?.id === id) {
        setEditingTodo(null);
      }
    } catch (err) {
      console.error('Error deleting todo:', err);
      alert('Failed to delete task.');
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    audioService.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-neu-bg text-neu-text p-4 md:p-8 pb-24 md:pb-8 font-sans overflow-x-hidden transition-all duration-300">
      <div className="max-w-md mx-auto flex flex-col gap-6">
        
        {/* APP HEADER */}
        <header className="bg-neu-bg p-5 rounded-3xl shadow-neu-out border border-neu-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neu-bg shadow-neu-out border border-neu-border flex items-center justify-center text-accent accent-glow">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight font-display text-neu-text">
                  NEUMORPHIC TASKS
                </h1>
                <p className="text-[9px] uppercase font-bold text-neu-text-muted tracking-widest mt-0.5">
                  Clean & Tactile Todo
                </p>
              </div>
            </div>

            {/* Global Controllers */}
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <TactileButton
                onClick={handleMuteToggle}
                className="w-8 h-8 rounded-full"
                title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-accent" />
                )}
              </TactileButton>

              {/* Theme Toggle */}
              <div className="flex items-center bg-neu-bg shadow-neu-sm-in p-0.5 rounded-full border border-neu-border">
                <button
                  onClick={() => {
                    setTheme('light');
                    audioService.playToggle(false);
                  }}
                  className={`p-1.5 rounded-full transition-all duration-300 outline-none cursor-pointer ${
                    theme === 'light'
                      ? 'shadow-neu-sm-out bg-neu-bg text-amber-500 border border-neu-border'
                      : 'text-neu-text-muted hover:text-neu-text'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    audioService.playToggle(true);
                  }}
                  className={`p-1.5 rounded-full transition-all duration-300 outline-none cursor-pointer ${
                    theme === 'dark'
                      ? 'shadow-neu-sm-out bg-neu-bg text-accent border border-neu-border'
                      : 'text-neu-text-muted hover:text-neu-text'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Row & Accents */}
          <div className="flex items-center justify-between border-t border-neu-border pt-3 gap-4">
            
            {/* Desktop Navbar Tabs */}
            <div className="hidden md:flex items-center bg-neu-bg shadow-neu-sm-in p-0.5 rounded-2xl border border-neu-border">
              {(['tasks', 'analytics', 'history'] as ActiveTab[]).map((tab) => {
                const isSelected = activeTab === tab;
                const labels = { tasks: 'Tasks', analytics: 'Chart', history: 'History' };
                const IconsMap = { tasks: ListTodo, analytics: BarChart2, history: History };
                const Icon = IconsMap[tab];
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      audioService.playClick();
                    }}
                    className={`py-1.5 px-3 text-[10px] font-bold rounded-xl transition-all duration-300 outline-none select-none uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'shadow-neu-sm-out bg-neu-bg text-accent border border-neu-border'
                        : 'text-neu-text-muted hover:text-neu-text'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    <span>{labels[tab]}</span>
                  </button>
                );
              })}
            </div>

            {/* Accent dots selection */}
            <div className="flex items-center gap-1.5 bg-neu-bg shadow-neu-sm-in px-2.5 py-1 rounded-full border border-neu-border">
              {(['blue', 'emerald', 'purple', 'rose', 'amber'] as AccentColor[]).map((col) => {
                const isSelected = accentColor === col;
                const bgDot: Record<AccentColor, string> = {
                  blue: 'bg-[#3b82f6]',
                  emerald: 'bg-[#10b981]',
                  purple: 'bg-[#8b5cf6]',
                  rose: 'bg-[#f43f5e]',
                  amber: 'bg-[#f59e0b]'
                };
                return (
                  <button
                    key={col}
                    onClick={() => {
                      setAccentColor(col);
                      audioService.playClick();
                    }}
                    className={`w-3 h-3 rounded-full ${bgDot[col]} border border-white/20 transition-all duration-300 hover:scale-125 cursor-pointer relative flex items-center justify-center`}
                  >
                    {isSelected && <span className="w-1 h-1 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>

            {/* Task completion tally (Desktop) */}
            {!loading && !error && totalCount > 0 && (
              <span className="hidden md:inline text-[9px] font-extrabold uppercase tracking-wider text-neu-text-muted select-none text-right">
                Done: <span className="text-accent">{completedCount}</span>/{totalCount}
              </span>
            )}
          </div>
        </header>

        {/* Network Error Ticker */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-3xl text-xs text-rose-500 font-bold flex items-center justify-between shadow-neu-out">
            <div className="flex items-center gap-2 pr-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
            <TactileButton
              onClick={fetchTodos}
              className="p-2 w-8 h-8 rounded-full shrink-0"
              title="Retry server connect"
            >
              <RefreshCw className="w-3.5 h-3.5 text-accent" />
            </TactileButton>
          </div>
        )}

        {/* Dynamic Tab Body Render */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-6"
              >
                {/* Form to Create/Edit */}
                <TodoForm
                  onSubmit={handleFormSubmit}
                  editingTodo={editingTodo}
                  onCancelEdit={() => setEditingTodo(null)}
                />

                {/* Loader State */}
                {loading ? (
                  <div className="bg-neu-bg p-8 rounded-3xl shadow-neu-out border border-neu-border text-center flex flex-col items-center gap-3 py-12 select-none">
                    <div className="w-10 h-10 rounded-full border-4 border-neu-border border-t-accent animate-spin" />
                    <p className="text-xs text-neu-text-muted font-bold uppercase tracking-wider">Syncing database...</p>
                  </div>
                ) : (
                  /* List container */
                  <motion.div layout className="flex flex-col gap-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {totalCount > 0 ? (
                        todos.map((todo) => (
                          <motion.div
                            key={todo.id}
                            layout
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                          >
                            <TodoItem
                              todo={todo}
                              onToggleComplete={handleToggleTodoComplete}
                              onDelete={handleDeleteTodo}
                              onEdit={setEditingTodo}
                            />
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-neu-bg p-8 rounded-3xl shadow-neu-out border border-neu-border text-center flex flex-col items-center gap-3 py-10"
                        >
                          <div className="w-12 h-12 rounded-full shadow-neu-in bg-neu-bg border border-neu-border flex items-center justify-center text-accent/30 select-none">
                            <CheckCircle2 className="w-6 h-6 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neu-text">All Caught Up!</h4>
                            <p className="text-[10px] text-neu-text-muted max-w-xs mx-auto mt-0.5 leading-relaxed">
                              Enjoy your day, or create a brand new task above.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {loading ? (
                  <div className="bg-neu-bg p-8 rounded-3xl shadow-neu-out border border-neu-border text-center flex flex-col items-center gap-3 py-12 select-none">
                    <div className="w-10 h-10 rounded-full border-4 border-neu-border border-t-accent animate-spin" />
                    <p className="text-xs text-neu-text-muted font-bold uppercase tracking-wider">Loading statistics...</p>
                  </div>
                ) : (
                  <WeeklyChart todos={todos} />
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {loading ? (
                  <div className="bg-neu-bg p-8 rounded-3xl shadow-neu-out border border-neu-border text-center flex flex-col items-center gap-3 py-12 select-none">
                    <div className="w-10 h-10 rounded-full border-4 border-neu-border border-t-accent animate-spin" />
                    <p className="text-xs text-neu-text-muted font-bold uppercase tracking-wider">Syncing timeline...</p>
                  </div>
                ) : (
                  <HistoryTimeline todos={todos} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="text-center text-[9px] uppercase tracking-widest text-neu-text-muted/50 py-4 select-none">
          Soft Shadows & Sound Synthesis • © 2026
        </footer>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neu-bg/90 backdrop-blur-md border-t border-neu-border shadow-[0_-8px_16px_rgba(0,0,0,0.05)] p-3 px-6 z-40 flex items-center justify-around pb-[max(12px,env(safe-area-inset-bottom))]">
        {(['tasks', 'analytics', 'history'] as ActiveTab[]).map((tab) => {
          const isSelected = activeTab === tab;
          const labels = { tasks: 'Tasks', analytics: 'Chart', history: 'History' };
          const IconsMap = { tasks: ListTodo, analytics: BarChart2, history: History };
          const Icon = IconsMap[tab];
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                audioService.playClick();
              }}
              className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-xl outline-none select-none cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'shadow-neu-sm-in text-accent bg-accent/5'
                  : 'text-neu-text-muted'
              }`}
            >
              <Icon className="w-5 h-5 text-accent" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest">{labels[tab]}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default App;