export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string; // ISO date string when completed
}

export type Theme = 'light' | 'dark';

export type AccentColor = 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';

export type ActiveTab = 'tasks' | 'analytics' | 'history';
