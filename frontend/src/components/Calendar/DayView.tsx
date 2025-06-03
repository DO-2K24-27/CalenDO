import React from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { isSameDay } from '../../utils/dateUtils';
import { filterEvents } from '../../utils/searchUtils';
import { calculateEventPositions, calculateEventHeight, calculateEventTop } from '../../utils/eventUtils';
import EventCard from '../Event/EventCard';

const DayView: React.FC = () => {
  const { events, currentDate, setSelectedEvent, searchFilters } = useCalendar();
  
  const filteredEvents = filterEvents(events, searchFilters);
  
  // Get events for the current day
  const dayEvents = filteredEvents.filter(event => {
    const eventStart = new Date(event.start_time);
    return isSameDay(eventStart, currentDate);
  });
  
  // Sort events by start time
  dayEvents.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  
  const HOUR_HEIGHT = 80; // Height of each hour slot in pixels
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-24 border-b border-gray-200 py-2 bg-gray-50">
        <div className="col-span-1 text-sm font-medium text-gray-500 text-center">Time</div>
        <div className="col-span-23 text-sm font-medium text-gray-500 text-center">Events</div>
      </div>
      
      <div className="relative">
        {/* Hour grid */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={hour} className="grid grid-cols-24 border-t border-gray-100 first:border-t-0" style={{ height: `${HOUR_HEIGHT}px` }}>
            <div className="col-span-1 text-xs text-gray-500 py-2 text-center border-r border-gray-100">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className="col-span-23"></div>
          </div>
        ))}
        
        {/* Events positioned absolutely */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="grid grid-cols-24 h-full">
            <div className="col-span-1"></div>
            <div className="col-span-23 relative pointer-events-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;