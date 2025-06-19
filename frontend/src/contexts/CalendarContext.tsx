import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Event, Planning, CalendarViewType, SearchFilters } from '../types';
import { useEvents, usePlannings } from '../hooks/useApiData';

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

const CALENDAR_VIEW_STORAGE_KEY = 'calendo-calendar-view';
const SELECTED_PLANNINGS_STORAGE_KEY = 'calendo-selected-plannings';

// Helper function to get initial view from localStorage
const getInitialView = (): CalendarViewType => {
  try {
    const savedView = localStorage.getItem(CALENDAR_VIEW_STORAGE_KEY);
    if (savedView && ['month', 'week', 'day'].includes(savedView)) {
      return savedView as CalendarViewType;
    }
  } catch (error) {
    console.warn('Failed to load calendar view from localStorage:', error);
  }
  return 'month'; // Default fallback
};

// Helper function to get initial selected plannings from localStorage
const getInitialSelectedPlannings = (): Planning[] => {
  try {
    const savedPlannings = localStorage.getItem(SELECTED_PLANNINGS_STORAGE_KEY);
    if (savedPlannings) {
      const parsed = JSON.parse(savedPlannings);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.warn('Failed to load selected plannings from localStorage:', error);
  }
  return []; // Default fallback
};

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  // Use cached data hooks
  const { 
    data: events = [], 
    loading: eventsLoading, 
    error: eventsError, 
    refresh: refreshEventsData
  } = useEvents();
  
  const { 
    data: plannings = [], 
    loading: planningsLoading, 
    error: planningsError, 
    refresh: refreshPlanningsData
  } = usePlannings();

  const [selectedPlannings, setSelectedPlannings] = useState<Planning[]>(getInitialSelectedPlannings());
  const [currentPlanning, setCurrentPlanning] = useState<Planning | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarViewType>(getInitialView());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    keyword: '',
    field: 'all'
  });

  // Combine loading states
  const isLoading = eventsLoading || planningsLoading;
  
  // Combine error states
  const error = eventsError?.message || planningsError?.message || null;

  const togglePlanningSelection = (planning: Planning) => {
    setSelectedPlannings(prev => {
      const isSelected = prev.some(p => p.id === planning.id);
      const newSelection = isSelected 
        ? prev.filter(p => p.id !== planning.id)
        : [...prev, planning];
      
      // Save to localStorage
      try {
        localStorage.setItem(SELECTED_PLANNINGS_STORAGE_KEY, JSON.stringify(newSelection));
      } catch (error) {
        console.warn('Failed to save selected plannings to localStorage:', error);
      }
      
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
    const allPlannings = plannings || [];
    setSelectedPlannings(allPlannings);
    setCurrentPlanning(allPlannings.length > 0 ? allPlannings[0] : null);
    
    // Save to localStorage
    try {
      localStorage.setItem(SELECTED_PLANNINGS_STORAGE_KEY, JSON.stringify(allPlannings));
    } catch (error) {
      console.warn('Failed to save selected plannings to localStorage:', error);
    }
  };

  const clearPlanningSelection = () => {
    setSelectedPlannings([]);
    setCurrentPlanning(null);
    
    // Save to localStorage
    try {
      localStorage.setItem(SELECTED_PLANNINGS_STORAGE_KEY, JSON.stringify([]));
    } catch (error) {
      console.warn('Failed to save selected plannings to localStorage:', error);
    }
  };

  // Enhanced setSelectedPlannings function that persists to localStorage
  const handleSetSelectedPlannings = React.useCallback((plannings: Planning[]) => {
    setSelectedPlannings(plannings);
    try {
      localStorage.setItem(SELECTED_PLANNINGS_STORAGE_KEY, JSON.stringify(plannings));
    } catch (error) {
      console.warn('Failed to save selected plannings to localStorage:', error);
    }
  }, []);

  // Keep backward compatibility with currentPlanning
  const handleSetCurrentPlanning = (planning: Planning | null) => {
    setCurrentPlanning(planning);
    if (planning) {
      setSelectedPlannings([planning]);
    } else {
      setSelectedPlannings([]);
    }
  };

  // Wrap refresh functions
  const refreshEvents = React.useCallback(async () => {
    await refreshEventsData();
  }, [refreshEventsData]);

  const refreshPlannings = React.useCallback(async () => {
    await refreshPlanningsData();
  }, [refreshPlanningsData]);

  // Enhanced setView function that persists to localStorage
  const handleSetView = React.useCallback((newView: CalendarViewType) => {
    setView(newView);
    try {
      localStorage.setItem(CALENDAR_VIEW_STORAGE_KEY, newView);
    } catch (error) {
      console.warn('Failed to save calendar view to localStorage:', error);
    }
  }, []);

  // Filter events based on selected plannings
  const filteredEvents = React.useMemo(() => {
    const eventsArray = events || [];
    // If no plannings are selected, show all events
    if (selectedPlannings.length === 0) return eventsArray;
    const selectedPlanningIds = selectedPlannings.map(p => p.id);
    return eventsArray.filter(event => selectedPlanningIds.includes(event.planning_id));
  }, [events, selectedPlannings]);

  const value = {
    events: events || [],
    filteredEvents,
    plannings: plannings || [],
    selectedPlannings,
    currentPlanning,
    isLoading,
    error,
    currentDate,
    view,
    selectedEvent,
    searchFilters,
    setCurrentDate,
    setView: handleSetView,
    setSelectedEvent,
    setSearchFilters,
    setCurrentPlanning: handleSetCurrentPlanning,
    setSelectedPlannings: handleSetSelectedPlannings,
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