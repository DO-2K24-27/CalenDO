import React from 'react';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface CountdownDetailsProps {
  breakDate: Date | null;
  isInEvent?: boolean;
  currentEventsCount?: number;
}

const CountdownDetails: React.FC<CountdownDetailsProps> = ({ 
  breakDate, 
  isInEvent = false, 
  currentEventsCount = 0 
}) => {
  if (!breakDate) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl md:text-4xl font-bold text-green-800 mb-2">
          Enjoying Your Break!
        </h2>
        <div className="text-lg md:text-xl text-green-600">
          No upcoming events in selected plannings
        </div>
      </div>
    );
  }
  
  const getEventDescription = () => {
    if (isInEvent) {
      if (currentEventsCount > 1) {
        return `Your break starts when the earliest of ${currentEventsCount} current events ends`;
      }
      return "Your break starts when the current event ends";
    } else {
      return "Your break ends when the next event starts";
    }
  };
  
  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl md:text-4xl font-bold text-purple-800 mb-2">
        {isInEvent ? "Break Time" : "Next Event"}
      </h2>
      <div className="text-lg md:text-xl text-purple-600">
        {formatDate(breakDate)} at {formatTime(breakDate.toISOString())}
      </div>
      <div className="text-md md:text-lg text-purple-500 mt-1">
        {getEventDescription()}
      </div>
    </div>
  );
};

export default CountdownDetails;