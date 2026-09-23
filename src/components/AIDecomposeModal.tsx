import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { decomposeTaskWithAI, AIDecomposedPlan } from '../services/aiService';
import { Task, SubTask } from '../types';

interface AIDecomposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  initialGoal?: string;
}

const QUICK_IDEAS = [
  'Planejar viagem de fim de semana',
  'Estudar para prova importante',
  'Preparar apresentação no trabalho',
  'Faxina e organização de casa',
  'Comprar ingredientes e cozinhar jantar',
];

export const AIDecomposeModal: React.FC<AIDecomposeModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  initialGoal = '',
}) => {
  const [goal, setGoal] = useState(initialGoal);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIDecomposedPlan | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (targetGoal?: string) => {
    const textToUse = targetGoal || goal;
    if (!textToUse.trim()) {
      setError('Por favor, informe um objetivo ou tarefa para a IA desmembrar.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const plan = await decomposeTaskWithAI(textToUse);
      setResult(plan);
    } catch {
      setError('Ocorreu um erro ao processar com a IA. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;

    const subtasksList: SubTask[] = result.subtasks.map((title, idx) => ({
      id: `ai-sub-${Date.now()}-${idx}`,
      title,
      completed: false,
    }));

    onTaskCreated({
      title: result.suggestedTitle,
      description: result.tips ? `💡 ${result.tips}` : undefined,
      category: result.category,
      priority: result.priority,
      dueDate: new Date().toISOString().split('T')[0],
      subtasks: subtasksList,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Assistente de Tarefas com IA</h2>
              <p className="text-xs text-indigo-100">Desmembre grandes objetivos em passos práticos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Qual objetivo ou projeto você deseja organizar?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => {
                  setGoal(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="Ex: Organizar festa de aniversário surpresa"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={loading || !goal.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Dividir</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Idea Chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1.5">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Sugestões rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => {
                    setGoal(idea);
                    handleGenerate(idea);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs transition cursor-pointer"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200">
              {error}
            </p>
          )}

          {/* Result preview */}
          {result && (
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/50 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Sugestão Estruturada
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {result.suggestedTitle}
                  </h4>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize font-medium">
                  {result.category}
                </span>
              </div>

              {result.tips && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                  {result.tips}
                </p>
              )}

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Etapas sugeridas ({result.subtasks.length}):
                </span>
                {result.subtasks.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleApply}
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
              >
                <span>Criar Tarefa com Estas Etapas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
