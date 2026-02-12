
/**
 * Log levels
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
 * AppLogger - Simplified logger using console methods
 */
class AppLogger {
  private moduleContext: LogContext;

  constructor(moduleContext: LogContext = {}) {
    this.moduleContext = moduleContext;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const mergedContext = { ...this.moduleContext, ...context };
    const moduleStr = mergedContext.module ? `[${mergedContext.module}] ` : "";
    const contextStr = Object.keys(mergedContext).length > (mergedContext.module ? 1 : 0) 
      ? ` | ${JSON.stringify(mergedContext)}` 
      : "";
    return `${moduleStr}${message}${contextStr}`;
  }

  trace(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`%cTRACE%c ${this.formatMessage("trace", message, context)}`, "color: #888", "color: inherit");
    }
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`%cDEBUG%c ${this.formatMessage("debug", message, context)}`, "color: #007acc", "color: inherit");
    }
  }

  info(message: string, context?: LogContext): void {
    console.log(`%cINFO%c ${this.formatMessage("info", message, context)}`, "color: #28a745", "color: inherit");
  }

  warn(message: string, context?: LogContext): void {
    console.warn(`%cWARN%c ${this.formatMessage("warn", message, context)}`, "color: #ffc107", "color: inherit");
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const formattedMessage = this.formatMessage("error", message, context);
    console.error(`%cERROR%c ${formattedMessage}`, "color: #dc3545", "color: inherit");
    if (error) console.error(error);
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const formattedMessage = this.formatMessage("fatal", message, context);
    console.error(`%cFAFATAL%c ${formattedMessage}`, "background: #dc3545; color: white; padding: 2px 4px; border-radius: 2px", "color: #dc3545; font-weight: bold");
    if (error) console.error(error);
  }

  child(module: string): AppLogger {
    return new AppLogger({
      ...this.moduleContext,
      module: this.moduleContext.module
        ? `${this.moduleContext.module}:${module}`
        : module,
    });
  }

  withRequest(requestId: string, userId?: string): AppLogger {
    return new AppLogger({
      ...this.moduleContext,
      requestId,
      userId,
    });
  }

  time(label: string): { end: (context?: LogContext) => void } {
    const start = Date.now();
    return {
      end: (context?: LogContext) => {
        const duration = Date.now() - start;
        this.debug(`${label} completed`, { ...context, duration });
      },
    };
  }

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

export const logger = new AppLogger({ module: "app" });

export function createLogger(module: string): AppLogger {
  return logger.child(module);
}

export function createRequestLogger(requestId: string, userId?: string): AppLogger {
  return logger.withRequest(requestId, userId);
}

export { AppLogger };
