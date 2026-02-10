// Production-ready logging utility
// In development, logs are shown. In production, logs can be sent to a monitoring service.

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  module?: string;
  action?: string;
  projectId?: string;
  userId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

// Current environment
const isProduction = process.env.NODE_ENV === "production";

class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const moduleStr = this.module ? `[${this.module}]` : "";
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${moduleStr} ${message}${contextStr}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): void {
    const formattedMessage = this.formatMessage(level, message, context);

    if (isProduction) {
      // In production, you could send logs to a service like Sentry, Datadog, etc.
      // For now, we'll use console but could be extended
      switch (level) {
        case "error":
          console.error(formattedMessage, error?.stack || error);
          break;
        case "warn":
          console.warn(formattedMessage);
          break;
        case "info":
          console.log(formattedMessage);
          break;
        default:
          console.debug(formattedMessage);
      }
    } else {
      // In development, use colored console for better DX
      const colors = {
        debug: "#6b7280",
        info: "#3b82f6",
        warn: "#f59e0b",
        error: "#ef4444",
      };

      const color = colors[level];
      console.log(
        `%c${formattedMessage}`,
        `color: ${color}`,
        error?.stack || "",
      );
    }

    // Could also send to external service in production
    // this.sendToMonitoring(level, message, context, error);
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, context, error);
  }

  // Create a child logger with additional module context
  child(module: string): Logger {
    return new Logger(`${this.module}:${module}`);
  }
}

// Export a default logger instance
export const logger = new Logger("app");

// Export class for creating module-specific loggers
export { Logger };
