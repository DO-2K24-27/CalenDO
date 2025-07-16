import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useCalendar } from '../../contexts/CalendarContext';
import { formatDate, addMonths, addDays } from '../../utils/dateUtils';
import { PlanningSelectionSummary } from '../Planning/PlanningSelectionSummary';

const CalendarHeader: React.FC = () => {
  const { currentDate, view, setCurrentDate, refreshEvents, isLoading } = useCalendar();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <div className="mb-4">
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold truncate`}>
            {formatDate(currentDate)}
          </h2>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleToday}
            className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors`}
          >
            Today
          </button>
          
          <button
            onClick={handlePrevious}
            className="p-1 rounded-full hover:bg-purple-100 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={isMobile ? 18 : 20} />
          </button>
          
          <button
            onClick={handleNext}
            className="p-1 rounded-full hover:bg-purple-100 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={isMobile ? 18 : 20} />
          </button>
          
          <button
            onClick={() => refreshEvents()}
            disabled={isLoading}
            className={`p-1 rounded-full hover:bg-purple-100 transition-colors ${
              isLoading ? 'animate-spin' : ''
            }`}
            aria-label="Refresh"
          >
            <RefreshCw size={isMobile ? 18 : 20} />
          </button>
        </div>
      </div>
      
      {/* Planning selection summary - hidden on mobile since it's in the burger menu */}
      {!isMobile && (
        <div className="mt-2">
          <PlanningSelectionSummary />
        </div>
      )}
    </div>
  );
};

export default CalendarHeader;