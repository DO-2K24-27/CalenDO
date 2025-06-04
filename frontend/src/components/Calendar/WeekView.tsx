import React from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { getDaysInWeek, isSameDay, formatShortDate } from '../../utils/dateUtils';
import { filterEvents } from '../../utils/searchUtils';
import { calculateEventPositions, calculateEventHeight, calculateEventTop } from '../../utils/eventUtils';
import EventCard from '../Event/EventCard';
import CurrentTimeCursor from './CurrentTimeCursor';

const WeekView: React.FC = () => {
  const { events, currentDate, setSelectedEvent, searchFilters } = useCalendar();
  
  const filteredEvents = filterEvents(events, searchFilters);
  const weekDays = getDaysInWeek(currentDate);
  const today = new Date();
  
  const HOUR_HEIGHT = 80; // Height of each hour slot in pixels
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-8 text-center py-2 border-b border-gray-200 bg-gray-50">
        <div className="text-sm font-medium text-gray-500">Time</div>
        {weekDays.map((day, index) => (
          <div key={index} className="text-sm font-medium text-gray-500">
            <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</div>
            <div className={isSameDay(day, today) ? 'text-purple-600 font-bold' : ''}>
              {formatShortDate(day)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-8 divide-x divide-gray-200 relative">
        {/* Time column */}
        <div className="space-y-0">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div key={hour} className="text-xs text-gray-500 text-right pr-2 border-t border-gray-100 first:border-t-0 flex items-start pt-1" style={{ height: `${HOUR_HEIGHT}px` }}>
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}
        </div>
        
        {/* Day columns */}
        {weekDays.map((day, dayIndex) => {
          // Get events for this day
          const dayEvents = filteredEvents.filter(event => {
            const eventStart = new Date(event.start_time);
            return isSameDay(eventStart, day);
          });
          
          // Sort events by start time
          dayEvents.sort((a, b) => 
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
          
          return (
            <div 
              key={dayIndex} 
              className={`relative ${isSameDay(day, today) ? 'bg-purple-50' : ''}`}
            >
              {/* Hour grid for this day */}
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="border-t border-gray-100 first:border-t-0" style={{ height: `${HOUR_HEIGHT}px` }}></div>
              ))}
              
              {/* Current time cursor for today */}
              {isSameDay(day, today) && (
                <CurrentTimeCursor hourHeight={HOUR_HEIGHT} isToday={true} />
              )}
              
              {/* Events for this day */}
              {calculateEventPositions(dayEvents).map(event => {
                const top = calculateEventTop(event.start_time, HOUR_HEIGHT);
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