import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Event, CalendarViewType, SearchFilters } from '../types';
import { api } from '../services/api';

interface CalendarContextType {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  currentDate: Date;
  view: CalendarViewType;
  selectedEvent: Event | null;
  searchFilters: SearchFilters;
  setCurrentDate: (date: Date) => void;
  setView: (view: CalendarViewType) => void;
  setSelectedEvent: (event: Event | null) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  refreshEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    keyword: '',
    field: 'all'
  });

  const refreshEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshEvents();
  }, []);

  const value = {
    events,
    isLoading,
    error,
    currentDate,
    view,
    selectedEvent,
    searchFilters,
    setCurrentDate,
    setView,
    setSelectedEvent,
    setSearchFilters,
    refreshEvents
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};