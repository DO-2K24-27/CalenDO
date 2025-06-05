import { Event } from '../types';

export interface PositionedEvent extends Event {
  column: number;
  totalColumns: number;
}

/**
 * Calculates positioning for overlapping events to prevent them from overlapping visually
 */
export const calculateEventPositions = (events: Event[]): PositionedEvent[] => {
  if (events.length === 0) return [];

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const positionedEvents: PositionedEvent[] = [];
  const activeEvents: PositionedEvent[] = [];

  for (const event of sortedEvents) {
    const eventStart = new Date(event.start_time);

    // Remove events that have ended
    const stillActive = activeEvents.filter(activeEvent => {
      const activeEnd = new Date(activeEvent.end_time);
      return activeEnd > eventStart;
    });
    activeEvents.length = 0;
    activeEvents.push(...stillActive);

    // Find the first available column
    const usedColumns = new Set(activeEvents.map(e => e.column));
    let column = 0;
    while (usedColumns.has(column)) {
      column++;
    }

    const positionedEvent: PositionedEvent = {
      ...event,
      column,
      totalColumns: Math.max(column + 1, activeEvents.length + 1)
    };

    positionedEvents.push(positionedEvent);
    activeEvents.push(positionedEvent);

    // Update totalColumns for all active events
    const maxColumns = Math.max(...activeEvents.map(e => e.column)) + 1;
    activeEvents.forEach(activeEvent => {
      activeEvent.totalColumns = maxColumns;
    });
  }

  return positionedEvents;
};

/**
 * Calculates the height of an event in pixels based on its duration
 */
export const calculateEventHeight = (startTime: string, endTime: string, hourHeight: number): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const startHour = start.getHours() + start.getMinutes() / 60;
  let endHour = end.getHours() + end.getMinutes() / 60;
  
  // Handle midnight (0:00) as end of day - treat as 24:00 for calculation
  if (end.getHours() === 0 && end.getMinutes() === 0) {
    endHour = 24;
  }
  
  const duration = Math.max(0.25, endHour - startHour); // Minimum 15 minutes
  
  return duration * hourHeight;
};

/**
 * Calculates the top position of an event in pixels
 */
export const calculateEventTop = (startTime: string, hourHeight: number): number => {
  const start = new Date(startTime);
  const startHour = start.getHours() + start.getMinutes() / 60;
  
  return startHour * hourHeight;
};

/**
 * Calculates the current time position in pixels
 */
export const calculateCurrentTimePosition = (hourHeight: number): number => {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  
  return currentHour * hourHeight;
};

/**
 * Calculates the optimal time range for displaying events
 * Returns start and end hours based on event times, with minimum range of 6am-8pm
 */
export const calculateOptimalTimeRange = (events: Event[]): { startHour: number; endHour: number } => {
  if (events.length === 0) {
    return { startHour: 6, endHour: 20 }; // Default 6am-8pm if no events
  }

  let earliestHour = 24;
  let latestHour = 0;

  events.forEach(event => {
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    let endHour = endTime.getHours() + endTime.getMinutes() / 60;
    
    // Handle midnight (0:00) as end of day - treat as 24:00 for calculation
    if (endTime.getHours() === 0 && endTime.getMinutes() === 0) {
      endHour = 24;
    }
    
    earliestHour = Math.min(earliestHour, startHour);
    latestHour = Math.max(latestHour, endHour);
  });

  // Floor and ceil to get full hours, but handle the special case of 24 (midnight)
  const startHour = Math.floor(earliestHour);
  let endHour = Math.ceil(latestHour);
  
  // If end hour is 24 (midnight), we still want to show up to 23:xx, so keep it as 24
  if (endHour > 24) {
    endHour = 24;
  }

  // If no events before 6am or after 8pm, use default range
  if (startHour >= 6 && endHour <= 20) {
    return { startHour: 6, endHour: 20 };
  }

  // Otherwise, use the actual range with some padding
  return {
    startHour: Math.max(0, startHour - 1), // Add 1 hour padding before
    endHour: Math.min(24, endHour + 1)     // Add 1 hour padding after
  };
};

/**
 * Calculates the top position of an event based on a custom start hour
 */
export const calculateEventTopWithRange = (startTime: string, hourHeight: number, rangeStartHour: number): number => {
  const start = new Date(startTime);
  const startHour = start.getHours() + start.getMinutes() / 60;
  
  return (startHour - rangeStartHour) * hourHeight;
};

/**
 * Calculates the current time position based on a custom start hour
 */
export const calculateCurrentTimePositionWithRange = (hourHeight: number, rangeStartHour: number): number => {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  
  return (currentHour - rangeStartHour) * hourHeight;
};
