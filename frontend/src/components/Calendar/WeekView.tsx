import React from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { getDaysInWeek, isSameDay, formatShortDate } from '../../utils/dateUtils';
import { filterEvents } from '../../utils/searchUtils';
import { calculateEventPositions, calculateEventHeight, calculateEventTopWithRange, calculateOptimalTimeRange } from '../../utils/eventUtils';
import EventCard from '../Event/EventCard';
import CurrentTimeCursor from './CurrentTimeCursor';

const WeekView: React.FC = () => {
  const { filteredEvents, currentDate, setSelectedEvent, searchFilters } = useCalendar();
  
  const searchFilteredEvents = filterEvents(filteredEvents, searchFilters);
  const weekDays = getDaysInWeek(currentDate);
  const today = new Date();
  
  // Get all events for the week to calculate optimal time range
  const weekEvents = searchFilteredEvents.filter(event => {
    const eventStart = new Date(event.start_time);
    return weekDays.some(day => isSameDay(eventStart, day));
  });
  
  // Calculate optimal time range based on all week events
  const { startHour, endHour } = calculateOptimalTimeRange(weekEvents);
  const visibleHours = endHour - startHour;
  
  const HOUR_HEIGHT = 80; // Height of each hour slot in pixels
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="grid grid-cols-8 week-view-header text-center py-2 border-b border-gray-200 bg-gray-50">
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
      
      <div className="grid grid-cols-8 week-view-grid divide-x divide-gray-200 relative">
        {/* Time column */}
        <div className="space-y-0">
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
          // Get events for this day
          const dayEvents = searchFilteredEvents.filter(event => {
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
              {calculateEventPositions(dayEvents).map(event => {
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