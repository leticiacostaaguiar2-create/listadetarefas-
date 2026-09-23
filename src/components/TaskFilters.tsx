import React from 'react';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import { FilterStatus, SortOrder, TaskCategory } from '../types';
import { CATEGORIES } from '../utils/constants';

interface TaskFiltersProps {
  filterStatus: FilterStatus;
  onSelectStatus: (status: FilterStatus) => void;
  selectedCategory: TaskCategory | 'todas';
  onSelectCategory: (cat: TaskCategory | 'todas') => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  sortBy: SortOrder;
  onSortChange: (sort: SortOrder) => void;
  counts: {
    todas: number;
    hoje: number;
    pendentes: number;
    concluidas: number;
    alta_prioridade: number;
  };
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filterStatus,
  onSelectStatus,
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  counts,
}) => {
  const statusTabs: { id: FilterStatus; label: string; count: number }[] = [
    { id: 'todas', label: 'Todas', count: counts.todas },
    { id: 'hoje', label: 'Hoje', count: counts.hoje },
    { id: 'pendentes', label: 'Pendentes', count: counts.pendentes },
    { id: 'concluidas', label: 'Concluídas', count: counts.concluidas },
    { id: 'alta_prioridade', label: 'Urgente / Alta', count: counts.alta_prioridade },
  ];

  return (
    <div className="space-y-2.5">
      {/* Search and Sort Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar tarefas..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="relative flex items-center shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOrder)}
            className="pl-8 pr-7 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 cursor-pointer appearance-none"
            title="Ordenar tarefas"
          >
            <option value="data">Data de entrega</option>
            <option value="prioridade">Maior prioridade</option>
            <option value="recentes">Mais recentes</option>
            <option value="alfabetica">Ordem alfabética (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Status Tabs - swipeable horizontally on mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {statusTabs.map((tab) => {
          const isActive = filterStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectStatus(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Category selector row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px] font-medium shrink-0 mr-0.5">
          <Filter className="w-3 h-3" />
          <span>Filtro:</span>
        </div>

        <button
          onClick={() => onSelectCategory('todas')}
          className={`px-2.5 py-0.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
            selectedCategory === 'todas'
              ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          Todas
        </button>

        {Object.values(CATEGORIES).map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
