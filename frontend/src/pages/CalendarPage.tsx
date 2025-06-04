import React from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import CalendarHeader from '../components/Calendar/CalendarHeader';
import MonthView from '../components/Calendar/MonthView';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';
import EventDetail from '../components/Event/EventDetail';
import SearchBar from '../components/Search/SearchBar';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorDisplay from '../components/UI/ErrorDisplay';
import { filterEvents } from '../utils/searchUtils';

const CalendarPage: React.FC = () => {
  const { 
    filteredEvents, 
    isLoading, 
    error, 
    view, 
    selectedEvent, 
    setSelectedEvent,
    refreshEvents,
    searchFilters
  } = useCalendar();
  
  const searchFilteredEvents = filterEvents(filteredEvents, searchFilters);
  const hasSearchResults = searchFilters.keyword !== '' && searchFilteredEvents.length > 0;
  const noSearchResults = searchFilters.keyword !== '' && searchFilteredEvents.length === 0;
  
  return (
    <div className="container mx-auto px-4 py-4">
      <SearchBar />
      
      {noSearchResults && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-center">
          <p className="text-yellow-700">
            No events found matching "{searchFilters.keyword}".
          </p>
        </div>
      )}
      
      {hasSearchResults && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <p className="text-purple-700">
            Found {searchFilteredEvents.length} event(s) matching "{searchFilters.keyword}".
          </p>
        </div>
      )}
      
      <CalendarHeader />
      
      {isLoading ? (
        <LoadingSpinner size="large" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={refreshEvents} />
      ) : (
        <div className="mb-4">
          {view === 'month' && <MonthView />}
          {view === 'week' && <WeekView />}
          {view === 'day' && <DayView />}
        </div>
      )}
      
      {selectedEvent && (
        <EventDetail 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
};

export default CalendarPage;