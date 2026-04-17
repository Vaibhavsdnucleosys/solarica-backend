import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

/**
 * Custom log format for both console and file
 */
const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.constructor === Object) {
        logMessage += ` | Meta: ${JSON.stringify(meta)}`;
    }
    return logMessage;
});

/**
 * Configure Winston Daily Rotate File Transport
 */
const fileRotateTransport = new DailyRotateFile({
    filename: 'logs/system-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
});

/**
 * Core Winston Logger instance
 */
const winstonInstance = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [
        // Console logging with colors
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
        }),
        // Standard system.log file (the one tracked in Git)
        new winston.transports.File({
            filename: 'system.log',
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
        }),
        // Daily rotating file logging for history
        fileRotateTransport,
    ],
    // Handle unhandled exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ]
});

/**
 * Exported Logger interface to match previous implementation
 * This ensures no existing code breaks.
 */
export const logger = {
    info: (message: string, meta?: any) => winstonInstance.info(message, meta),
    warn: (message: string, meta?: any) => winstonInstance.warn(message, meta),
    error: (message: string, meta?: any) => winstonInstance.error(message, meta),
    debug: (message: string, meta?: any) => winstonInstance.debug(message, meta),
    log: (level: string, message: string, meta?: any) => winstonInstance.log(level, message, meta)
};

export default logger;

