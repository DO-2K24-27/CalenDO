import React, { useState } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { 
  getDaysInMonth, 
  getFirstDayOfMonth, 
  isSameDay 
} from '../../utils/dateUtils';
import { filterEvents } from '../../utils/searchUtils';
import EventCard from '../Event/EventCard';
import { Event } from '../../types';

const MonthView: React.FC = () => {
  const { 
    filteredEvents, 
    currentDate,
    setSelectedEvent,
    searchFilters
  } = useCalendar();

  const [showMoreEventsModal, setShowMoreEventsModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const searchFilteredEvents = filterEvents(filteredEvents, searchFilters);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const handleShowMoreEvents = (date: Date, events: Event[]) => {
    setSelectedDate(date);
    setSelectedDayEvents(events);
    setShowMoreEventsModal(true);
  };
  
  const handleCloseModal = () => {
    setShowMoreEventsModal(false);
    setSelectedDayEvents([]);
    setSelectedDate(null);
  };
  
  const renderDays = () => {
    const days = [];
    const today = new Date();
    
    // Previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div 
          key={`prev-${i}`} 
          className="calendar-cell p-1 bg-gray-50 text-gray-400 border border-gray-100"
        >
          <div className="text-xs text-right p-1"></div>
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, today);
      
      // Get events for this day
      const dayEvents = searchFilteredEvents
        .filter(event => {
          const eventStart = new Date(event.start_time);
          return isSameDay(eventStart, date);
        })
        .sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-cell p-1 border border-gray-100 ${
            isToday ? 'bg-purple-50' : 'bg-white'
          }`}
        >
          <div className={`text-xs text-right p-1 ${
            isToday ? 'font-bold bg-purple-600 text-white rounded-full w-5 h-5 flex items-center justify-center ml-auto' : ''
          }`}>
            {day}
          </div>
          <div className="overflow-y-auto max-h-[calc(100%-20px)]">
            {dayEvents.slice(0, 3).map(event => (
              <EventCard 
                key={event.uid} 
                event={event} 
                onClick={() => setSelectedEvent(event)}
                compact
              />
            ))}
            {dayEvents.length > 3 && (
              <button
                onClick={() => handleShowMoreEvents(date, dayEvents.slice(3))}
                className="text-xs text-purple-600 hover:text-purple-800 mt-1 text-center w-full hover:bg-purple-50 rounded py-1 transition-colors duration-200"
              >
                +{dayEvents.length - 3} more
              </button>
            )}
          </div>
        </div>
      );
    }
    
    // Calculate how many days to add for the next month to complete the grid
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;
    const remainingCells = totalCells - (daysInMonth + firstDayOfMonth);
    
    // Next month days
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div 
          key={`next-${i}`} 
          className="calendar-cell p-1 bg-gray-50 text-gray-400 border border-gray-100"
        >
          <div className="text-xs text-right p-1"></div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-7 text-center py-2 border-b border-gray-200 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderDays()}
        </div>
      </div>

      {/* More Events Modal */}
      {showMoreEventsModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDate && selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="space-y-2">
                {selectedDayEvents.map(event => (
                  <EventCard 
                    key={event.uid} 
                    event={event} 
                    onClick={() => {
                      setSelectedEvent(event);
                      handleCloseModal();
                    }}
                    compact={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonthView;