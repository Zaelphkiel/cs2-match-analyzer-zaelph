import { Match, MatchAnalysis } from '../types';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private cache: Map<string, CacheItem<any>>;

  constructor() {
    this.cache = new Map();
    this.startCleanupInterval();
  }

  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
    console.log(`[Cache] Set: ${key} (TTL: ${ttlMinutes}m)`);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      console.log(`[Cache] Miss: ${key}`);
      return null;
    }

    const now = Date.now();
    const age = now - item.timestamp;

    if (age > item.ttl) {
      console.log(`[Cache] Expired: ${key} (age: ${Math.floor(age / 1000)}s)`);
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] Hit: ${key} (age: ${Math.floor(age / 1000)}s)`);
    return item.data as T;
  }

  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
    console.log(`[Cache] Deleted: ${key}`);
  }

  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cleared all entries');
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, item] of this.cache.entries()) {
        const age = now - item.timestamp;
        if (age > item.ttl) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`[Cache] Cleanup: removed ${cleaned} expired entries`);
      }
    }, 60 * 1000);
  }
}

export const cacheService = new CacheService();
