import { useCachedData } from './useCachedData';
import { cachedApi } from '../services/cachedApi';
import { Event, Planning } from '../types';
import { useCallback } from 'react';

// Hook for events data
export const useEvents = () => {
  const fetchEvents = useCallback(() => cachedApi.getEvents(), []);
  
  return useCachedData<Event[]>(
    fetchEvents,
    'events',
    {
      autoRefresh: true,
      refreshInterval: 2 * 60 * 60 * 1000, // 2 hours
      refreshOnWindowFocus: true,
      refreshOnReconnect: true
    }
  );
};

// Hook for plannings data
export const usePlannings = () => {
  const fetchPlannings = useCallback(() => cachedApi.getPlannings(), []);
  
  return useCachedData<Planning[]>(
    fetchPlannings,
    'plannings',
    {
      autoRefresh: true,
      refreshInterval: 4 * 60 * 60 * 1000, // 4 hours
      refreshOnWindowFocus: true,
      refreshOnReconnect: true
    }
  );
};

// Hook for specific event
export const useEvent = (uid: string) => {
  const fetchEvent = useCallback(() => cachedApi.getEventByUid(uid), [uid]);
  
  return useCachedData<Event>(
    fetchEvent,
    `event_${uid}`,
    {
      refreshOnWindowFocus: false,
      refreshOnReconnect: true
    }
  );
};

// Hook for specific planning
export const usePlanning = (id: string) => {
  const fetchPlanning = useCallback(() => cachedApi.getPlanningById(id), [id]);
  
  return useCachedData<Planning>(
    fetchPlanning,
    `planning_${id}`,
    {
      refreshOnWindowFocus: false,
      refreshOnReconnect: true
    }
  );
};

// Hook for default planning
export const useDefaultPlanning = () => {
  const fetchDefaultPlanning = useCallback(() => cachedApi.getDefaultPlanning(), []);
  
  return useCachedData<Planning>(
    fetchDefaultPlanning,
    'default_planning',
    {
      autoRefresh: true,
      refreshInterval: 6 * 60 * 60 * 1000, // 6 hours
      refreshOnWindowFocus: true,
      refreshOnReconnect: true
    }
  );
};

// Hook for API health
export const useApiHealth = () => {
  const fetchHealth = useCallback(() => cachedApi.checkHealth(), []);
  
  return useCachedData<{ status: string }>(
    fetchHealth,
    'health',
    {
      autoRefresh: true,
      refreshInterval: 2 * 60 * 1000, // 2 minutes
      refreshOnWindowFocus: false,
      refreshOnReconnect: true
    }
  );
};
