import { GoogleGenAI } from '@google/genai';
import { PriorityLevel, TaskCategory } from '../types';

export interface AIDecomposedPlan {
  suggestedTitle: string;
  category: TaskCategory;
  priority: PriorityLevel;
  subtasks: string[];
  tips?: string;
}

// Local fallback dictionary for offline or keyless instant experience
const LOCAL_TEMPLATES: Record<string, { category: TaskCategory; priority: PriorityLevel; subtasks: string[] }> = {
  estudo: {
    category: 'estudos',
    priority: 'alta',
    subtasks: [
      'Revisar material de apoio e anotações principais',
      'Fazer resumo dos conceitos mais importantes',
      'Praticar com pelo menos 5 exercícios práticos',
      'Tirar dúvidas com colegas ou professor',
    ],
  },
  apresentacao: {
    category: 'trabalho',
    priority: 'alta',
    subtasks: [
      'Definir a mensagem principal e objetivo do público',
      'Estruturar o roteiro e criar os slides no formato visual',
      'Treinar a fala cronometrando o tempo',
      'Salvar cópia de backup offline',
    ],
  },
  viagem: {
    category: 'pessoal',
    priority: 'media',
    subtasks: [
      'Conferir documentos e passagens',
      'Fazer lista de roupas e itens de higiene',
      'Separar remédios e carregadores de celular',
      'Fechar janelas e retirar aparelhos da tomada antes de sair',
    ],
  },
  compras: {
    category: 'compras',
    priority: 'media',
    subtasks: [
      'Verificar o que já tem na despensa e geladeira',
      'Escrever lista organizada por corredores',
      'Definir teto de orçamento para evitar supérfluos',
    ],
  },
  limpeza: {
    category: 'pessoal',
    priority: 'baixa',
    subtasks: [
      'Organizar itens fora do lugar em cada cômodo',
      'Tirar pó das superfícies e móveis',
      'Varrer e passar pano no chão',
      'Descartar o lixo nos coletores',
    ],
  },
  treino: {
    category: 'saude',
    priority: 'media',
    subtasks: [
      'Fazer aquecimento e mobilidade por 5 minutos',
      'Executar a sequência principal de exercícios com foco na técnica',
      'Fazer desaquecimento e alongamento leve',
      'Beber 500ml de água para hidratação',
    ],
  },
  projeto: {
    category: 'trabalho',
    priority: 'alta',
    subtasks: [
      'Mapear escopo, objetivos e entregáveis',
      'Dividir em tarefas menores e definir prazos',
      'Validar requisitos com as partes interessadas',
      'Testar e fazer revisão final antes da entrega',
    ],
  },
};

function getLocalDecomposition(prompt: string): AIDecomposedPlan {
  const lower = prompt.toLowerCase();
  for (const [key, data] of Object.entries(LOCAL_TEMPLATES)) {
    if (lower.includes(key)) {
      return {
        suggestedTitle: prompt.trim(),
        category: data.category,
        priority: data.priority,
        subtasks: data.subtasks,
        tips: 'Dica da IA: Foque em concluir a primeira subtarefa em menos de 15 minutos para ganhar embalo!',
      };
    }
  }

  // Generic fallback if no specific keyword matched
  return {
    suggestedTitle: prompt.trim(),
    category: 'pessoal',
    priority: 'media',
    subtasks: [
      `Definir o primeiro passo prático para "${prompt.slice(0, 30)}"`,
      'Reunir materiais ou informações necessárias',
      'Executar a etapa principal com foco ininterrupto',
      'Revisar e marcar como concluído',
    ],
    tips: 'Dica: Quebrar objetivos grandes em pequenos passos diários reduz a procrastinação.',
  };
}

export async function decomposeTaskWithAI(taskGoal: string): Promise<AIDecomposedPlan> {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                 (typeof import.meta !== 'undefined' && (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY);

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Artificial small delay for realistic UX
    await new Promise((res) => setTimeout(res, 500));
    return getLocalDecomposition(taskGoal);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é um assistente de produtividade e organização pessoal.
O usuário quer realizar o seguinte objetivo ou tarefa: "${taskGoal}".
Divida essa tarefa em 3 a 5 subtarefas práticas, claras e acionáveis em língua portuguesa (Brasil).
Responda EXCLUSIVAMENTE em formato JSON válido no seguinte esquema:
{
  "suggestedTitle": "Título claro e direto da tarefa principal",
  "category": "trabalho" | "pessoal" | "estudos" | "saude" | "compras" | "financas" | "outros",
  "priority": "baixa" | "media" | "alta" | "urgente",
  "subtasks": ["Subtarefa 1", "Subtarefa 2", "Subtarefa 3", "Subtarefa 4"],
  "tips": "Uma dica curta de 1 frase para realizar isso com eficiência"
}`,
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      suggestedTitle: parsed.suggestedTitle || taskGoal,
      category: parsed.category || 'pessoal',
      priority: parsed.priority || 'media',
      subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [taskGoal],
      tips: parsed.tips,
    };
  } catch (err) {
    console.warn('Fallback to local AI task template:', err);
    return getLocalDecomposition(taskGoal);
  }
}
