import React, { useState } from 'react';
import { Plus, SlidersHorizontal, AlertCircle, Sparkles } from 'lucide-react';
import { PriorityLevel, TaskCategory } from '../types';

interface TaskInputBarProps {
  onQuickAdd: (title: string, category: TaskCategory, priority: PriorityLevel) => boolean;
  onOpenDetailedModal: (initialTitle?: string) => void;
  onOpenAIModal: (initialGoal?: string) => void;
}

export const TaskInputBar: React.FC<TaskInputBarProps> = ({
  onQuickAdd,
  onOpenDetailedModal,
  onOpenAIModal,
}) => {
  const [title, setTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('trabalho');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('media');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) {
      setErrorMessage('Por favor, digite o nome da tarefa antes de adicionar.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    if (trimmed.length < 2) {
      setErrorMessage('O título deve conter pelo menos 2 caracteres.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    const success = onQuickAdd(trimmed, selectedCategory, selectedPriority);
    if (success) {
      setTitle('');
      setErrorMessage('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-white dark:bg-slate-900 border ${
          errorMessage
            ? 'border-rose-400 ring-2 ring-rose-400/20'
            : 'border-slate-300 dark:border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
        } rounded-2xl p-1.5 shadow-sm transition-all duration-200 ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        <input
          type="text"
          value={title}
          onChange={handleChange}
          placeholder="O que você precisa fazer hoje? (ex: Estudar matemática)"
          className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden"
          maxLength={150}
        />

        <div className="flex items-center gap-1 sm:gap-1.5 pr-1">
          {/* AI Helper trigger with current text */}
          <button
            type="button"
            onClick={() => onOpenAIModal(title)}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Dividir objetivo com Inteligência Artificial"
          >
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="hidden md:inline">Dividir com IA</span>
          </button>

          {/* Detailed options modal trigger */}
          <button
            type="button"
            onClick={() => onOpenDetailedModal(title)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Mais detalhes (data, subtarefas, categoria)"
            aria-label="Opções detalhadas"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Main Add Button - thumb-friendly */}
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition duration-150 cursor-pointer min-h-[44px]"
            title="Adicionar Tarefa"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </form>

      {/* Validation error message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick category selector pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium shrink-0 mr-1">
          Categoria rápida:
        </span>
        {(['trabalho', 'pessoal', 'estudos', 'saude', 'compras'] as TaskCategory[]).map((cat) => {
          const isSelected = selectedCategory === cat;
          const labels: Record<TaskCategory, string> = {
            trabalho: '💼 Trabalho',
            pessoal: '👤 Pessoal',
            estudos: '📚 Estudos',
            saude: '🏃 Saúde',
            compras: '🛒 Compras',
            financas: '💰 Finanças',
            outros: '⭐ Outros',
          };
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 ring-1 ring-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {labels[cat]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
