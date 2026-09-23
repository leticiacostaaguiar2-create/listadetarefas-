/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  CheckCircle, 
  Sparkles, 
  Trash2, 
  CheckCheck,
  Inbox
} from 'lucide-react';
import { Task, FilterStatus, SortOrder, TaskCategory, PriorityLevel } from './types';
import { INITIAL_DEMO_TASKS, PRIORITIES } from './utils/constants';
import { playCompleteSound } from './utils/sound';
import { Header } from './components/Header';
import { ProgressCard } from './components/ProgressCard';
import { TaskInputBar } from './components/TaskInputBar';
import { TaskFilters } from './components/TaskFilters';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import { AIDecomposeModal } from './components/AIDecomposeModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Toast } from './components/Toast';

const STORAGE_KEY = 'focotask_tasks_v1';
const THEME_KEY = 'focotask_theme';
const SOUND_KEY = 'focotask_sound';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved !== null) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return INITIAL_DEMO_TASKS;
        }
      }
    }
    return INITIAL_DEMO_TASKS;
  });

  // Filter & Search states
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('todas');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'todas'>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOrder>('data');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [modalInitialTitle, setModalInitialTitle] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInitialGoal, setAiInitialGoal] = useState('');

  // Toast / Undo state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);

  // Sync dark class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  // Persist tasks in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Falha ao salvar tarefas no armazenamento local', e);
    }
  }, [tasks]);

  // Toggle Theme
  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Toggle Sound
  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(SOUND_KEY, String(next));
      return next;
    });
  };

  // Quick Add Task
  const handleQuickAdd = (title: string, category: TaskCategory, priority: PriorityLevel) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString().split('T')[0],
      category,
      priority,
      subtasks: [],
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Tarefa "${title.slice(0, 25)}${title.length > 25 ? '...' : ''}" criada!`);
    return true;
  };

  // Save Task from modal (create or update)
  const handleSaveModalTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string }
  ) => {
    if (taskData.id) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskData.id
            ? {
                ...t,
                title: taskData.title,
                description: taskData.description,
                category: taskData.category,
                priority: taskData.priority,
                dueDate: taskData.dueDate,
                dueTime: taskData.dueTime,
                subtasks: taskData.subtasks,
              }
            : t
        )
      );
      showToast('Tarefa atualizada com sucesso!');
    } else {
      // Create new
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: taskData.title,
        description: taskData.description,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime,
        category: taskData.category,
        priority: taskData.priority,
        subtasks: taskData.subtasks,
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('Nova tarefa criada com sucesso!');
    }
  };

  // Toggle Task Completion
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted && soundEnabled) {
            playCompleteSound();
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          // Check if all subtasks are complete
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed);
          if (allCompleted && !t.completed && soundEnabled) {
            playCompleteSound();
          }
          return {
            ...t,
            subtasks: updatedSubtasks,
          };
        }
        return t;
      })
    );
  };

  // Delete Task with Undo capability
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    setLastDeletedTask(taskToDelete);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast(`Tarefa excluída.`, true);
  };

  // Undo delete
  const handleUndoDelete = () => {
    if (lastDeletedTask) {
      setTasks((prev) => [lastDeletedTask, ...prev]);
      setLastDeletedTask(null);
      setToastMessage(null);
    }
  };

  // Mark all visible as completed
  const handleMarkAllCompleted = () => {
    if (tasks.length === 0) return;
    setTasks((prev) =>
      prev.map((t) => ({ ...t, completed: true, completedAt: new Date().toISOString() }))
    );
    if (soundEnabled) playCompleteSound();
    showToast('Todas as tarefas foram concluídas!');
  };

  // Clear completed
  const handleClearCompleted = () => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount === 0) return;
    setTasks((prev) => prev.filter((t) => !t.completed));
    showToast(`${completedCount} tarefa(s) concluída(s) removida(s).`);
  };

  // Toast helper
  const showToast = (msg: string, hasUndo = false) => {
    setToastMessage(msg);
    if (!hasUndo) {
      setLastDeletedTask(null);
    }
  };

  // Filter counts
  const counts = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      todas: tasks.length,
      hoje: tasks.filter((t) => t.dueDate === todayStr).length,
      pendentes: tasks.filter((t) => !t.completed).length,
      concluidas: tasks.filter((t) => t.completed).length,
      alta_prioridade: tasks.filter(
        (t) => (t.priority === 'alta' || t.priority === 'urgente') && !t.completed
      ).length,
    };
  }, [tasks]);

  // Urgent pending count for highlight banner
  const urgentCount = useMemo(() => {
    return tasks.filter((t) => t.priority === 'urgente' && !t.completed).length;
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks
      .filter((t) => {
        // Status filter
        if (filterStatus === 'hoje' && t.dueDate !== todayStr) return false;
        if (filterStatus === 'pendentes' && t.completed) return false;
        if (filterStatus === 'concluidas' && !t.completed) return false;
        if (filterStatus === 'alta_prioridade' && t.priority !== 'alta' && t.priority !== 'urgente')
          return false;

        // Category filter
        if (selectedCategory !== 'todas' && t.category !== selectedCategory) return false;

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(term);
          const matchDesc = t.description?.toLowerCase().includes(term);
          const matchSub = t.subtasks.some((st) => st.title.toLowerCase().includes(term));
          if (!matchTitle && !matchDesc && !matchSub) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Put completed at bottom when looking at 'todas'
        if (filterStatus === 'todas') {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
        }

        if (sortBy === 'data') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }

        if (sortBy === 'prioridade') {
          const rankA = PRIORITIES[a.priority]?.rank || 0;
          const rankB = PRIORITIES[b.priority]?.rank || 0;
          return rankB - rankA;
        }

        if (sortBy === 'alfabetica') {
          return a.title.localeCompare(b.title, 'pt-BR');
        }

        // 'recentes'
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, filterStatus, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-24 sm:pb-12">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Main Top Header */}
      <Header
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenAIModal={() => {
          setAiInitialGoal('');
          setIsAIModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 flex-1">
        {/* Progress and Motivation Card */}
        <ProgressCard
          total={counts.todas}
          completed={counts.concluidas}
          pending={counts.pendentes}
          urgentCount={urgentCount}
        />

        {/* Quick Input Bar */}
        <div className="space-y-1.5">
          <TaskInputBar
            onQuickAdd={handleQuickAdd}
            onOpenDetailedModal={(title) => {
              setModalInitialTitle(title || '');
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            onOpenAIModal={(goal) => {
              setAiInitialGoal(goal || '');
              setIsAIModalOpen(true);
            }}
          />
        </div>

        {/* Filters, Categories and Search */}
        <TaskFilters
          filterStatus={filterStatus}
          onSelectStatus={setFilterStatus}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          counts={counts}
        />

        {/* Tasks List */}
        <section className="space-y-2.5">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onEdit={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onToggleSubtask={handleToggleSubtask}
              />
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-500 flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                Nenhuma tarefa encontrada
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {searchTerm
                  ? `Nenhum resultado para "${searchTerm}". Tente outro termo.`
                  : filterStatus === 'concluidas'
                  ? 'Você ainda não concluiu nenhuma tarefa hoje.'
                  : 'Sua lista está limpa! Adicione uma nova tarefa ou use a IA.'}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setModalInitialTitle('');
                    setTaskToEdit(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar Nova Tarefa</span>
                </button>

                <button
                  onClick={() => {
                    setAiInitialGoal('');
                    setIsAIModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 hover:bg-violet-200 text-xs font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span>Sugerir com IA</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Bulk Action Footer if tasks exist */}
        {tasks.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80">
            <span>
              Mostrando <strong>{filteredTasks.length}</strong> de <strong>{tasks.length}</strong> tarefas
            </span>

            <div className="flex items-center gap-2">
              {counts.pendentes > 0 && (
                <button
                  onClick={handleMarkAllCompleted}
                  className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                  title="Marcar todas as tarefas como concluídas"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Concluir todas</span>
                </button>
              )}

              {counts.concluidas > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                  title="Limpar tarefas que já foram concluídas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar concluídas</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile Screens */}
      <div className="sm:hidden fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => {
            setAiInitialGoal('');
            setIsAIModalOpen(true);
          }}
          className="w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg active:scale-95 cursor-pointer ring-2 ring-white dark:ring-slate-900"
          title="Assistente com IA"
          aria-label="Assistente com IA"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
        </button>

        <button
          onClick={() => {
            setModalInitialTitle('');
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="w-13 h-13 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl active:scale-95 cursor-pointer ring-4 ring-white dark:ring-slate-900"
          title="Adicionar Tarefa"
          aria-label="Adicionar Tarefa"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Detailed Task Modal (Add / Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveModalTask}
        taskToEdit={taskToEdit}
        initialTitle={modalInitialTitle}
      />

      {/* AI Goal Decomposer Modal */}
      <AIDecomposeModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onTaskCreated={(taskData) => {
          handleSaveModalTask(taskData);
        }}
        initialGoal={aiInitialGoal}
      />

      {/* Toast Notification with Undo */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onUndo={lastDeletedTask ? handleUndoDelete : undefined}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
