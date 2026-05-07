import React from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { getDaysInWeek, isSameDay, formatShortDate, getVisibleWeekDays, getEventDaySegment } from '../../utils/dateUtils';
import { filterEvents } from '../../utils/searchUtils';
import { calculateEventPositions, calculateEventHeight, calculateEventTopWithRange, calculateOptimalTimeRange } from '../../utils/eventUtils';
import EventCard from '../Event/EventCard';
import CurrentTimeCursor from './CurrentTimeCursor';

const WeekView: React.FC = () => {
  const { filteredEvents, currentDate, setSelectedEvent, searchFilters } = useCalendar();
  
  const searchFilteredEvents = filterEvents(filteredEvents, searchFilters);
  const allWeekDays = getDaysInWeek(currentDate);
  
  // Filter out unused weekend days
  const weekDays = getVisibleWeekDays(allWeekDays, searchFilteredEvents);
  const today = new Date();
  
  const weekDaySegments = weekDays.flatMap(day =>
    searchFilteredEvents
      .map(event => ({ event, segment: getEventDaySegment(event, day), day }))
      .filter(({ segment }) => segment !== null)
  );

  const weekEvents = weekDaySegments
    .filter(({ segment }) => segment?.mode === 'timed')
    .map(({ event, segment }) => ({
      ...event,
      start_time: segment!.start_time,
      end_time: segment!.end_time
    }));
  
  // Calculate optimal time range based on all week events
  const { startHour, endHour } = calculateOptimalTimeRange(weekEvents);
  const visibleHours = endHour - startHour;
  
  const HOUR_HEIGHT = 80; // Height of each hour slot in pixels
  const ALL_DAY_HEIGHT = 64;
  const weekHasAllDay = weekDaySegments.some(({ segment }) => segment?.mode === 'all-day');
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="week-view-header text-center py-2 border-b border-gray-200 bg-gray-50"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `auto repeat(${weekDays.length}, 1fr)` 
        }}
      >
        <div className="text-sm font-medium text-gray-500 week-view-time-column">Time</div>
        {weekDays.map((day, index) => (
          <div key={index} className="text-sm font-medium text-gray-500">
            <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</div>
            <div className={isSameDay(day, today) ? 'text-purple-600 font-bold' : ''}>
              {formatShortDate(day)}
            </div>
          </div>
        ))}
      </div>
      
      <div 
        className="week-view-grid divide-x divide-gray-200 relative"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `auto repeat(${weekDays.length}, 1fr)` 
        }}
      >
        {/* Time column */}
        <div className="space-y-0" style={{ paddingTop: `${weekHasAllDay ? ALL_DAY_HEIGHT : 0}px` }}>
          {Array.from({ length: visibleHours }).map((_, index) => {
            const hour = startHour + index;
            const displayHour = hour >= 24 ? hour - 24 : hour; // Handle midnight rollover
            return (
              <div key={hour} className="text-xs text-gray-500 text-right pr-2 border-t border-gray-100 first:border-t-0 flex items-start pt-1 week-view-time-column" style={{ height: `${HOUR_HEIGHT}px` }}>
                {displayHour === 0 ? '12 AM' : displayHour < 12 ? `${displayHour} AM` : displayHour === 12 ? '12 PM' : `${displayHour - 12} PM`}
              </div>
            );
          })}
        </div>
        
        {/* Day columns */}
        {weekDays.map((day, dayIndex) => {
          // Get events for this day (includes multi-day & overlapping events)
          const daySegments = searchFilteredEvents
            .map(event => ({ event, segment: getEventDaySegment(event, day) }))
            .filter(({ segment }) => segment !== null);

          // Separate all-day events from timed events
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
          
          return (
            <div 
              key={dayIndex} 
              className={`relative ${isSameDay(day, today) ? 'bg-purple-50' : ''}`}
              style={{ paddingTop: `${weekHasAllDay ? ALL_DAY_HEIGHT : 0}px` }}
            >
              {/* All-day strip */}
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
              {/* Hour grid for this day */}
              {Array.from({ length: visibleHours }).map((_, index) => {
                const hour = startHour + index;
                return (
                  <div key={hour} className="border-t border-gray-100 first:border-t-0" style={{ height: `${HOUR_HEIGHT}px` }}></div>
                );
              })}
              
              {/* Current time cursor for today */}
              {isSameDay(day, today) && (
                <CurrentTimeCursor 
                  hourHeight={HOUR_HEIGHT} 
                  isToday={true} 
                  rangeStartHour={startHour}
                  rangeEndHour={endHour}
                />
              )}
              
              {/* Events for this day */}
              {calculateEventPositions(timedDisplayEvents).map(event => {
                const top = calculateEventTopWithRange(event.start_time, HOUR_HEIGHT, startHour);
                const height = calculateEventHeight(event.start_time, event.end_time, HOUR_HEIGHT);
                
                const width = 100 / event.totalColumns;
                const left = (width * event.column);
                
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
                    className="absolute overflow-hidden pr-1"
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
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;