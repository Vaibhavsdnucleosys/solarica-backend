import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";

/**
 * Optional auth middleware.
 * If a valid token is provided → attaches req.user and calls next().
 * If no token or invalid token → still calls next() without setting req.user.
 * Use this for endpoints that should work for both authenticated and guest users.
 */
export const authOptional = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        next(); // No token — continue as guest
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        console.log(`[AuthOptional] User Authenticated: ${(decoded as any).role}, ID: ${(decoded as any).id}`);
    } catch (error) {
        // Invalid token — continue as guest (don't reject)
        console.warn("[AuthOptional] Token invalid, continuing as guest.");
    }

    next();
};

