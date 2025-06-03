import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { formatDate, addMonths, addDays } from '../../utils/dateUtils';

const CalendarHeader: React.FC = () => {
  const { currentDate, view, setCurrentDate, refreshEvents, isLoading } = useCalendar();

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-4 py-2">
      <div className="flex items-center space-x-2">
        <h2 className="text-xl font-semibold">
          {formatDate(currentDate)}
        </h2>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={handleToday}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
        >
          Today
        </button>
        
        <button
          onClick={handlePrevious}
          className="p-1 rounded-full hover:bg-purple-100 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={handleNext}
          className="p-1 rounded-full hover:bg-purple-100 transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
        
        <button
          onClick={() => refreshEvents()}
          disabled={isLoading}
          className={`p-1 rounded-full hover:bg-purple-100 transition-colors ${
            isLoading ? 'animate-spin' : ''
          }`}
          aria-label="Refresh"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;