import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, decimals = 1): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

export function getProgressPercent(current: number, goal: number): number {
  return clamp(Math.round((current / goal) * 100), 0, 100);
}
