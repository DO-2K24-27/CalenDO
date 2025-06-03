import React, { useState, useEffect } from 'react';
import { Event } from '../../types';
import { getTimeUntil } from '../../utils/dateUtils';

interface CountdownTimerProps {
  event: Event | null;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ event }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    if (!event) return;
    
    const updateTimer = () => {
      setTimeLeft(getTimeUntil(event.start_time));
    };
    
    // Initial update
    updateTimer();
    
    // Update every second
    const timerId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timerId);
  }, [event]);
  
  if (!event) {
    return (
      <div className="text-center p-8">
        <h2 className="text-3xl font-bold text-gray-400">No upcoming breaks</h2>
      </div>
    );
  }
  
  const { days, hours, minutes, seconds } = timeLeft;
  
  return (
    <div className="text-center">
      <div className="flex justify-center items-center space-x-4 md:space-x-8">
        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-bold text-purple-700">{days}</div>
          <div className="text-lg md:text-xl text-purple-500">Days</div>
        </div>
        <div className="text-4xl md:text-6xl font-bold text-purple-300">:</div>
        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-bold text-purple-700">{hours}</div>
          <div className="text-lg md:text-xl text-purple-500">Hours</div>
        </div>
        <div className="text-4xl md:text-6xl font-bold text-purple-300">:</div>
        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-bold text-purple-700">{minutes}</div>
          <div className="text-lg md:text-xl text-purple-500">Minutes</div>
        </div>
        <div className="text-4xl md:text-6xl font-bold text-purple-300">:</div>
        <div className="flex flex-col items-center">
          <div className="text-6xl md:text-8xl font-bold text-purple-700">{seconds}</div>
          <div className="text-lg md:text-xl text-purple-500">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;