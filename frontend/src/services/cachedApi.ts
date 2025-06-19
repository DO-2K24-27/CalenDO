import { Event, Planning } from '../types';
import { apiCache } from './cache';

const API_BASE_URL = '/api';

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  EVENTS: 12 * 60 * 60 * 1000, // 12 hours
  PLANNINGS: 12 * 60 * 60 * 1000, // 12 hours
  PLANNING_DETAIL: 12 * 60 * 60 * 1000, // 12 hours
  HEALTH: 5 * 60 * 1000, // 5 minutes (keep health checks shorter)
};

interface CachedApiOptions {
  forceRefresh?: boolean;
  fallbackToCache?: boolean;
}

class CachedApiService {
  private async fetchWithCache<T>(
    url: string,
    cacheKey: string,
    cacheDuration: number,
    options: CachedApiOptions = {}
  ): Promise<T> {
    const { forceRefresh = false, fallbackToCache = true } = options;

    // If not forcing refresh, try to get from cache first
    if (!forceRefresh) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        // Return cached data and try to refresh in background
        this.refreshInBackground(url, cacheKey, cacheDuration);
        return cachedData;
      }
    }

    // Try to fetch from network
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      const processedData = data || (Array.isArray([]) ? [] : data);
      
      // Cache the successful response
      apiCache.set(cacheKey, processedData, cacheDuration);
      
      return processedData;
    } catch (error) {
      console.error(`Network request failed for ${url}:`, error);
      
      // Fallback to cache if network fails
      if (fallbackToCache) {
        const cachedData = apiCache.get<T>(cacheKey);
        if (cachedData) {
          console.log(`Using cached data for ${cacheKey} due to network error`);
          return cachedData;
        }
      }
      
      // If no cache available, throw the error
      throw error;
    }
  }

  private async refreshInBackground(
    url: string,
    cacheKey: string,
    cacheDuration: number
  ): Promise<void> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const processedData = data || (Array.isArray([]) ? [] : data);
        apiCache.set(cacheKey, processedData, cacheDuration);
      }
    } catch (error) {
      // Silently fail background refresh
      console.debug(`Background refresh failed for ${cacheKey}:`, error);
    }
  }

  async getEvents(options?: CachedApiOptions): Promise<Event[]> {
    return this.fetchWithCache<Event[]>(
      `${API_BASE_URL}/events`,
      'events',
      CACHE_DURATIONS.EVENTS,
      options
    );
  }

  async getEventByUid(uid: string, options?: CachedApiOptions): Promise<Event> {
    return this.fetchWithCache<Event>(
      `${API_BASE_URL}/events/${uid}`,
      `event_${uid}`,
      CACHE_DURATIONS.EVENTS,
      options
    );
  }

  async getPlannings(options?: CachedApiOptions): Promise<Planning[]> {
    return this.fetchWithCache<Planning[]>(
      `${API_BASE_URL}/plannings`,
      'plannings',
      CACHE_DURATIONS.PLANNINGS,
      options
    );
  }

  async getPlanningById(id: string, options?: CachedApiOptions): Promise<Planning> {
    return this.fetchWithCache<Planning>(
      `${API_BASE_URL}/plannings/${id}`,
      `planning_${id}`,
      CACHE_DURATIONS.PLANNING_DETAIL,
      options
    );
  }

  async getDefaultPlanning(options?: CachedApiOptions): Promise<Planning> {
    return this.fetchWithCache<Planning>(
      `${API_BASE_URL}/plannings/default`,
      'default_planning',
      CACHE_DURATIONS.PLANNING_DETAIL,
      options
    );
  }

  async checkHealth(options?: CachedApiOptions): Promise<{ status: string }> {
    return this.fetchWithCache<{ status: string }>(
      `${API_BASE_URL}/health`,
      'health',
      CACHE_DURATIONS.HEALTH,
      options
    );
  }

  // Utility methods
  clearCache(): void {
    apiCache.clear();
  }

  clearCacheFor(keys: string[]): void {
    keys.forEach(key => apiCache.delete(key));
  }

  getCacheAge(key: string): number | null {
    return apiCache.getAge(key);
  }

  hasCachedData(key: string): boolean {
    return apiCache.has(key);
  }

  getCachedData<T>(key: string): T | null {
    return apiCache.get<T>(key);
  }

  // Force refresh specific data
  async refreshEvents(): Promise<Event[]> {
    return this.getEvents({ forceRefresh: true });
  }

  async refreshPlannings(): Promise<Planning[]> {
    return this.getPlannings({ forceRefresh: true });
  }
}

export const cachedApi = new CachedApiService();

// Legacy API object for backward compatibility
export const api = {
  async getEvents(): Promise<Event[]> {
    return cachedApi.getEvents();
  },

  async getEventByUid(uid: string): Promise<Event> {
    return cachedApi.getEventByUid(uid);
  },

  async getPlannings(): Promise<Planning[]> {
    return cachedApi.getPlannings();
  },

  async getPlanningById(id: string): Promise<Planning> {
    return cachedApi.getPlanningById(id);
  },

  async getDefaultPlanning(): Promise<Planning> {
    return cachedApi.getDefaultPlanning();
  },

  async checkHealth(): Promise<{ status: string }> {
    return cachedApi.checkHealth();
  }
};
