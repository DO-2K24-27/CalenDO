import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Event, Planning, CalendarViewType, SearchFilters } from '../types';
import { api } from '../services/api';

interface CalendarContextType {
  events: Event[];
  filteredEvents: Event[];
  plannings: Planning[];
  selectedPlannings: Planning[];
  currentPlanning: Planning | null; // Keep for backward compatibility
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
  setCurrentPlanning: (planning: Planning | null) => void; // Keep for backward compatibility
  setSelectedPlannings: (plannings: Planning[]) => void;
  togglePlanningSelection: (planning: Planning) => void;
  selectAllPlannings: () => void;
  clearPlanningSelection: () => void;
  refreshEvents: () => Promise<void>;
  refreshPlannings: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [selectedPlannings, setSelectedPlannings] = useState<Planning[]>([]);
  const [currentPlanning, setCurrentPlanning] = useState<Planning | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    keyword: '',
    field: 'all'
  });

  const togglePlanningSelection = (planning: Planning) => {
    setSelectedPlannings(prev => {
      const isSelected = prev.some(p => p.id === planning.id);
      const newSelection = isSelected 
        ? prev.filter(p => p.id !== planning.id)
        : [...prev, planning];
      
      // Update currentPlanning for backward compatibility
      if (newSelection.length === 0) {
        setCurrentPlanning(null);
      } else if (newSelection.length === 1) {
        setCurrentPlanning(newSelection[0]);
      } else {
        // Multiple selections - keep the first one as current for backward compatibility
        setCurrentPlanning(newSelection[0]);
      }
      
      return newSelection;
    });
  };

  const selectAllPlannings = () => {
    setSelectedPlannings([...plannings]);
    setCurrentPlanning(plannings.length > 0 ? plannings[0] : null);
  };

  const clearPlanningSelection = () => {
    setSelectedPlannings([]);
    setCurrentPlanning(null);
  };

  // Keep backward compatibility with currentPlanning
  const handleSetCurrentPlanning = (planning: Planning | null) => {
    setCurrentPlanning(planning);
    if (planning) {
      setSelectedPlannings([planning]);
    } else {
      setSelectedPlannings([]);
    }
  };

  const refreshPlannings = React.useCallback(async () => {
    try {
      const data = await api.getPlannings();
      // Ensure we always have an array, even if API returns null
      setPlannings(Array.isArray(data) ? data : []);
      
      // Only initialize selected plannings on first load if none are selected
      // and don't force selection - let user choose to see all events or select specific plannings
      if (selectedPlannings.length === 0 && Array.isArray(data) && data.length > 0) {
        // Start with all events visible (no planning selected)
        // User can then choose to filter by specific plannings
      }
    } catch (err) {
      console.error('Failed to fetch plannings:', err);
      // Set empty array on error to ensure consistent state
      setPlannings([]);
    }
  }, [selectedPlannings.length]);

  const refreshEvents = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getEvents();
      // Ensure we always have an array, even if API returns null
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error(err);
      // Set empty array on error to ensure consistent state
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([refreshPlannings(), refreshEvents()]);
    };
    initializeData();
  }, [refreshPlannings, refreshEvents]);

  // Filter events based on selected plannings
  const filteredEvents = React.useMemo(() => {
    // If no plannings are selected, show all events
    if (selectedPlannings.length === 0) return events;
    const selectedPlanningIds = selectedPlannings.map(p => p.id);
    return events.filter(event => selectedPlanningIds.includes(event.planning_id));
  }, [events, selectedPlannings]);

  const value = {
    events,
    filteredEvents,
    plannings,
    selectedPlannings,
    currentPlanning,
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
    setCurrentPlanning: handleSetCurrentPlanning,
    setSelectedPlannings,
    togglePlanningSelection,
    selectAllPlannings,
    clearPlanningSelection,
    refreshEvents,
    refreshPlannings
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