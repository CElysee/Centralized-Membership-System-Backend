import { Injectable, Scope } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

/**
 * Centralized Logger Service
 * 
 * Creates context-specific log files organized by module/service name.
 * 
 * @example
 * private readonly logger = new LoggerService('AuthService');
 * 
 * this.logger.info('User logged in', { userId: '123' });
 * this.logger.error('Login failed', error.stack, { email: 'test@example.com' });
 * this.logger.audit('USER_LOGIN', { userId: '123', ip: '192.168.1.1' });
 */
@Injectable({ scope: Scope.TRANSIENT })
class LoggerService {
  private readonly logger: winston.Logger;
  private readonly context: string;

  /**
   * Create a new logger instance for a specific context/module
   * @param context - The context name (e.g., 'AuthService', 'PaymentService')
   *                  This determines the folder structure for logs
   */
  constructor(context: string = 'Application') {
    this.context = context;
    this.logger = this.createLogger(context);
  }

  /**
   * Create winston logger with context-specific file transports
   */
  private createLogger(context: string): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${this.context}] ${level.toUpperCase()}: ${message}${metaStr}`;
      }),
    );

    const jsonFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );

    // Sanitize context for folder name (remove special chars)
    const folderName = context.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      defaultMeta: { service: 'centralized-membership-system', context },
      transports: [
        // Context-specific INFO logs
        new winston.transports.DailyRotateFile({
          dirname: `logs/${folderName}/info`,
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          format: jsonFormat,
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
        }),
        // Context-specific ERROR logs
        new winston.transports.DailyRotateFile({
          dirname: `logs/${folderName}/error`,
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: jsonFormat,
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
        }),
        // Context-specific AUDIT logs (for sensitive operations)
        new winston.transports.DailyRotateFile({
          dirname: `logs/${folderName}/audit`,
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          format: jsonFormat,
          maxSize: '50m',
          maxFiles: '90d',
          zippedArchive: true,
        }),
        // Global combined logs (all contexts)
        new winston.transports.DailyRotateFile({
          dirname: 'logs/combined',
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          format: jsonFormat,
          maxSize: '50m',
          maxFiles: '14d',
          zippedArchive: true,
        }),
        // Global error logs (all contexts)
        new winston.transports.DailyRotateFile({
          dirname: 'logs/errors',
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: jsonFormat,
          maxSize: '50m',
          maxFiles: '30d',
          zippedArchive: true,
        }),
      ],
    });

    // Console output for non-production
    if (process.env.NODE_ENV !== 'production') {
      logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            logFormat,
          ),
        }),
      );
    }

    return logger;
  }

  /**
   * Log info level message
   * @param message - Log message
   * @param meta - Additional metadata
   */
  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  /**
   * Log error level message
   * @param message - Error message
   * @param trace - Stack trace (optional)
   * @param meta - Additional metadata
   */
  error(message: string, trace?: string, meta?: Record<string, any>): void {
    this.logger.error(message, { trace, ...meta });
  }

  /**
   * Log warning level message
   * @param message - Warning message
   * @param meta - Additional metadata
   */
  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log debug level message
   * @param message - Debug message
   * @param meta - Additional metadata
   */
  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log audit trail for sensitive operations
   * @param action - Action performed (e.g., 'USER_LOGIN', 'PAYMENT_CREATED')
   * @param details - Audit details
   */
  audit(
    action: string,
    details: {
      userId?: string;
      resourceId?: string;
      resourceType?: string;
      oldValue?: any;
      newValue?: any;
      ipAddress?: string;
      userAgent?: string;
      status?: 'SUCCESS' | 'FAILURE';
      metadata?: Record<string, any>;
    },
  ): void {
    this.logger.info(action, {
      type: 'AUDIT',
      action,
      ...this.sanitizeAuditData(details),
    });
  }

  /**
   * Log HTTP request (useful in interceptors/middleware)
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    meta?: Record<string, any>,
  ): void {
    this.logger.info(`${method} ${url} - ${statusCode} - ${duration}ms`, {
      type: 'HTTP',
      method,
      url,
      statusCode,
      duration,
      ...meta,
    });
  }

  /**
   * Sanitize sensitive data from audit logs
   */
  private sanitizeAuditData(data: Record<string, any>): Record<string, any> {
    const sensitiveFields = [
      'password',
      'confirmPassword',
      'newPassword',
      'oldPassword',
      'token',
      'refreshToken',
      'accessToken',
      'otp',
      'otpCode',
      'resetToken',
      'confirmationToken',
      'secretKey',
      'apiKey',
      'creditCard',
      'cvv',
    ];

    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.includes(key)) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return sanitize(data);
  }
}

export default LoggerService;
