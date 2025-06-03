import React, { useState, useEffect } from 'react';

const ClockDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timerId);
  }, []);
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  }).format(currentTime);
  
  return (
    <div className="text-center">
      <div className="text-2xl md:text-4xl font-semibold text-purple-600">
        {formattedTime}
      </div>
    </div>
  );
};

export default ClockDisplay;