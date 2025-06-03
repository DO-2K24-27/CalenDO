import { Event } from '../types';

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

export const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const getDaysInWeek = (date: Date): Date[] => {
  const day = date.getDay();
  const diff = date.getDate() - day;
  
  return Array(7)
    .fill(0)
    .map((_, index) => {
      const newDate = new Date(date);
      newDate.setDate(diff + index);
      return newDate;
    });
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + months);
  return newDate;
};

export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

export const findNextBreak = (events: Event[]): Date | null => {
  if (!events || events.length === 0) return null;
  
  const now = new Date();
  
  // First, check if we're currently in an event (event started but hasn't ended yet)
  const currentEvent = events.find(event => 
    new Date(event.start_time) <= now && new Date(event.end_time) > now
  );
  
  if (currentEvent) {
    // If we're in an event, the next break starts when this event ends
    return new Date(currentEvent.end_time);
  }
  
  // If we're not in an event, we're already in a break
  // No need to find the next break
  return null;
};

export const getTimeUntil = (target: string | Date): { days: number; hours: number; minutes: number; seconds: number } => {
  const targetDate = typeof target === 'string' ? new Date(target) : target;
  const now = new Date();
  
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const diffSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(diffSecs / 86400);
  const hours = Math.floor((diffSecs % 86400) / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;
  
  return { days, hours, minutes, seconds };
};

export const formatDuration = (
  { days, hours, minutes, seconds }: { days: number; hours: number; minutes: number; seconds: number }
): string => {
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
};