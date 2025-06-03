import React from 'react';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface CountdownDetailsProps {
  breakDate: Date | null;
}

const CountdownDetails: React.FC<CountdownDetailsProps> = ({ breakDate }) => {
  if (!breakDate) return null;
  
  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl md:text-4xl font-bold text-purple-800 mb-2">
        Break Time
      </h2>
      <div className="text-lg md:text-xl text-purple-600">
        {formatDate(breakDate)} at {formatTime(breakDate.toISOString())}
      </div>
      <div className="text-md md:text-lg text-purple-500 mt-1">
        Your break starts when the current event ends
      </div>
    </div>
  );
};

export default CountdownDetails;