// Configuration from environment variables
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '2');
const INITIAL_RETRY_DELAY_MS = parseInt(process.env.INITIAL_RETRY_DELAY_MS || '1000');
const BACKOFF_FACTOR = parseFloat(process.env.BACKOFF_FACTOR || '2');

/**
 * Retry mechanism utility with exponential backoff
 */
export class RetryMechanism {
  private maxRetries: number;
  private initialDelay: number;
  private backoffFactor: number;

  constructor(
    maxRetries: number = MAX_RETRIES,
    initialDelay: number = INITIAL_RETRY_DELAY_MS,
    backoffFactor: number = BACKOFF_FACTOR
  ) {
    this.maxRetries = maxRetries;
    this.initialDelay = initialDelay;
    this.backoffFactor = backoffFactor;
  }

  /**
   * Execute a function with retry mechanism and exponential backoff
   * @param fn Function to execute
   * @param maxRetries Maximum number of retries (overrides constructor value)
   * @param initialDelay Initial delay in milliseconds (overrides constructor value)
   * @param backoffFactor Backoff factor (overrides constructor value)
   * @returns Promise that resolves to the function result or rejects if all retries fail
   */
  async execute<T>(
    fn: () => Promise<T>,
    maxRetries?: number,
    initialDelay?: number,
    backoffFactor?: number
  ): Promise<T> {
    const actualMaxRetries = maxRetries ?? this.maxRetries;
    const actualInitialDelay = initialDelay ?? this.initialDelay;
    const actualBackoffFactor = backoffFactor ?? this.backoffFactor;

    let lastError: Error;

    for (let attempt = 1; attempt <= actualMaxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === actualMaxRetries) {
          break;
        }

        const delay = actualInitialDelay * Math.pow(actualBackoffFactor, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Sleep for a specified amount of time
   * @param ms Time to sleep in milliseconds
   * @returns Promise that resolves after the specified time
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the delay time for a specific attempt
   * @param attempt Attempt number (1-based)
   * @param initialDelay Initial delay in milliseconds (optional)
   * @param backoffFactor Backoff factor (optional)
   * @returns Delay time in milliseconds
   */
  getDelayForAttempt(
    attempt: number,
    initialDelay?: number,
    backoffFactor?: number
  ): number {
    const actualInitialDelay = initialDelay ?? this.initialDelay;
    const actualBackoffFactor = backoffFactor ?? this.backoffFactor;
    
    return actualInitialDelay * Math.pow(actualBackoffFactor, attempt - 1);
  }

  /**
   * Get configuration
   * @returns Current configuration
   */
  getConfig(): {
    maxRetries: number;
    initialDelay: number;
    backoffFactor: number;
  } {
    return {
      maxRetries: this.maxRetries,
      initialDelay: this.initialDelay,
      backoffFactor: this.backoffFactor
    };
  }

  /**
   * Update configuration
   * @param config New configuration
   */
  updateConfig(config: {
    maxRetries?: number;
    initialDelay?: number;
    backoffFactor?: number;
  }): void {
    if (config.maxRetries !== undefined) {
      this.maxRetries = config.maxRetries;
    }
    if (config.initialDelay !== undefined) {
      this.initialDelay = config.initialDelay;
    }
    if (config.backoffFactor !== undefined) {
      this.backoffFactor = config.backoffFactor;
    }
  }
}

// Default retry mechanism instance
export const defaultRetryMechanism = new RetryMechanism();

// Legacy function for backward compatibility
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY_MS,
  backoffFactor: number = BACKOFF_FACTOR
): Promise<T> => {
  return defaultRetryMechanism.execute(fn, maxRetries, initialDelay, backoffFactor);
};
