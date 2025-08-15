/**
 * Logger utility for consistent console logging with timestamps
 */
export interface LoggerConfig {
  enableInfo: boolean;
  enableWarn: boolean;
  enableError: boolean;
  enableDebug: boolean;
  prefix?: string;
}

/**
 * Logger class for structured console logging
 */
export class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enableInfo: true,
      enableWarn: true,
      enableError: true,
      enableDebug: false,
      prefix: '',
      ...config
    };
  }

  /**
   * Get formatted timestamp
   * @returns ISO timestamp string
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format log message with timestamp and prefix
   * @param level Log level
   * @param message Log message
   * @returns Formatted log message
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = this.getTimestamp();
    const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
    return `${prefix}[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }

  /**
   * Log info message
   * @param message Info message
   * @param details Additional details to log
   */
  info(message: string, details?: unknown): void {
    if (this.config.enableInfo) {
      const formattedMessage = this.formatMessage('info', message);
      console.log(formattedMessage, details || '');
    }
  }

  /**
   * Log warning message
   * @param message Warning message
   * @param details Additional details to log
   */
  warn(message: string, details?: unknown): void {
    if (this.config.enableWarn) {
      const formattedMessage = this.formatMessage('warn', message);
      console.warn(formattedMessage, details || '');
    }
  }

  /**
   * Log error message with summary and details
   * @param summary Error summary
   * @param details Error details or error object
   */
  error(summary: string, details?: unknown): void {
    if (this.config.enableError) {
      const formattedMessage = this.formatMessage('error', summary);
      console.error(formattedMessage, details || '');
    }
  }

  /**
   * Log debug message
   * @param message Debug message
   * @param details Additional details to log
   */
  debug(message: string, details?: unknown): void {
    if (this.config.enableDebug) {
      const formattedMessage = this.formatMessage('debug', message);
      console.debug(formattedMessage, details || '');
    }
  }

  /**
   * Update logger configuration
   * @param config New configuration
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   * @returns Current logger configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Create a child logger with additional prefix
   * @param prefix Additional prefix for the child logger
   * @returns New Logger instance with extended prefix
   */
  child(prefix: string): Logger {
    const newPrefix = this.config.prefix ? `${this.config.prefix}:${prefix}` : prefix;
    return new Logger({
      ...this.config,
      prefix: newPrefix
    });
  }
}

// Default logger instance
export const defaultLogger = new Logger();

// Legacy functions for backward compatibility
export const logger = {
  info: (message: string, details?: unknown) => defaultLogger.info(message, details),
  error: (summary: string, details?: unknown) => defaultLogger.error(summary, details),
  warn: (message: string, details?: unknown) => defaultLogger.warn(message, details),
  debug: (message: string, details?: unknown) => defaultLogger.debug(message, details)
};

// Named export for backward compatibility
export { logger as consoleLogger };
