export function formatDate(
  dateStr: string,
  format: 'display' | 'api' | 'month-year' = 'display'
): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  if (format === 'api') {
    return date.toISOString().split('T')[0];
  }

  if (format === 'month-year') {
    return date.toLocaleDateString('en-BD', { month: 'long', year: 'numeric' });
  }

  return date.toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function isOverdue(dueDateStr: string): boolean {
  return new Date(dueDateStr) < new Date();
}

export function daysDiff(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getCurrentPeriod(): string {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}