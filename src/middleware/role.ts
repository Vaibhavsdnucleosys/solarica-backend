import { Request, Response, NextFunction } from 'express';

export const allow = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const rawRole = req.user?.role;
    const userRole = (typeof rawRole === 'object' ? rawRole?.name : rawRole)?.toLowerCase()?.trim();
    const allowedRoles = roles.map(r => r.toLowerCase().trim());

    console.log(`[ACL Check] User: ${req.user?.email}, Role: ${userRole}, Required: ${allowedRoles.join(', ')}`);

    if (userRole === 'admin') return next(); // Admin always allowed

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn(`[ACL Denied] User: ${req.user?.email}, Role: ${userRole}`);
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

