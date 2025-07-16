import React from 'react';
import { useCalendar } from '../contexts/CalendarContext';
import CalendarHeader from '../components/Calendar/CalendarHeader';
import MonthView from '../components/Calendar/MonthView';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';
import SwipeableCalendarContainer from '../components/Calendar/SwipeableCalendarContainer';
import EventDetail from '../components/Event/EventDetail';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorDisplay from '../components/UI/ErrorDisplay';
import EmptyState from '../components/UI/EmptyState';
import { filterEvents } from '../utils/searchUtils';

const CalendarPage: React.FC = () => {
  const { 
    events,
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
  const hasNoEvents = events.length === 0;
  const isSearchActive = searchFilters.keyword !== '';
  
  return (
    <div className="container mx-auto px-2 md:px-4 py-2 md:py-4">
      {noSearchResults && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-center">
          <p className="text-yellow-700 text-sm">
            No events found matching "{searchFilters.keyword}".
          </p>
        </div>
      )}
      
      {hasSearchResults && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
          <p className="text-purple-700 text-sm">
            Found {searchFilteredEvents.length} event(s) matching "{searchFilters.keyword}".
          </p>
        </div>
      )}
      
      <CalendarHeader />
      
      {isLoading ? (
        <LoadingSpinner size="large" />
      ) : error ? (
        <ErrorDisplay message={error} onRetry={refreshEvents} />
      ) : hasNoEvents && !isSearchActive ? (
        <EmptyState
          title="No Events Yet"
          description="You haven't created any events yet."
        />
      ) : (
        <SwipeableCalendarContainer>
          <div className="mb-2 md:mb-4">
            {view === 'month' && <MonthView />}
            {view === 'week' && <WeekView />}
            {view === 'day' && <DayView />}
          </div>
        </SwipeableCalendarContainer>
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