export type PriorityLevel = 'baixa' | 'media' | 'alta' | 'urgente';

export type TaskCategory = 
  | 'trabalho' 
  | 'pessoal' 
  | 'estudos' 
  | 'saude' 
  | 'compras' 
  | 'financas' 
  | 'outros';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string; // ISO date
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: PriorityLevel;
  category: TaskCategory;
  subtasks: SubTask[];
  completedAt?: string;
}

export type FilterStatus = 'todas' | 'hoje' | 'pendentes' | 'concluidas' | 'alta_prioridade';

export type SortOrder = 'data' | 'prioridade' | 'recentes' | 'alfabetica';

export interface CategoryInfo {
  id: TaskCategory;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface PriorityInfo {
  id: PriorityLevel;
  label: string;
  color: string;
  badgeBg: string;
  dotColor: string;
  rank: number;
}
