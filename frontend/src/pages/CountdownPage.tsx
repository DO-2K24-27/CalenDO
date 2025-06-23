import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { useCalendar } from '../contexts/CalendarContext';
import CountdownTimer from '../components/Countdown/CountdownTimer';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorDisplay from '../components/UI/ErrorDisplay';
import { findNextBreak } from '../utils/dateUtils';

const CountdownPage: React.FC = () => {
  const { filteredEvents, selectedPlannings, isLoading, error, refreshEvents } = useCalendar();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  
  const nextBreakDate = useMemo(() => {
    return filteredEvents ? findNextBreak(filteredEvents) : null;
  }, [filteredEvents]);
  
  const isInEvent = useMemo(() => {
    if (!filteredEvents) return false;
    const now = new Date();
    return filteredEvents.some(event => 
      new Date(event.start_time) <= now && new Date(event.end_time) > now
    );
  }, [filteredEvents]);
  
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const handleBackToCalendar = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().finally(() => navigate('/'));
    } else {
      navigate('/');
    }
  }, [navigate]);

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
          <span className="ml-1">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
        </button>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-purple-700 mb-4 sm:mb-6 md:mb-8 text-center">
          {!nextBreakDate ? "You're in a break!" : isInEvent ? "Time Until Break" : "Break Ends In"}
        </h1>
        
        {selectedPlannings.length > 0 && selectedPlannings.length < 10 && (
          <div className="mb-6">
            <div className="flex gap-2 justify-center">
              {selectedPlannings.map((planning) => (
                <div
                  key={planning.id}
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: planning.color }}
                  title={planning.name}
                />
              ))}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <LoadingSpinner size="large" />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={refreshEvents} />
        ) : (
          <CountdownTimer breakDate={nextBreakDate} />
        )}
      </div>
    </div>
  );
};

export default CountdownPage;