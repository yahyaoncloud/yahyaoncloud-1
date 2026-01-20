import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Cache directory path
const CACHE_DIR = path.join(process.cwd(), '.cache', 'markdown');

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create cache directory:', error);
  }
}

// Cache interface
interface CacheEntry {
  value: string;
  expiresAt: number;
}

/**
 * Local file-based cache for markdown content
 * Replaces Redis with simple file system caching
 */
export class LocalCache {
  /**
   * Get cached value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      const filePath = this.getFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(data);
      
      // Check if expired
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await this.delete(key);
        return null;
      }
      
      return entry.value;
    } catch (error) {
      // File doesn't exist or error reading
      return null;
    }
  }

  /**
   * Set cache value with optional expiration (in seconds)
   */
  async set(key: string, value: string, expirationSeconds?: number): Promise<void> {
    try {
      await ensureCacheDir();
      
      const entry: CacheEntry = {
        value,
        expiresAt: expirationSeconds 
          ? Date.now() + (expirationSeconds * 1000)
          : 0 // 0 means no expiration
      };
      
      const filePath = this.getFilePath(key);
      await fs.writeFile(filePath, JSON.stringify(entry), 'utf-8');
    } catch (error) {
      console.error('Failed to write to cache:', error);
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getFilePath(key);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors (file might not exist)
    }
  }

  /**
   * Clear all cached values
   */
  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(CACHE_DIR);
      await Promise.all(
        files.map(file => fs.unlink(path.join(CACHE_DIR, file)))
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get file path for cache key
   */
  private getFilePath(key: string): string {
    // Sanitize key to be filesystem-safe
    const safeKey = key.replace(/[^a-z0-9_-]/gi, '_');
    return path.join(CACHE_DIR, `${safeKey}.json`);
  }
}

// Singleton instance
let cacheInstance: LocalCache | null = null;

/**
 * Get local cache instance
 */
export function getLocalCache(): LocalCache {
  if (!cacheInstance) {
    cacheInstance = new LocalCache();
  }
  return cacheInstance;
}
