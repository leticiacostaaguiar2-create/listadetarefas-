import React from 'react';
import { CheckSquare, Moon, Sun, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { getTodayFormatted } from '../utils/dateUtils';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAIModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenAIModal,
}) => {
  const todayText = getTodayFormatted();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/20">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Foco<span className="text-indigo-600 dark:text-indigo-400">Task</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block capitalize">
                {todayText}
              </p>
            </div>
          </div>

          {/* Action buttons & controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAIModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              title="Assistente de Tarefas com IA"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span className="hidden sm:inline">IA Assistente</span>
              <span className="sm:hidden">IA</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Sound toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              title={soundEnabled ? 'Desativar sons' : 'Ativar sons'}
              aria-label="Controle de áudio"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-60" />
              )}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
              title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label="Alternar tema"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
