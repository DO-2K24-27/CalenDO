// Cache service for offline functionality
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiryTime?: number;
}

export class ApiCache {
  private static instance: ApiCache;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly CACHE_PREFIX = 'calendo_cache_';

  private constructor() {
    this.loadFromLocalStorage();
  }

  static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  private getCacheKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  private loadFromLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.CACHE_PREFIX)
      );
      
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const cacheKey = key.replace(this.CACHE_PREFIX, '');
          const entry: CacheEntry<unknown> = JSON.parse(data);
          this.cache.set(cacheKey, entry);
        }
      });
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  private saveToLocalStorage(key: string, entry: CacheEntry<unknown>): void {
    try {
      const cacheKey = this.getCacheKey(key);
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  set<T>(key: string, data: T, cacheDuration?: number): void {
    const expiryTime = cacheDuration ? Date.now() + cacheDuration : undefined;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiryTime
    };
    
    this.cache.set(key, entry);
    this.saveToLocalStorage(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry has expired
    if (entry.expiryTime && Date.now() > entry.expiryTime) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (entry.expiryTime && Date.now() > entry.expiryTime) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(this.getCacheKey(key));
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  clear(): void {
    // Clear memory cache
    this.cache.clear();
    
    // Clear localStorage cache
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.CACHE_PREFIX)
      );
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  getAge(key: string): number | null {
    const entry = this.cache.get(key);
    return entry ? Date.now() - entry.timestamp : null;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.expiryTime && now > entry.expiryTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.delete(key));
  }
}

export const apiCache = ApiCache.getInstance();
