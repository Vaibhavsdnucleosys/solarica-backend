import { Request, Response } from "express";
import * as payrollLockService from "../../../services/payroll/payrollLock.service";

/**
 * Lock a payroll period (group-aware)
 */
export const lockPeriod = async (req: Request, res: Response) => {
    try {
        const { companyId, month, year } = req.params;
        const userId = (req as any).user?.id || "system";
        const { employeeGroupId } = req.body;

        const result = await payrollLockService.lockPayrollPeriod(
            companyId,
            parseInt(month),
            parseInt(year),
            userId,
            employeeGroupId
        );

        res.status(201).json(result);
    } catch (error: any) {
        console.error("[Payroll Lock Controller] Lock error:", error);
        res.status(400).json({ message: error.message || "Failed to lock payroll period" });
    }
};

/**
 * Unlock a payroll period (group-aware)
 */
export const unlockPeriod = async (req: Request, res: Response) => {
    try {
        const { companyId, month, year } = req.params;
        const { employeeGroupId } = req.body;

        await payrollLockService.unlockPayrollPeriod(
            companyId,
            parseInt(month),
            parseInt(year),
            employeeGroupId
        );

        res.json({ message: `Payroll unlocked successfully` });
    } catch (error: any) {
        console.error("[Payroll Lock Controller] Unlock error:", error);
        res.status(400).json({ message: error.message || "Failed to unlock payroll period" });
    }
};

/**
 * Get lock status (group-aware)
 */
export const getLockStatus = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year, employeeGroupId } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required" });
        }

        const { status, lockInfo } = await payrollLockService.getDerivedPayrollStatus(
            companyId,
            parseInt(month as string),
            parseInt(year as string),
            employeeGroupId as string | undefined
        );

        res.json({
            data: {
                isLocked: !!lockInfo,
                status,
                lockInfo
            }
        });
    } catch (error: any) {
        console.error("[Payroll Lock Controller] Status error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

