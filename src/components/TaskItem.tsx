import React, { useState } from 'react';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square,
  AlertTriangle
} from 'lucide-react';
import { Task } from '../types';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { formatFriendlyDate } from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  onToggleSubtask,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const categoryInfo = CATEGORIES[task.category] || CATEGORIES.outros;
  const priorityInfo = PRIORITIES[task.priority] || PRIORITIES.media;

  const { text: dateText, isOverdue, isToday } = formatFriendlyDate(task.dueDate, task.dueTime);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const hasSubtasks = totalSubtasks > 0;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
        task.completed
          ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 opacity-75'
          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs hover:shadow-md'
      }`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* Toggle Complete Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          className={`shrink-0 w-6 h-6 sm:w-6 sm:h-6 mt-0.5 rounded-lg flex items-center justify-center border-2 transition-all duration-200 cursor-pointer ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs shadow-emerald-500/30'
              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400'
          }`}
          title={task.completed ? 'Marcar como não concluída' : 'Marcar como concluída'}
          aria-label={task.completed ? 'Desmarcar tarefa' : 'Concluir tarefa'}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {/* Category badge */}
            <span
              className={`inline-flex items-center text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border ${categoryInfo.bgColor} ${categoryInfo.color} ${categoryInfo.borderColor}`}
            >
              {categoryInfo.label}
            </span>

            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border ${priorityInfo.badgeBg} ${priorityInfo.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dotColor}`} />
              {priorityInfo.label}
            </span>

            {/* Due date badge */}
            {dateText && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md border ${
                  isOverdue && !task.completed
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                    : isToday && !task.completed
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {isOverdue && !task.completed ? (
                  <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
                <span>{dateText}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onToggleComplete(task.id)}
            className={`text-sm sm:text-base font-semibold leading-snug cursor-pointer select-none transition-colors ${
              task.completed
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            {task.title}
          </h3>

          {/* Optional description */}
          {task.description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Subtasks summary bar if any */}
          {hasSubtasks && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
              >
                <span>
                  Subtarefas ({completedSubtasks}/{totalSubtasks})
                </span>
                {showSubtasks ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Mini subtask progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%`,
                  }}
                />
              </div>

              {/* Subtasks checklist items */}
              {showSubtasks && (
                <div className="mt-2 space-y-1.5 pl-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-150">
                  {task.subtasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => onToggleSubtask(task.id, st.id)}
                      className="flex items-center gap-2 text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      {st.completed ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={
                          st.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-700 dark:text-slate-300'
                        }
                      >
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action icons (Edit & Delete) */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            title="Editar tarefa"
            aria-label="Editar tarefa"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title="Excluir tarefa"
            aria-label="Excluir tarefa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
