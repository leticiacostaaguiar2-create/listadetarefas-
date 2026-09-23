import React from 'react';
import { CheckCircle2, Clock, ListTodo, Trophy, Flame } from 'lucide-react';

interface ProgressCardProps {
  total: number;
  completed: number;
  pending: number;
  urgentCount: number;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  total,
  completed,
  pending,
  urgentCount,
}) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Dynamic motivational message
  let message = 'Comece seu dia adicionando uma tarefa!';
  let icon = <ListTodo className="w-5 h-5 text-indigo-500" />;

  if (total > 0) {
    if (percent === 100) {
      message = 'Sensacional! Todas as tarefas concluídas! 🎉';
      icon = <Trophy className="w-5 h-5 text-amber-500" />;
    } else if (percent >= 70) {
      message = 'Quase lá! Falta muito pouco para finalizar tudo!';
      icon = <Flame className="w-5 h-5 text-orange-500" />;
    } else if (percent >= 40) {
      message = 'Ótimo ritmo! Você já superou a metade do caminho!';
      icon = <Flame className="w-5 h-5 text-indigo-500" />;
    } else if (completed > 0) {
      message = 'Bom começo! Mantenha o foco na próxima etapa.';
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    } else {
      message = 'Dia produtivo! Escolha uma tarefa para iniciar.';
      icon = <Clock className="w-5 h-5 text-blue-500" />;
    }
  }

  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden transition-all duration-300">
      {/* Background glow circle */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-violet-500/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              {icon}
            </div>
            <div>
              <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider block">
                Progresso Geral
              </span>
              <p className="text-sm font-semibold text-white leading-tight">
                {message}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {percent}%
            </span>
            <span className="text-[11px] block text-indigo-200">concluído</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/15 h-3 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Summary Badges */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-white/10 rounded-xl py-1.5 px-2 backdrop-blur-xs">
            <span className="text-[11px] text-indigo-200 block">Total</span>
            <span className="text-base font-bold text-white">{total}</span>
          </div>

          <div className="bg-white/10 rounded-xl py-1.5 px-2 backdrop-blur-xs">
            <span className="text-[11px] text-emerald-300 block">Concluídas</span>
            <span className="text-base font-bold text-emerald-300">{completed}</span>
          </div>

          <div className="bg-white/10 rounded-xl py-1.5 px-2 backdrop-blur-xs">
            <span className="text-[11px] text-amber-300 block">Pendentes</span>
            <span className="text-base font-bold text-amber-300">{pending}</span>
          </div>
        </div>

        {urgentCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-lg px-2.5 py-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Atenção: <strong>{urgentCount}</strong> tarefa{urgentCount > 1 ? 's' : ''} urgente{urgentCount > 1 ? 's' : ''} pendente{urgentCount > 1 ? 's' : ''}!</span>
          </div>
        )}
      </div>
    </div>
  );
};
