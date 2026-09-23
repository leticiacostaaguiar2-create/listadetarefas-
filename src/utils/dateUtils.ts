export function formatFriendlyDate(dateString?: string, timeString?: string): { text: string; isOverdue: boolean; isToday: boolean } {
  if (!dateString) {
    return { text: '', isOverdue: false, isToday: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let text = '';
  const isOverdue = diffDays < 0;
  const isToday = diffDays === 0;

  if (diffDays === 0) {
    text = 'Hoje';
  } else if (diffDays === 1) {
    text = 'Amanhã';
  } else if (diffDays === -1) {
    text = 'Ontem';
  } else if (diffDays < -1) {
    text = `Atrasada (${Math.abs(diffDays)}d)`;
  } else if (diffDays < 7) {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    text = days[targetDate.getDay()];
  } else {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    text = `${day} de ${months[month - 1]}`;
  }

  if (timeString) {
    text += ` às ${timeString}`;
  }

  return { text, isOverdue, isToday };
}

export function getTodayFormatted(): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  };
  const str = new Intl.DateTimeFormat('pt-BR', options).format(new Date());
  return str.charAt(0).toUpperCase() + str.slice(1);
}
