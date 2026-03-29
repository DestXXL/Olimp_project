import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatSalary(from?: number | null, to?: number | null, currency = 'RUB'): string {
  if (!from && !to) return 'Зарплата не указана';
  
  const formatNumber = (n: number) => n.toLocaleString('ru-RU');
  const currencySymbol = currency === 'RUB' ? '₽' : currency;
  
  if (from && to) {
    return `${formatNumber(from)} – ${formatNumber(to)} ${currencySymbol}`;
  }
  if (from) {
    return `от ${formatNumber(from)} ${currencySymbol}`;
  }
  return `до ${formatNumber(to!)} ${currencySymbol}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
