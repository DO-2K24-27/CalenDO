import React from 'react';
import { Event } from '../../types';
import { formatTime } from '../../utils/dateUtils';
import { highlightText } from '../../utils/searchUtils';
import { useCalendar } from '../../contexts/CalendarContext';

interface EventCardProps {
  event: Event;
  onClick: () => void;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, compact = false }) => {
  const { searchFilters } = useCalendar();
  const { keyword } = searchFilters;
  
  const startTime = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);
  
  const isBreak = event.summary.toLowerCase().includes('break');
  const bgColor = isBreak ? 'bg-green-100 border-green-300' : 'bg-purple-100 border-purple-300';
  const textColor = isBreak ? 'text-green-700' : 'text-purple-700';
  
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`event-card text-xs p-1 rounded cursor-pointer border-l-2 h-full flex flex-col justify-start overflow-hidden ${bgColor} ${textColor}`}
      >
        <div className="font-medium truncate leading-tight">
          {highlightText(event.summary, keyword)}
        </div>
        <div className="text-xs opacity-75 truncate leading-tight">
          {startTime}
        </div>
      </div>
    );
  }
  
  return (
    <div
      onClick={onClick}
      className={`event-card p-2 rounded mb-2 cursor-pointer border-l-2 ${bgColor} ${textColor}`}
    >
      <div className="text-xs mb-1">{startTime} - {endTime}</div>
      <div className="font-medium truncate">
        {highlightText(event.summary, keyword)}
      </div>
      {!compact && event.location && (
        <div className="text-xs truncate mt-1">
          📍 {highlightText(event.location, keyword)}
        </div>
      )}
    </div>
  );
};

export default EventCard;