import React from 'react';
import { CheckCircle2, RotateCcw, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose }) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-300 animate-in slide-in-from-bottom duration-200 max-w-sm w-full mx-4">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span className="text-xs sm:text-sm font-medium flex-1 truncate">
        {message}
      </span>

      {onUndo && (
        <button
          onClick={onUndo}
          className="flex items-center gap-1 text-xs font-bold text-indigo-400 dark:text-indigo-600 hover:underline shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Desfazer</span>
        </button>
      )}

      <button
        onClick={onClose}
        className="p-1 rounded text-slate-400 hover:text-white dark:hover:text-slate-900"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
