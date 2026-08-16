import React from 'react';
import { Clock, Plus, Check, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Todo } from '../types';

interface HistoryTimelineProps {
  todos: Todo[];
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'completed';
  timestamp: string;
  taskTitle: string;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ todos }) => {
  // Extract and combine events from todos list
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    todos.forEach((todo) => {
      // 1. Creation event
      events.push({
        id: `${todo.id}-created`,
        type: 'created',
        timestamp: todo.createdAt,
        taskTitle: todo.title,
      });

      // 2. Completion event (if exists)
      if (todo.completed && todo.completedAt) {
        events.push({
          id: `${todo.id}-completed`,
          type: 'completed',
          timestamp: todo.completedAt,
          taskTitle: todo.title,
        });
      }
    });

    // Sort by timestamp descending (newest first)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Group events by human-readable Date (e.g. "Sunday, August 16, 2026")
  const groupEventsByDate = (events: TimelineEvent[]) => {
    const groups: Record<string, TimelineEvent[]> = {};

    events.forEach((event) => {
      const dateStr = new Date(event.timestamp).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Check if it's today or yesterday to label cleaner
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      const eventDateStr = new Date(event.timestamp).toDateString();
      
      let finalHeader = dateStr;
      if (eventDateStr === today) {
        finalHeader = 'Today';
      } else if (eventDateStr === yesterdayStr) {
        finalHeader = 'Yesterday';
      }

      if (!groups[finalHeader]) {
        groups[finalHeader] = [];
      }
      groups[finalHeader].push(event);
    });

    return Object.keys(groups).map((date) => ({
      date,
      events: groups[date],
    }));
  };

  const allEvents = getTimelineEvents();
  const groupedEvents = groupEventsByDate(allEvents);

  // Formatter for event time (e.g. "5:30 PM")
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-neu-bg p-6 rounded-3xl shadow-neu-out border border-neu-border w-full max-w-md mx-auto flex flex-col gap-6 select-none max-h-[500px] overflow-y-auto">
      
      {/* Title */}
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-neu-text flex items-center gap-2">
        <Clock className="w-5 h-5 text-accent" />
        Activity Timeline Logs
      </h3>

      {groupedEvents.length > 0 ? (
        <div className="flex flex-col gap-6 pl-1 pr-1">
          {groupedEvents.map((group, groupIdx) => (
            <div key={group.date} className="flex flex-col gap-4">
              
              {/* Date Header Badge */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <h4 className="text-xs font-bold text-neu-text font-display">
                  {group.date}
                </h4>
              </div>

              {/* Events vertical connector */}
              <div className="flex flex-col gap-4 border-l border-neu-border ml-2 pl-4 relative">
                {group.events.map((event, eventIdx) => {
                  const isCreated = event.type === 'created';

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIdx * 3 + eventIdx) * 0.05 }}
                      className="relative flex items-center justify-between text-xs gap-3"
                    >
                      {/* Timeline circle connector */}
                      <span className={`absolute -left-[22.5px] top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 bg-neu-bg flex items-center justify-center ${
                        isCreated ? 'border-accent' : 'border-emerald-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isCreated ? 'bg-accent' : 'bg-emerald-500'
                        }`} />
                      </span>

                      {/* Event description */}
                      <div className="flex flex-col gap-0.5 max-w-[70%]">
                        <span className="text-neu-text font-bold leading-tight break-words">
                          {event.taskTitle}
                        </span>
                        <span className="text-[10px] text-neu-text-muted">
                          {isCreated ? 'Task was created' : 'Task completed'}
                        </span>
                      </div>

                      {/* Event Time badge (Neumorphic Inset label) */}
                      <div className="bg-neu-bg shadow-neu-sm-in border border-neu-border px-2.5 py-1 rounded-xl text-[9px] font-extrabold text-neu-text-muted shrink-0 flex items-center gap-1">
                        {isCreated ? (
                          <Plus className="w-2.5 h-2.5 text-accent" />
                        ) : (
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                        )}
                        <span>{formatTime(event.timestamp)}</span>
                      </div>

                    </motion.div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="bg-neu-bg p-8 rounded-2xl shadow-neu-sm-in border border-neu-border text-center flex flex-col items-center gap-3 py-10 select-none">
          <Clock className="w-7 h-7 text-neu-text-muted/40 animate-pulse" />
          <h4 className="text-xs font-bold text-neu-text">No activity history yet</h4>
          <p className="text-[10px] text-neu-text-muted leading-relaxed max-w-[200px] mx-auto">
            Your tasks will appear here as soon as you create or complete them.
          </p>
        </div>
      )}

    </div>
  );
};
