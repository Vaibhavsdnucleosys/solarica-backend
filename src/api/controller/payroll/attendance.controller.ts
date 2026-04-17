import { Request, Response } from "express";
import prisma from "../../../config/prisma";
import * as payrollLockService from "../../../services/payroll/payrollLock.service";

export const listAttendance = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { employeeId, date } = req.query;
        const attendance = await prisma.attendanceRecord.findMany({
            where: {
                companyId,
                ...(employeeId ? { employeeId: String(employeeId) } : {}),
                ...(date ? { date: new Date(String(date)) } : {})
            }
        });
        res.json({ data: attendance });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const markAttendance = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user.id;
        const date = new Date(req.body.date);

        // Check if period is locked
        const isLocked = await payrollLockService.isPeriodLocked(companyId, date);
        if (isLocked) {
            return res.status(400).json({
                message: `Cannot mark attendance. The payroll period for ${date.getMonth() + 1}/${date.getFullYear()} is locked.`
            });
        }

        const record = await prisma.attendanceRecord.upsert({
            where: {
                companyId_employeeId_date: {
                    companyId,
                    employeeId: req.body.employeeId,
                    date
                }
            },
            create: { ...req.body, companyId, createdBy: userId, date },
            update: { ...req.body, date }
        });
        res.json({ message: "Attendance marked", data: record });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

