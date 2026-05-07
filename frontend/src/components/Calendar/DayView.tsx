import React from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { isSameDay, eventOccursOnDay, getEventDaySegment } from '../../utils/dateUtils';
import { filterEvents } from '../../utils/searchUtils';
import { calculateEventPositions, calculateEventHeight, calculateEventTopWithRange, calculateOptimalTimeRange } from '../../utils/eventUtils';
import EventCard from '../Event/EventCard';
import CurrentTimeCursor from './CurrentTimeCursor';

const DayView: React.FC = () => {
  const { filteredEvents, currentDate, setSelectedEvent, searchFilters } = useCalendar();
  
  const searchFilteredEvents = filterEvents(filteredEvents, searchFilters);
  
  // Get events for the current day (includes multi-day and overlapping events)
  const dayEvents = searchFilteredEvents.filter(event => eventOccursOnDay(event, currentDate));

  const daySegments = dayEvents
    .map(event => ({ event, segment: getEventDaySegment(event, currentDate) }))
    .filter(({ segment }) => segment !== null);

  // Separate all-day segments from timed segments so multi-day middle sections render as all-day
  const allDaySegments = daySegments.filter(({ segment }) => segment?.mode === 'all-day');
  const timedDisplayEvents = daySegments
    .filter(({ segment }) => segment?.mode === 'timed' && segment)
    .map(({ event, segment }) => ({
      ...event,
      start_time: segment!.start_time,
      end_time: segment!.end_time
    }));

  // Sort timed events by start time
  timedDisplayEvents.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  
  // Calculate optimal time range based on day events
  const { startHour, endHour } = calculateOptimalTimeRange(timedDisplayEvents);
  const visibleHours = endHour - startHour;
  
  const HOUR_HEIGHT = 80; // Height of each hour slot in pixels
  const ALL_DAY_HEIGHT = 64; // Height for all-day events strip
  const today = new Date();
  const isToday = isSameDay(currentDate, today);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-24 day-view-header border-b border-gray-200 py-2 bg-gray-50">
        <div className="col-span-1 text-sm font-medium text-gray-500 text-center day-view-time-column">Time</div>
        <div className="col-span-23 text-sm font-medium text-gray-500 text-center">Events</div>
      </div>
      
      <div className="relative" style={{ paddingTop: `${allDaySegments.length > 0 ? ALL_DAY_HEIGHT : 0}px` }}>
        {/* Hour grid */}
        {Array.from({ length: visibleHours }).map((_, index) => {
          const hour = startHour + index;
          const displayHour = hour >= 24 ? hour - 24 : hour; // Handle midnight rollover
          return (
            <div key={hour} className="grid grid-cols-24 day-view-grid border-t border-gray-100 first:border-t-0" style={{ height: `${HOUR_HEIGHT}px` }}>
              <div className="col-span-1 text-xs text-gray-500 py-2 text-center border-r border-gray-100 day-view-time-column">
                {displayHour === 0 ? '12 AM' : displayHour < 12 ? `${displayHour} AM` : displayHour === 12 ? '12 PM' : `${displayHour - 12} PM`}
              </div>
              <div className="col-span-23"></div>
            </div>
          );
        })}
         {/* Events positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Events container with proper left margin to account for time column */}
          <div className="relative h-full pointer-events-auto day-view-events-margin" style={{ marginLeft: 'calc(100% / 24)' }}>
            {/* Current time cursor */}
            <CurrentTimeCursor 
              hourHeight={HOUR_HEIGHT} 
              isToday={isToday} 
              rangeStartHour={startHour}
              rangeEndHour={endHour}
            />
            
            {/* Render all-day events in a top strip */}
            {allDaySegments.length > 0 && (
              <div className="absolute left-0 right-0 px-2 py-1 flex flex-wrap gap-2 items-start content-start border-b border-gray-200 bg-gray-50" style={{ height: `${ALL_DAY_HEIGHT}px`, top: 0 }}>
                {allDaySegments.map(({ event, segment }) => (
                  <div key={`${event.uid}-${segment?.mode}`} className="flex-shrink-0">
                    <EventCard
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                      compact
                      timeLabelOverride="All day"
                    />
                  </div>
                ))}
              </div>
            )}

            {calculateEventPositions(timedDisplayEvents).map(event => {
              const top = calculateEventTopWithRange(event.start_time, HOUR_HEIGHT, startHour);
              const height = calculateEventHeight(event.start_time, event.end_time, HOUR_HEIGHT);
              
              // Calculate width and position - use full width when no overlapping events
              const width = event.totalColumns === 1 ? 100 : (100 / event.totalColumns);
              const left = event.totalColumns === 1 ? 0 : (width * event.column);
              
              return (
                <div
                  key={event.uid}
                  style={{ 
                    top: `${top}px`, 
                    height: `${height}px`, 
                    left: `${left}%`,
                    width: `${width}%`,
                    minHeight: '20px' 
                  }}
                  className="absolute overflow-hidden"
                >
                  <EventCard 
                    event={event} 
                    onClick={() => setSelectedEvent(event)}
                    compact
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;