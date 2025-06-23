import React, { useState, useEffect, useCallback, memo } from 'react';
import { getTimeUntil } from '../../utils/dateUtils';

interface CountdownTimerProps {
  breakDate: Date | null;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ breakDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const updateTimer = useCallback(() => {
    if (!breakDate) return;
    setTimeLeft(getTimeUntil(breakDate));
  }, [breakDate]);
  
  useEffect(() => {
    if (!breakDate) return;
    
    // Initial update
    updateTimer();
    
    // Update every second
    const timerId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timerId);
  }, [breakDate, updateTimer]);
  
  if (!breakDate) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">Enjoy your break!</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">No upcoming events</p>
      </div>
    );
  }
  
  const { days, hours, minutes, seconds } = timeLeft;
  
  // Only show units that are relevant
  const showDays = days > 0;
  const showHours = hours > 0 || showDays;
  const showMinutes = minutes > 0 || showHours;
  
  return (
    <div className="text-center">
      <div className="flex justify-center items-center space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-6">
        {showDays && (
          <>
            <div className="flex flex-col items-center">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-purple-700">{days}</div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-purple-500">Days</div>
            </div>
            {(showHours || showMinutes) && <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-purple-300">:</div>}
          </>
        )}
        {showHours && (
          <>
            <div className="flex flex-col items-center">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-purple-700">{hours}</div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-purple-500">Hours</div>
            </div>
            {showMinutes && <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-purple-300">:</div>}
          </>
        )}
        {showMinutes && (
          <>
            <div className="flex flex-col items-center">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-purple-700">{minutes}</div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg text-purple-500">Minutes</div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-purple-300">:</div>
          </>
        )}
        <div className="flex flex-col items-center">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-purple-700">{seconds}</div>
          <div className="text-xs sm:text-sm md:text-base lg:text-lg text-purple-500">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default memo(CountdownTimer);