import React from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { isSameDay } from '../../utils/dateUtils';
import { filterEvents } from '../../utils/searchUtils';
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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-24 border-b border-gray-200 py-2 bg-gray-50">
        <div className="col-span-1 text-sm font-medium text-gray-500 text-center">Time</div>
        <div className="col-span-23 text-sm font-medium text-gray-500 text-center">Events</div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 24 }).map((_, hour) => {
          const hourEvents = dayEvents.filter(event => {
            const startHour = new Date(event.start_time).getHours();
            return startHour === hour;
          });
          
          return (
            <div key={hour} className="grid grid-cols-24 min-h-[80px]">
              <div className="col-span-1 text-xs text-gray-500 py-2 text-center border-r border-gray-100">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              
              <div className="col-span-23 py-1 px-2">
                {hourEvents.length > 0 ? (
                  <div className="space-y-1">
                    {hourEvents.map(event => (
                      <EventCard
                        key={event.uid}
                        event={event}
                        onClick={() => setSelectedEvent(event)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-full"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;