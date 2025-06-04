import React, { useState, useEffect } from 'react';
import { calculateCurrentTimePosition } from '../../utils/eventUtils';

interface CurrentTimeCursorProps {
  hourHeight: number;
  isToday?: boolean;
}

const CurrentTimeCursor: React.FC<CurrentTimeCursorProps> = ({ 
  hourHeight, 
  isToday = true 
}) => {
  const [currentTimePosition, setCurrentTimePosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setCurrentTimePosition(calculateCurrentTimePosition(hourHeight));
    };

    // Update immediately
    updatePosition();

    // Update every minute
    const interval = setInterval(updatePosition, 60000);

    return () => clearInterval(interval);
  }, [hourHeight]);

  if (!isToday) {
    return null;
  }

  return (
    <div
      className="absolute left-0 right-0 z-10 flex items-center"
      style={{ top: `${currentTimePosition}px` }}
    >
      {/* Time indicator circle */}
      <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md -ml-1.5"></div>
      
      {/* Time line */}
      <div className="flex-1 h-0.5 bg-red-500 shadow-sm"></div>
    </div>
  );
};

export default CurrentTimeCursor;
