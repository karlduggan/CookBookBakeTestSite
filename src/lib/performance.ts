/**
 * Performance optimization utilities for Cook Book Bake
 */

/**
 * Debounce function - delays execution until after calls stop
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits execution to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images using Intersection Observer
 */
export function lazyLoadImages(): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
}

/**
 * Optimize image URL for different sizes
 * Assumes integration with Cloudinary
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  if (!url || !url.includes('cloudinary')) {
    return url; // Return original if not a Cloudinary URL
  }

  const params: string[] = [];

  if (options.width) params.push(`w_${options.width}`);
  if (options.height) params.push(`h_${options.height}`);
  if (options.quality) params.push(`q_${options.quality}`);
  if (options.format) params.push(`f_${options.format}`);

  if (params.length === 0) return url;

  // Insert transformation params into Cloudinary URL
  // Format: https://res.cloudinary.com/cloud/image/upload/w_200,h_200,q_80/image.jpg
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${params.join(',')}/${parts[1]}`;
  }

  return url;
}

/**
 * Cache management
 */
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; expireTime: number }> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttlSeconds: number = 300): void {
    const expireTime = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expireTime });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() > item.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

/**
 * LocalStorage with TTL
 */
export class LocalStorageCache {
  static set(key: string, data: any, ttlSeconds: number = 3600): void {
    const expireTime = Date.now() + ttlSeconds * 1000;
    const cacheData = {
      data,
      expireTime,
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  }

  static get(key: string): any | null {
    const item = localStorage.getItem(key);

    if (!item) return null;

    try {
      const cacheData = JSON.parse(item);

      if (Date.now() > cacheData.expireTime) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch {
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }
}

/**
 * Measure Web Vitals
 */
export function measureWebVitals(callback: (metric: any) => void): void {
  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        callback({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          timestamp: lastEntry.startTime,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch {
      // LCP not supported
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          callback({
            name: 'FID',
            value: entry.processingDuration,
            timestamp: entry.startTime,
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch {
      // FID not supported
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        callback({
          name: 'CLS',
          value: cls,
          timestamp: performance.now(),
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch {
      // CLS not supported
    }
  }
}

/**
 * Request idle callback with fallback
 */
export function requestIdleTask(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
}
