import React from 'react';
import { Event } from '../../types';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface CountdownDetailsProps {
  event: Event | null;
}

const CountdownDetails: React.FC<CountdownDetailsProps> = ({ event }) => {
  if (!event) return null;
  
  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl md:text-4xl font-bold text-purple-800 mb-2">
        {event.summary}
      </h2>
      <div className="text-lg md:text-xl text-purple-600">
        {formatDate(new Date(event.start_time))} at {formatTime(event.start_time)}
      </div>
      {event.location && (
        <div className="text-md md:text-lg text-purple-500 mt-1">
          Location: {event.location}
        </div>
      )}
    </div>
  );
};

export default CountdownDetails;