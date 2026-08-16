import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Todo } from '../types';

interface WeeklyChartProps {
  todos: Todo[];
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ todos }) => {
  interface ChartDay {
    dateKey: string;
    label: string;
    completedCreated: number; // completed tasks that were created on this day
    totalCreated: number;     // total tasks that were created on this day
  }

  // Generate the last 7 days (including today)
  const getChartData = () => {
    const days: ChartDay[] = [];
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateKey: d.toDateString(), // matching base key
        label: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : weekdayNames[d.getDay()],
        completedCreated: 0,
        totalCreated: 0,
      });
    }

    // Populate created and completed counts relative to creation day
    todos.forEach((todo) => {
      const createdDate = new Date(todo.createdAt).toDateString();
      const match = days.find((day) => day.dateKey === createdDate);
      if (match) {
        match.totalCreated += 1;
        if (todo.completed) {
          match.completedCreated += 1;
        }
      }
    });

    return days;
  };

  const chartData = getChartData();
  const totalCreatedThisWeek = chartData.reduce((acc, curr) => acc + curr.totalCreated, 0);
  const totalCompletedCreatedThisWeek = chartData.reduce((acc, curr) => acc + curr.completedCreated, 0);
  const overallWeekRate = totalCreatedThisWeek > 0 
    ? Math.round((totalCompletedCreatedThisWeek / totalCreatedThisWeek) * 100) 
    : 0;

  return (
    <div className="bg-neu-bg p-6 rounded-3xl shadow-neu-out border border-neu-border w-full max-w-md mx-auto flex flex-col gap-6 select-none animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-neu-text flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-accent animate-pulse" />
          Weekly Completion Rates
        </h3>
        <div className="flex items-center gap-1.5 bg-neu-bg shadow-neu-sm-in px-2.5 py-1 rounded-full border border-neu-border text-[9px] font-bold text-accent">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{overallWeekRate}% Average</span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="bg-neu-bg shadow-neu-sm-in p-5 rounded-2xl border border-neu-border flex items-end justify-between gap-1 h-60 pt-5">
        {chartData.map((day, idx) => {
          const percentage = day.totalCreated > 0 
            ? Math.round((day.completedCreated / day.totalCreated) * 100) 
            : 0;
          
          return (
            <div key={day.dateKey} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
              
              {/* Ratio / Percentage label above the bar */}
              <div className="flex flex-col items-center ">
                {/* <span className="text-[9px] font-extrabold text-neu-text-muted">
                  {day.totalCreated > 0 ? `${percentage}%` : '0%'}
                </span> */}
                <span className="text-[8px] font-bold text-neu-text-muted/65 scale-90">
                  {day.totalCreated > 0 ? `${day.completedCreated}/${day.totalCreated}` : '—'}
                </span>
              </div>

              {/* Bar container slot (Inset Neumorphic Track) */}
              <div className="w-7 h-full bg-neu-bg shadow-neu-sm-in border border-neu-border rounded-xl flex items-end justify-center p-0.5 overflow-hidden">
                
                {/* Visual Bar (Raised Neumorphic shape representing percentage) */}
                {day.totalCreated > 0 && percentage > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.05 }}
                    style={{
                      backgroundColor: 'var(--accent-base)',
                      boxShadow: '0 0 6px var(--accent-glow)'
                    }}
                    className="w-full rounded-lg shadow-neu-sm-out cursor-pointer"
                  />
                )}
              </div>

              {/* Day Label */}
              <span className="text-[8px] font-extrabold text-neu-text-muted uppercase tracking-wider mt-1">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary message */}
      <p className="text-[11px] text-neu-text-muted text-center leading-relaxed px-4">
        {totalCreatedThisWeek > 0 ? (
          <>
            You completed <span className="font-bold text-accent">{totalCompletedCreatedThisWeek}</span> of the <span className="font-bold">{totalCreatedThisWeek} tasks</span> created in the past 7 days, achieving a <span className="font-bold text-accent">{overallWeekRate}%</span> completion rate.
          </>
        ) : (
          "No tasks were created in the past 7 days. Create new tasks in the Tasks tab to begin measuring completion scores!"
        )}
      </p>

    </div>
  );
};
