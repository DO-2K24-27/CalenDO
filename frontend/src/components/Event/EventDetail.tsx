import React from 'react';
import { X, MapPin, Calendar, Clock } from 'lucide-react';
import { Event } from '../../types';
import { formatDate, formatTime } from '../../utils/dateUtils';

interface EventDetailProps {
  event: Event;
  onClose: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onClose }) => {
  const startDate = new Date(event.start_time);
  
  const isBreak = event.summary.toLowerCase().includes('break');
  const headerBgColor = isBreak ? 'bg-green-600' : 'bg-purple-600';
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden slide-in">
        <div className={`${headerBgColor} text-white p-4 relative`}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h3 className="text-xl font-bold mb-2">{event.summary}</h3>
          <div className="flex items-center text-sm">
            <Clock size={16} className="mr-1" />
            <span>
              {formatTime(event.start_time)} - {formatTime(event.end_time)}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-4 flex items-start">
            <Calendar size={18} className="text-gray-500 mr-2 mt-0.5" />
            <div>
              <div className="font-medium">Date</div>
              <div className="text-gray-600">{formatDate(startDate)}</div>
            </div>
          </div>
          
          {event.location && (
            <div className="mb-4 flex items-start">
              <MapPin size={18} className="text-gray-500 mr-2 mt-0.5" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-gray-600">{event.location}</div>
              </div>
            </div>
          )}
          
          {event.description && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600 whitespace-pre-line">{event.description}</p>
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4">
            Created: {new Date(event.created).toLocaleString()}
            {event.last_modified && (
              <div>Modified: {new Date(event.last_modified).toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;