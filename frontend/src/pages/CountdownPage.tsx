import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { useCalendar } from '../contexts/CalendarContext';
import CountdownTimer from '../components/Countdown/CountdownTimer';
import CountdownDetails from '../components/Countdown/CountdownDetails';
import ClockDisplay from '../components/Countdown/ClockDisplay';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorDisplay from '../components/UI/ErrorDisplay';
import { findNextBreak } from '../utils/dateUtils';

const CountdownPage: React.FC = () => {
  const { filteredEvents, selectedPlannings, plannings, isLoading, error, refreshEvents } = useCalendar();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  
  const nextBreakDate = filteredEvents ? findNextBreak(filteredEvents) : null;
  
  // Determine if we're currently in an event or in a break
  const now = new Date();
  const currentEvents = filteredEvents?.filter(event => 
    new Date(event.start_time) <= now && new Date(event.end_time) > now
  ) || [];
  const isInEvent = currentEvents.length > 0;
  
  // Determine the countdown title based on current state
  const getCountdownTitle = () => {
    if (!nextBreakDate) {
      return "You're in a break!";
    }
    if (isInEvent) {
      if (currentEvents.length > 1) {
        return "Time Until Next Break";
      }
      return "Time Until Next Break";
    } else {
      return "Time Until Break Ends";
    }
  };

  const getPlanningSelectionText = () => {
    if (selectedPlannings.length === 0) {
      return "All plannings";
    }
    if (selectedPlannings.length === plannings.length) {
      return "All plannings";
    }
    if (selectedPlannings.length === 1) {
      return selectedPlannings[0].name;
    }
    return `${selectedPlannings.length} selected plannings`;
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const handleBackToCalendar = () => {
    // Exit fullscreen if currently in fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        navigate('/');
      }).catch(() => {
        // If exiting fullscreen fails, still navigate
        navigate('/');
      });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={handleBackToCalendar}
          className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Back to Calendar</span>
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="flex items-center text-purple-600 hover:text-purple-700 transition-colors"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          <span className="ml-1">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <ClockDisplay />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-purple-700 mb-4 text-center">
          {getCountdownTitle()}
        </h1>
        
        {/* Planning selection indicator */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
            <span className="text-sm text-purple-600">Considering:</span>
            <div className="flex gap-1">
              {selectedPlannings.length > 0 ? (
                selectedPlannings.slice(0, 3).map((planning) => (
                  <div
                    key={planning.id}
                    className="w-3 h-3 rounded-full border border-purple-300"
                    style={{ backgroundColor: planning.color }}
                    title={planning.name}
                  />
                ))
              ) : (
                <div className="w-3 h-3 rounded-full bg-gray-400 border border-purple-300" />
              )}
              {selectedPlannings.length > 3 && (
                <div className="w-3 h-3 rounded-full bg-gray-400 border border-purple-300 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">+</span>
                </div>
              )}
            </div>
            <span className="text-sm text-purple-700 font-medium">
              {getPlanningSelectionText()}
            </span>
          </div>
        </div>
        
        {isLoading ? (
          <LoadingSpinner size="large" />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={refreshEvents} />
        ) : (
          <>
            <CountdownTimer breakDate={nextBreakDate} />
            <CountdownDetails 
              breakDate={nextBreakDate} 
              isInEvent={isInEvent} 
              currentEventsCount={currentEvents.length} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CountdownPage;