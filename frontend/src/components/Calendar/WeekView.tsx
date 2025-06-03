import React from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { getDaysInWeek, isSameDay, formatShortDate, formatTime } from '../../utils/dateUtils';
import { filterEvents } from '../../utils/searchUtils';
import EventCard from '../Event/EventCard';

const WeekView: React.FC = () => {
  const { events, currentDate, setSelectedEvent, searchFilters } = useCalendar();
  
  const filteredEvents = filterEvents(events, searchFilters);
  const weekDays = getDaysInWeek(currentDate);
  const today = new Date();
  
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
      
      <div className="grid grid-cols-8 divide-x divide-gray-200">
        <div className="space-y-2 pr-2 pt-4">
          {Array.from({ length: 24 }).map((_, hour) => (
            <div key={hour} className="text-xs text-gray-500 h-20 text-right pr-1">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}
        </div>
        
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
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="h-20 border-t border-gray-100 first:border-t-0"></div>
              ))}
              
              {dayEvents.map(event => {
                const startTime = new Date(event.start_time);
                const endTime = new Date(event.end_time);
                
                const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                const endHour = endTime.getHours() + endTime.getMinutes() / 60;
                const duration = endHour - startHour;
                
                const top = `${startHour * 20}px`;
                const height = `${duration * 20}px`;
                
                return (
                  <div
                    key={event.uid}
                    style={{ top, height, minHeight: '20px' }}
                    className="absolute left-0 right-0 mx-1 overflow-hidden"
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