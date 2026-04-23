import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Returns a deterministic Tailwind bg color class based on the first character of a name.
 * Used for initials-based avatar circles.
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-indigo-500',
    'bg-violet-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-amber-500',
    'bg-emerald-500',
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

/**
 * Returns initials from a name string (up to 2 characters).
 */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
