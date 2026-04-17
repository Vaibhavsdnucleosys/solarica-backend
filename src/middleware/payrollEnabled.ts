import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const asyncHandler =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);


export const requirePayrollEnabled =
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(
            (async () => {
                const { companyId } = req.params as { companyId?: string };

                const config = await prisma.statutoryConfig.findUnique({
                    where: { companyId: companyId as string }
                });

                if (!config?.payrollEnabled) {
                    return res.status(400).json({
                        message: "Payroll is not activated for this company"
                    });
                }

                next();
            })()
        ).catch(next);
    };



