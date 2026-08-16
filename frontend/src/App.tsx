import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Volume2, VolumeX, Sun, Moon, CheckCircle2, ListTodo, BarChart2, History, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import type { Todo, Theme, AccentColor, ActiveTab } from './types';
import { TactileButton } from './components/TactileButton';
import { TodoForm } from './components/TodoForm';
import { TodoItem } from './components/TodoItem';
import { WeeklyChart } from './components/WeeklyChart';
import { HistoryTimeline } from './components/HistoryTimeline';
import { AuthCard } from './components/AuthCard';
import { audioService } from './utils/audio';
import { Base_URL } from './api/api';

// Configure axios to always send cookies for credentials
axios.defaults.withCredentials = true;

const BASE_URL = Base_URL;
const API_URL = `${BASE_URL}/api/todos`;

export const App: React.FC = () => {
  // --- Persistent Storage State & Network State ---
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  // --- Check Auth Session on Mount ---
  const checkSession = async () => {
    try {
      setCheckingAuth(true);
      const response = await axios.get(`${BASE_URL}/api/auth/me`);
      setCurrentUser(response.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Session check failed:', err);
      }
      setCurrentUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // --- Fetch Todos ---
  const fetchTodos = useCallback(async () => {
    if (!currentUser) return;
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
  }, [currentUser]);

  // Fetch todos whenever the user logs in
  useEffect(() => {
    if (currentUser) {
      fetchTodos();
    } else {
      setTodos([]);
      setLoading(false);
    }
  }, [currentUser, fetchTodos]);

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
  const handleEditTodo = (todo: Todo) => {
    if (todo.id.startsWith('temp-')) {
      alert('Task is still saving. Please wait.');
      return;
    }
    setEditingTodo(todo);
  };

  const handleFormSubmit = async (title: string) => {
    if (editingTodo) {
      const prevTodos = [...todos];
      const targetTodo = todos.find((t) => t.id === editingTodo.id);
      if (!targetTodo) return;

      // Optimistically update UI title and clear editing status
      setTodos(todos.map((t) => (t.id === editingTodo.id ? { ...t, title } : t)));
      setEditingTodo(null);
      audioService.playComplete();

      try {
        const response = await axios.put<Todo>(`${API_URL}/${targetTodo.id}`, { title });
        setTodos((prev) => prev.map((t) => (t.id === targetTodo.id ? response.data : t)));
      } catch (err) {
        console.error('Error updating todo title:', err);
        setTodos(prevTodos);
        alert('Failed to update task. Reverting changes.');
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const tempTodo: Todo = {
        id: tempId,
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const prevTodos = [...todos];

      // Optimistically add task to UI
      setTodos([tempTodo, ...todos]);
      audioService.playClick();

      try {
        const response = await axios.post<Todo>(API_URL, { title });
        setTodos((prev) => prev.map((t) => (t.id === tempId ? response.data : t)));
      } catch (err) {
        console.error('Error adding todo:', err);
        setTodos(prevTodos);
        alert('Failed to save task. Reverting changes.');
      }
    }
  };

  const handleToggleTodoComplete = async (id: string) => {
    if (id.startsWith('temp-')) {
      alert('Task is still saving. Please wait.');
      return;
    }

    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const prevTodos = [...todos];
    const nextCompleted = !todo.completed;
    const completedAt = nextCompleted ? new Date().toISOString() : undefined;

    // Optimistically toggle completion status in UI
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: nextCompleted, completedAt } : t)));

    try {
      const response = await axios.put<Todo>(`${API_URL}/${id}`, {
        completed: nextCompleted,
        completedAt,
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? response.data : t)));
    } catch (err) {
      console.error('Error toggling todo completion:', err);
      setTodos(prevTodos);
      alert('Failed to toggle task completion. Reverting changes.');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    if (id.startsWith('temp-')) {
      alert('Task is still saving. Please wait.');
      return;
    }

    const prevTodos = [...todos];
    const prevEditingTodo = editingTodo;

    // Optimistically remove from UI
    setTodos(todos.filter((t) => t.id !== id));
    if (editingTodo?.id === id) {
      setEditingTodo(null);
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (err) {
      console.error('Error deleting todo:', err);
      setTodos(prevTodos);
      setEditingTodo(prevEditingTodo);
      alert('Failed to delete task. Reverting changes.');
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    audioService.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`);
      audioService.playToggle(false);
      setCurrentUser(null);
      setTodos([]);
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Failed to log out.');
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  // Initial session recovery spinner
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-neu-bg text-neu-text flex flex-col items-center justify-center font-sans">
        <div className="bg-neu-bg p-8 rounded-3xl shadow-neu-out border border-neu-border text-center flex flex-col items-center gap-4 py-12 select-none w-full max-w-sm">
          <div className="w-12 h-12 rounded-full border-4 border-neu-border border-t-accent animate-spin" />
          <p className="text-xs text-neu-text-muted font-bold uppercase tracking-wider animate-pulse">Restoring Session...</p>
        </div>
      </div>
    );
  }

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

              {/* Logout Button (if logged in) */}
              {currentUser && (
                <TactileButton
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-full hover:bg-rose-500/5 text-neu-text hover:text-rose-500"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </TactileButton>
              )}
            </div>
          </div>

          {/* Navigation Row & Accents (Desktop) */}
          <div className="flex items-center justify-between border-t border-neu-border pt-3 gap-4">
            
            {/* Desktop Navbar Tabs (Visible only if logged in) */}
            {currentUser ? (
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
            ) : (
              <div className="flex items-center bg-neu-bg shadow-neu-sm-in p-0.5 rounded-2xl border border-neu-border">
                <span className="text-[9px] px-3 py-1.5 font-extrabold uppercase text-neu-text-muted tracking-wider select-none">
                  Secure Access Mode
                </span>
              </div>
            )}

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
            {currentUser && !loading && !error && totalCount > 0 && (
              <span className="hidden md:inline text-[9px] font-extrabold uppercase tracking-wider text-neu-text-muted select-none text-right">
                Done: <span className="text-accent">{completedCount}</span>/{totalCount}
              </span>
            )}
          </div>
        </header>

        {/* Auth card or Todo application */}
        {!currentUser ? (
          <AuthCard
            onSuccess={(user) => setCurrentUser(user)}
            apiBaseUrl={BASE_URL}
            axiosInstance={axios}
          />
        ) : (
          <>
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
                                  onEdit={handleEditTodo}
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
          </>
        )}

        {/* Footer */}
        <footer className="text-center text-[9px] uppercase tracking-widest text-neu-text-muted/50 py-4 select-none">
          Soft Shadows & Sound Synthesis • © 2026
        </footer>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {currentUser && (
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
      )}

    </div>
  );
};

export default App;