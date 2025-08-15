// Configuration from environment variables
const MAX_REQUESTS_PER_MINUTE = parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '2');
const REQUEST_WINDOW_SIZE_MS = parseInt(process.env.REQUEST_WINDOW_SIZE_MS || '60000');

/**
 * Rate limiter utility using token bucket algorithm
 */
export class RateLimiter {
  private maxRequests: number;
  private windowSize: number;
  private timestamps: number[];

  constructor(maxRequests: number = MAX_REQUESTS_PER_MINUTE, windowSize: number = REQUEST_WINDOW_SIZE_MS) {
    this.maxRequests = maxRequests;
    this.windowSize = windowSize;
    this.timestamps = [];
  }

  /**
   * Check if a request can be made
   * @returns true if request is allowed, false if rate limited
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    // Remove old timestamps
    this.timestamps = this.timestamps.filter(timestamp => timestamp > windowStart);
    
    // Check if we can make a new request
    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(now);
      return true;
    }
    
    return false;
  }

  /**
   * Get current rate limit status
   * @returns Object containing remaining requests, max requests, and reset time
   */
  getStatus(): {
    remainingRequests: number;
    maxRequests: number;
    resetTime: number | null;
  } {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    // Clean old timestamps
    this.timestamps = this.timestamps.filter(timestamp => timestamp > windowStart);
    
    const remainingRequests = Math.max(0, this.maxRequests - this.timestamps.length);
    const oldestTimestamp = this.timestamps.length > 0 ? Math.min(...this.timestamps) : null;
    const resetTime = oldestTimestamp ? oldestTimestamp + this.windowSize : null;
    
    return {
      remainingRequests,
      maxRequests: this.maxRequests,
      resetTime
    };
  }

  /**
   * Reset the rate limiter (clear all timestamps)
   */
  reset(): void {
    this.timestamps = [];
  }

  /**
   * Get time until next request is allowed
   * @returns Time in milliseconds until next request is allowed, or 0 if request can be made now
   */
  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) {
      return 0;
    }
    
    const now = Date.now();
    const oldestTimestamp = this.timestamps.length > 0 ? Math.min(...this.timestamps) : now;
    const resetTime = oldestTimestamp + this.windowSize;
    
    return Math.max(0, resetTime - now);
  }
}

// Default rate limiter instance
export const defaultRateLimiter = new RateLimiter();

// Legacy function for backward compatibility
export const checkRateLimit = (): boolean => {
  return defaultRateLimiter.canMakeRequest();
};

// Legacy function for backward compatibility
export const getRateLimitStatus = () => {
  return defaultRateLimiter.getStatus();
};
