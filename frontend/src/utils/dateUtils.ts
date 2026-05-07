import { Event } from '../types';

export const formatDate = (date: Date, timeZone?: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(timeZone ? { timeZone } : {})
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
  // Calculate days back to Monday (1)
  // Sunday (0) -> 6 days back, Monday (1) -> 0 days back, etc.
  const diff = (day - 1 + 7) % 7;
  
  return Array(7)
    .fill(0)
    .map((_, index) => {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - diff + index);
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
  
  // Find all current events (events that have started but not ended yet)
  const currentEvents = events.filter(event => 
    new Date(event.start_time) <= now && new Date(event.end_time) > now
  );
  
  if (currentEvents.length > 0) {
    // If we're in one or more events, find the one that ends soonest
    // The next break starts when the earliest ending current event finishes
    const earliestEndingEvent = currentEvents.reduce((earliest, current) => {
      const currentEndTime = new Date(current.end_time);
      const earliestEndTime = new Date(earliest.end_time);
      return currentEndTime < earliestEndTime ? current : earliest;
    });
    
    return new Date(earliestEndingEvent.end_time);
  }
  
  // If we're not currently in any event, find the next upcoming event
  // The break will end when that event starts
  const upcomingEvents = events.filter(event => 
    new Date(event.start_time) > now
  );
  
  if (upcomingEvents.length > 0) {
    // Sort by start time and get the earliest
    const nextEvent = upcomingEvents.reduce((earliest, current) => {
      const currentStartTime = new Date(current.start_time);
      const earliestStartTime = new Date(earliest.start_time);
      return currentStartTime < earliestStartTime ? current : earliest;
    });
    
    // We're currently in a break, return when the next event starts
    // This indicates when the current break will end
    return new Date(nextEvent.start_time);
  }
  
  // If no upcoming events, we're in an indefinite break
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

// Weekend filtering utilities
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

export const getVisibleWeekDays = (weekDays: Date[], events: Event[]): Date[] => {
  return weekDays.filter(day => {
    const dayOfWeek = day.getDay();
    
    // Always show weekdays (Monday-Friday)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return true;
    }
    
    // For weekends, only show if there are events on that day
    const hasEvents = events.some(event => eventOccursOnDay(event, day));
    
    return hasEvents;
  });
};

export const getWeekendVisibility = (weekDays: Date[], events: Event[]): { showSunday: boolean; showSaturday: boolean } => {
  const sunday = weekDays.find(day => day.getDay() === 0);
  const saturday = weekDays.find(day => day.getDay() === 6);
  
  const showSunday = sunday ? events.some(event => {
    return eventOccursOnDay(event, sunday);
  }) : false;
  
  const showSaturday = saturday ? events.some(event => {
    return eventOccursOnDay(event, saturday);
  }) : false;
  
  return { showSunday, showSaturday };
};

// Determine whether an event occurs on the given day (handles multi-day and all-day events)
export const eventOccursOnDay = (event: Event, day: Date): boolean => {
  const eventStart = new Date(event.start_time);
  const eventEnd = new Date(event.end_time);

  if (event.all_day) {
    // Compare using UTC dates and treat end as exclusive
    const dayUtc = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
    const startUtc = Date.UTC(eventStart.getUTCFullYear(), eventStart.getUTCMonth(), eventStart.getUTCDate());
    const endUtc = Date.UTC(eventEnd.getUTCFullYear(), eventEnd.getUTCMonth(), eventEnd.getUTCDate());
    return dayUtc >= startUtc && dayUtc < endUtc;
  }

  // For timed events, check for any overlap with the day's local range
  const dayStartLocal = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const dayEndLocal = new Date(dayStartLocal.getTime() + 24 * 60 * 60 * 1000);

  return eventStart < dayEndLocal && eventEnd > dayStartLocal;
};

export interface EventDaySegment {
  mode: 'timed' | 'all-day';
  start_time: string;
  end_time: string;
}

export const getEventDaySegment = (event: Event, day: Date): EventDaySegment | null => {
  if (!eventOccursOnDay(event, day)) {
    return null;
  }

  if (event.all_day) {
    return {
      mode: 'all-day',
      start_time: event.start_time,
      end_time: event.end_time
    };
  }

  const eventStart = new Date(event.start_time);
  const eventEnd = new Date(event.end_time);
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const startsBeforeDay = eventStart < dayStart;
  const endsAfterDay = eventEnd > dayEnd;

  if (startsBeforeDay && endsAfterDay) {
    return {
      mode: 'all-day',
      start_time: event.start_time,
      end_time: event.end_time
    };
  }

  const startTime = startsBeforeDay ? dayStart : eventStart;
  const endTime = endsAfterDay ? dayEnd : eventEnd;

  return {
    mode: 'timed',
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString()
  };
};

// Get the start and end dates of the week containing the given date
export const getWeekStartEnd = (date: Date): { start: Date; end: Date } => {
  const weekDays = getDaysInWeek(date);
  return {
    start: weekDays[0],
    end: weekDays[6]
  };
};

// Get the start and end dates of the month containing the given date
export const getMonthStartEnd = (date: Date): { start: Date; end: Date } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
};

// Format date range based on view type
export const formatDateRange = (date: Date, viewType: 'day' | 'week' | 'month'): string => {
  if (viewType === 'day') {
    return formatDate(date);
  }
  
  if (viewType === 'week') {
    const { start, end } = getWeekStartEnd(date);
    const startFormatted = formatShortDate(start);
    const endFormatted = formatShortDate(end);
    return `${startFormatted} - ${endFormatted}`;
  }
  
  if (viewType === 'month') {
    const { start } = getMonthStartEnd(date);
    const monthYear = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(start);
    return monthYear;
  }
  
  return formatDate(date);
};