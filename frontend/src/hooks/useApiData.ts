import { useCachedData } from './useCachedData';
import { cachedApi } from '../services/cachedApi';
import { Event, Planning } from '../types';

// Hook for events data
export const useEvents = () => {
  return useCachedData<Event[]>(
    () => cachedApi.getEvents(),
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
  return useCachedData<Planning[]>(
    () => cachedApi.getPlannings(),
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
  return useCachedData<Event>(
    () => cachedApi.getEventByUid(uid),
    `event_${uid}`,
    {
      refreshOnWindowFocus: false,
      refreshOnReconnect: true
    }
  );
};

// Hook for specific planning
export const usePlanning = (id: string) => {
  return useCachedData<Planning>(
    () => cachedApi.getPlanningById(id),
    `planning_${id}`,
    {
      refreshOnWindowFocus: false,
      refreshOnReconnect: true
    }
  );
};

// Hook for default planning
export const useDefaultPlanning = () => {
  return useCachedData<Planning>(
    () => cachedApi.getDefaultPlanning(),
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
  return useCachedData<{ status: string }>(
    () => cachedApi.checkHealth(),
    'health',
    {
      autoRefresh: true,
      refreshInterval: 2 * 60 * 1000, // 2 minutes
      refreshOnWindowFocus: false,
      refreshOnReconnect: true
    }
  );
};
