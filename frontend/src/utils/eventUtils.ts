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
  const endHour = end.getHours() + end.getMinutes() / 60;
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
