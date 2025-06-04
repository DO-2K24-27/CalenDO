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
  const { events, isLoading, error, refreshEvents } = useCalendar();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  
  const nextBreakDate = events ? findNextBreak(events) : null;
  
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
        
        <h1 className="text-3xl md:text-5xl font-bold text-purple-700 mb-8 text-center">
          Time Until Next Break
        </h1>
        
        {isLoading ? (
          <LoadingSpinner size="large" />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={refreshEvents} />
        ) : (
          <>
            <CountdownTimer breakDate={nextBreakDate} />
            <CountdownDetails breakDate={nextBreakDate} />
          </>
        )}
      </div>
    </div>
  );
};

export default CountdownPage;