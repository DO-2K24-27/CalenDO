import React, { useState, useEffect } from 'react';
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

  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number}>({top: 0, left: 0, width: 0});

  const searchFilteredEvents = filterEvents(filteredEvents, searchFilters);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const handleShowMoreEvents = (dateStr: string, events: Event[], buttonElement: HTMLElement) => {
    if (showDropdown === dateStr) {
      setShowDropdown(null);
      setSelectedDayEvents([]);
    } else {
      const updatePosition = () => {
        const calendarCell = buttonElement.closest('.calendar-cell') as HTMLElement;
        const cellRect = calendarCell.getBoundingClientRect();
        const buttonRect = buttonElement.getBoundingClientRect();
        setDropdownPosition({
          top: buttonRect.bottom + 2,
          left: cellRect.left,
          width: cellRect.width
        });
      };
      
      updatePosition();
      setSelectedDayEvents(events);
      setShowDropdown(dateStr);
    }
  };

  // Close dropdown when clicking outside and update position on scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setShowDropdown(null);
        setSelectedDayEvents([]);
      }
    };

    const handleScroll = () => {
      if (showDropdown) {
        const buttonElement = document.querySelector(`[data-date="${showDropdown}"] button`) as HTMLElement;
        if (buttonElement) {
          const calendarCell = buttonElement.closest('.calendar-cell') as HTMLElement;
          const cellRect = calendarCell.getBoundingClientRect();
          const buttonRect = buttonElement.getBoundingClientRect();
          setDropdownPosition({
            top: buttonRect.bottom + 2,
            left: cellRect.left,
            width: cellRect.width
          });
        }
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [showDropdown]);

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
      const dateStr = `${year}-${month}-${day}`;
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
          data-date={dateStr}
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
              <div className="dropdown-container relative">
                <button
                  onClick={(e) => handleShowMoreEvents(dateStr, dayEvents.slice(3), e.currentTarget)}
                  className="text-xs text-purple-600 hover:text-purple-800 mt-1 text-center w-full hover:bg-purple-50 rounded py-1 transition-colors duration-200"
                >
                  +{dayEvents.length - 3} more
                </button>
                {showDropdown === dateStr && (
                  <div 
                    className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`
                    }}
                  >
                    <div className="p-2 space-y-1">
                      {selectedDayEvents.map(event => (
                        <EventCard 
                          key={event.uid} 
                          event={event} 
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDropdown(null);
                          }}
                          compact={true}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
  );
};

export default MonthView;