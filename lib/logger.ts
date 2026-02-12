import pino, { type Logger, type LoggerOptions } from "pino";

/**
 * Log levels supported by Pino
 */
type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Context object for structured logging
 */
interface LogContext {
  module?: string;
  action?: string;
  projectId?: string;
  userId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Determine log level based on environment
 */
function getLogLevel(): LogLevel {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL as LogLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

/**
 * Pino configuration options
 */
const pinoOptions: LoggerOptions = {
  level: getLogLevel(),
  // Use pino-pretty in development for readable logs
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
            messageFormat: "{msg}",
          },
        }
      : undefined,
  // Base fields included in every log
  base: {
    env: process.env.NODE_ENV,
    service: "simulark-api",
  },
  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
  // Custom log formatting
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      ...bindings,
      node_version: process.version,
    }),
  },
  // Redact sensitive fields
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-api-key']",
      "password",
      "token",
      "apiKey",
      "api_key",
      "access_token",
      "refresh_token",
    ],
    censor: "[REDACTED]",
  },
};

/**
 * Create the base Pino logger instance
 */
const baseLogger = pino(pinoOptions);

/**
 * AppLogger - Wrapper around Pino with module context support
 * Provides a familiar API while leveraging Pino's performance
 */
class AppLogger {
  private logger: Logger;
  private moduleContext: LogContext;

  constructor(logger: Logger, moduleContext: LogContext = {}) {
    this.logger = logger;
    this.moduleContext = moduleContext;
  }

  /**
   * Merge context with module context
   */
  private mergeContext(context?: LogContext): LogContext {
    return { ...this.moduleContext, ...context };
  }

  /**
   * Log trace level message
   */
  trace(message: string, context?: LogContext): void {
    this.logger.trace(this.mergeContext(context), message);
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.mergeContext(context), message);
  }

  /**
   * Log info level message
   */
  info(message: string, context?: LogContext): void {
    this.logger.info(this.mergeContext(context), message);
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.mergeContext(context), message);
  }

  /**
   * Log error level message with optional Error object
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const mergedContext = this.mergeContext(context);

    if (error instanceof Error) {
      this.logger.error(
        {
          ...mergedContext,
          err: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        message,
      );
    } else if (error) {
      this.logger.error({ ...mergedContext, error }, message);
    } else {
      this.logger.error(mergedContext, message);
    }
  }

  /**
   * Log fatal level message - for critical errors
   */
  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const mergedContext = this.mergeContext(context);

    if (error instanceof Error) {
      this.logger.fatal(
        {
          ...mergedContext,
          err: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        message,
      );
    } else {
      this.logger.fatal(mergedContext, message);
    }
  }

  /**
   * Create a child logger with additional module context
   */
  child(module: string): AppLogger {
    return new AppLogger(this.logger, {
      ...this.moduleContext,
      module: this.moduleContext.module
        ? `${this.moduleContext.module}:${module}`
        : module,
    });
  }

  /**
   * Create a child logger with request context
   */
  withRequest(requestId: string, userId?: string): AppLogger {
    return new AppLogger(this.logger, {
      ...this.moduleContext,
      requestId,
      userId,
    });
  }

  /**
   * Time tracking helper
   */
  time(label: string): { end: (context?: LogContext) => void } {
    const start = Date.now();

    return {
      end: (context?: LogContext) => {
        const duration = Date.now() - start;
        this.debug(`${label} completed`, { ...context, duration });
      },
    };
  }

  /**
   * Async function timing wrapper
   */
  async withTiming<T>(
    label: string,
    fn: () => Promise<T>,
    context?: LogContext,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { ...context, duration, success: true });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed`, error, {
        ...context,
        duration,
        success: false,
      });
      throw error;
    }
  }
}

/**
 * Default logger instance for app-wide use
 */
export const logger = new AppLogger(baseLogger, { module: "app" });

/**
 * Create a module-specific logger
 */
export function createLogger(module: string): AppLogger {
  return logger.child(module);
}

/**
 * Create a request-scoped logger with request ID
 */
export function createRequestLogger(
  requestId: string,
  userId?: string,
): AppLogger {
  return logger.withRequest(requestId, userId);
}

/**
 * Export the AppLogger class for type imports
 */
export { AppLogger };

/**
 * Export the base Pino logger for advanced use cases
 */
export { baseLogger as pinoLogger };
