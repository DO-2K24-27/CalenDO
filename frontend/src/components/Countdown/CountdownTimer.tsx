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
  
  // Calculate font size based on available units for better scaling
  const unitCount = [showDays, showHours, showMinutes, true].filter(Boolean).length;
  
  // Dynamic font size classes based on number of units
  const getNumberSize = () => {
    if (unitCount === 1) return "text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem] 2xl:text-[16rem]";
    if (unitCount === 2) return "text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[12rem]";
    if (unitCount === 3) return "text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]";
    return "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl";
  };
  
  const getLabelSize = () => {
    if (unitCount === 1) return "text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl";
    if (unitCount === 2) return "text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl";
    if (unitCount === 3) return "text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl";
    return "text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl";
  };
  
  const getSeparatorSize = () => {
    if (unitCount === 1) return "text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[12rem]";
    if (unitCount === 2) return "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl";
    if (unitCount === 3) return "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl";
    return "text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl";
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8">
        {showDays && (
          <>
            <div className="flex flex-col items-center">
              <div className={`${getNumberSize()} font-bold text-purple-700 leading-none`}>{days}</div>
              <div className={`${getLabelSize()} text-purple-500 mt-1 sm:mt-2`}>Days</div>
            </div>
            {(showHours || showMinutes) && <div className={`${getSeparatorSize()} font-bold text-purple-300 leading-none`}>:</div>}
          </>
        )}
        {showHours && (
          <>
            <div className="flex flex-col items-center">
              <div className={`${getNumberSize()} font-bold text-purple-700 leading-none`}>{hours}</div>
              <div className={`${getLabelSize()} text-purple-500 mt-1 sm:mt-2`}>Hours</div>
            </div>
            {showMinutes && <div className={`${getSeparatorSize()} font-bold text-purple-300 leading-none`}>:</div>}
          </>
        )}
        {showMinutes && (
          <>
            <div className="flex flex-col items-center">
              <div className={`${getNumberSize()} font-bold text-purple-700 leading-none`}>{minutes}</div>
              <div className={`${getLabelSize()} text-purple-500 mt-1 sm:mt-2`}>Minutes</div>
            </div>
            <div className={`${getSeparatorSize()} font-bold text-purple-300 leading-none`}>:</div>
          </>
        )}
        <div className="flex flex-col items-center">
          <div className={`${getNumberSize()} font-bold text-purple-700 leading-none`}>{seconds}</div>
          <div className={`${getLabelSize()} text-purple-500 mt-1 sm:mt-2`}>Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default memo(CountdownTimer);