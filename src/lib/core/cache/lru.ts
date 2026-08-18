import { ModernizationScoreResult } from '../scoring/types';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-Memory LRU (Least Recently Used) Cache with TTL support
 */
export class LRUCache<T> {
  private capacity: number;
  private defaultTtlMs: number;
  private cache: Map<string, CacheEntry<T>>;

  constructor(capacity: number = 200, defaultTtlMs: number = 3_600_000) {
    this.capacity = capacity;
    this.defaultTtlMs = defaultTtlMs;
    this.cache = new Map();
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU order
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  public set(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { value, expiresAt });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

// Global Singleton instance for calculated airport metrics
export const airportMetricsCache = new LRUCache<ModernizationScoreResult>(200, 3_600_000);
