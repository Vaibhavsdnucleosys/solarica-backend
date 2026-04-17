import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.config';


export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';

    // Log when the request finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { statusCode } = res;
        const contentLength = res.get('content-length');

        const message = `${method} ${url} ${statusCode} - ${duration}ms - ${userAgent} - ${ip}`;

        if (statusCode >= 500) {
            logger.error(message);
        } else if (statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.info(message);
        }
    });

    next();
};

