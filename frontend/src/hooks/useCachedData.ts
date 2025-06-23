import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedApi } from '../services/cachedApi';
import { useOnlineStatus } from './useOnlineStatus';

export interface UseCachedDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  refreshOnWindowFocus?: boolean;
  refreshOnReconnect?: boolean;
}

export const useCachedData = <T>(
  fetchFunction: () => Promise<T>,
  cacheKey: string,
  options: UseCachedDataOptions = {}
) => {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    refreshOnWindowFocus = true,
    refreshOnReconnect = true
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const lastFetchAttemptRef = useRef<number>(0);
  
  const isOnline = useOnlineStatus();

  // Rate limiting: prevent too frequent API calls
  const MIN_FETCH_INTERVAL = 2000; // 2 seconds minimum between requests

  const fetchData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Rate limiting: prevent too frequent API calls
    if (!forceRefresh && (now - lastFetchAttemptRef.current) < MIN_FETCH_INTERVAL) {
      console.log(`Skipping fetch for ${cacheKey} due to rate limiting`);
      return;
    }
    
    lastFetchAttemptRef.current = now;

    // If offline and not forcing refresh, try to use cached data first
    if (!isOnline && !forceRefresh) {
      const cachedData = cachedApi.getCachedData<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setIsStale(true);
        setLoading(false);
        setError(null);
        return;
      }
    }

    // Don't make network requests when offline unless we have no cached data
    if (!isOnline) {
      const cachedData = cachedApi.getCachedData<T>(cacheKey);
      if (!cachedData) {
        setError(new Error('No internet connection and no cached data available'));
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching fresh data for ${cacheKey}`);
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
      setIsStale(false);
    } catch (err) {
      console.error(`Fetch failed for ${cacheKey}:`, err);
      setError(err as Error);
      
      // Check if we have cached data to fall back to
      const cachedData = cachedApi.getCachedData<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setIsStale(true);
        console.log(`Using cached data for ${cacheKey} due to network error`);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, cacheKey, isOnline]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Initial load - try cached data first, then fetch if online
  useEffect(() => {
    // First, try to load from cache immediately
    const cachedData = cachedApi.getCachedData<T>(cacheKey);
    if (cachedData) {
      setData(cachedData);
      setIsStale(!isOnline); // Mark as stale if offline
      setLoading(false);
    }
    
    // Then fetch fresh data if online
    if (isOnline) {
      fetchData();
    } else if (!cachedData) {
      // No cache and offline - set error
      setError(new Error('No internet connection and no cached data available'));
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto refresh interval
  useEffect(() => {
    if (!autoRefresh || !isOnline) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData, isOnline]);

  // Refresh on window focus
  useEffect(() => {
    if (!refreshOnWindowFocus || !isOnline) return;

    const handleFocus = () => {
      // Only refresh if data is older than 30 minutes (more conservative with 12-hour cache)
      const cacheAge = cachedApi.getCacheAge(cacheKey);
      if (cacheAge && cacheAge > 30 * 60 * 1000) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshOnWindowFocus, fetchData, cacheKey, isOnline]);

  // Refresh on reconnect
  useEffect(() => {
    if (!refreshOnReconnect) return;

    // When coming back online, refresh data (but only if we were previously offline)
    if (isOnline) {
      // Add a small delay to avoid hammering the API when connection is unstable
      const timeoutId = setTimeout(() => {
        fetchData(true);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, refreshOnReconnect, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    lastUpdated,
    isStale,
    isOnline
  };
};
