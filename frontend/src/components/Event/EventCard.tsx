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
  const { searchFilters, plannings, selectedPlannings } = useCalendar();
  const { keyword } = searchFilters;
  
  const startTime = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);
  
  // Get planning color, fallback to purple if not found
  const eventPlanning = plannings.find(p => p.id === event.planning_id) || event.planning;
  const planningColor = eventPlanning?.color || '#8B5CF6';
  
  // Show planning name when multiple plannings are selected
  const showPlanningName = selectedPlannings.length > 1;
  
  const isBreak = event.summary.toLowerCase().includes('break');
  const bgColor = isBreak ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-200';
  const textColor = isBreak ? 'text-green-700' : 'text-gray-700';
  
  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`event-card text-xs p-1 rounded cursor-pointer border-l-4 h-full flex flex-col justify-start overflow-hidden ${bgColor} ${textColor}`}
        style={{ borderLeftColor: planningColor }}
      >
        <div className="font-medium truncate leading-tight">
          {highlightText(event.summary, keyword)}
        </div>
        <div className="text-xs opacity-75 truncate leading-tight">
          {startTime}
        </div>
        {showPlanningName && eventPlanning && (
          <div className="text-xs opacity-60 truncate leading-tight">
            {eventPlanning.name}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div
      onClick={onClick}
      className={`event-card p-2 rounded mb-2 cursor-pointer border-l-4 ${bgColor} ${textColor}`}
      style={{ borderLeftColor: planningColor }}
    >
      <div className="text-xs mb-1">{startTime} - {endTime}</div>
      <div className="font-medium truncate">
        {highlightText(event.summary, keyword)}
      </div>
      {showPlanningName && eventPlanning && (
        <div className="text-xs text-gray-500 truncate mt-1">
          📋 {eventPlanning.name}
        </div>
      )}
      {!compact && event.location && (
        <div className="text-xs truncate mt-1">
          📍 {highlightText(event.location, keyword)}
        </div>
      )}
    </div>
  );
};

export default EventCard;