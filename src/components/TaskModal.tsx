import React, { useState, useEffect } from 'react';
import { X, Plus, Trash, Sparkles, AlertCircle, Calendar, Clock, Layers } from 'lucide-react';
import { Task, TaskCategory, PriorityLevel, SubTask } from '../types';
import { CATEGORIES, PRIORITIES } from '../utils/constants';
import { decomposeTaskWithAI } from '../services/aiService';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'> & { id?: string }) => void;
  taskToEdit?: Task | null;
  initialTitle?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  initialTitle = '',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('trabalho');
  const [priority, setPriority] = useState<PriorityLevel>('media');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || '');
      setDueTime(taskToEdit.dueTime || '');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle(initialTitle);
      setDescription('');
      setCategory('trabalho');
      setPriority('media');
      // default due date today
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('');
      setSubtasks([]);
    }
    setErrorMessage('');
  }, [taskToEdit, initialTitle, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: trimmed,
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleAiBreakdown = async () => {
    if (!title.trim()) {
      setErrorMessage('Digite o título da tarefa para a IA sugerir subtarefas.');
      return;
    }

    try {
      setIsAiLoading(true);
      setErrorMessage('');
      const result = await decomposeTaskWithAI(title);
      
      if (result.category) setCategory(result.category);
      if (result.priority) setPriority(result.priority);
      
      const newItems: SubTask[] = result.subtasks.map((st) => ({
        id: `ai-sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: st,
        completed: false,
      }));

      setSubtasks([...subtasks, ...newItems]);
    } catch {
      setErrorMessage('Não foi possível gerar com IA no momento. Adicione manualmente.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMessage('O título da tarefa é obrigatório.');
      return;
    }

    if (trimmedTitle.length < 2) {
      setErrorMessage('O título deve ter pelo menos 2 caracteres.');
      return;
    }

    onSave({
      id: taskToEdit?.id,
      title: trimmedTitle,
      description: description.trim(),
      category,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      subtasks,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa Completa'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Preencha os detalhes para organizar suas prioridades
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título da Tarefa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Ex: Entregar relatório trimestral"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              maxLength={150}
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição ou Anotações (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione links, detalhes ou observações importantes..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              maxLength={500}
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nível de Prioridade
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['baixa', 'media', 'alta', 'urgente'] as PriorityLevel[]).map((lvl) => {
                  const p = PRIORITIES[lvl];
                  const isSelected = priority === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPriority(lvl)}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? `${p.badgeBg} ${p.color} ring-2 ring-indigo-500 font-bold`
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Data Limite</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Horário (Opcional)</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Subtasks Section with AI integration */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Etapas / Subtarefas ({subtasks.length})</span>
              </label>

              <button
                type="button"
                onClick={handleAiBreakdown}
                disabled={isAiLoading || !title.trim()}
                className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 disabled:opacity-50 cursor-pointer"
                title="Dividir automaticamente este objetivo com IA"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'Gerando etapas...' : '✨ Sugerir com IA'}</span>
              </button>
            </div>

            {/* Add Subtask Input */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Adicionar uma etapa..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of subtasks */}
            {subtasks.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-slate-700 dark:text-slate-300 truncate pr-2">
                      • {st.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm transition cursor-pointer min-h-[40px]"
            >
              {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
