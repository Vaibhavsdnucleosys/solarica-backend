import { Request, Response } from "express";
import prisma from "../../../config/prisma";
import * as payrollLockService from "../../../services/payroll/payrollLock.service";
import * as salaryProcessingService from "../../../services/payroll/salaryProcessing.service";
import * as payrollAccountingService from "../../../services/payroll/payrollAccounting.service";

export const listVouchers = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year } = req.query;
        const vouchers = await prisma.salaryVoucher.findMany({
            where: {
                companyId,
                ...(month ? { month: Number(month) } : {}),
                ...(year ? { year: Number(year) } : {})
            },
            include: { employee: true }
        });
        res.json({ data: vouchers });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getVoucher = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const voucher = await prisma.salaryVoucher.findUnique({
            where: { id },
            include: { employee: true, items: { include: { payHead: true } } }
        });
        if (!voucher) return res.status(404).json({ message: "Voucher not found" });
        res.json({ data: voucher });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const processSalary = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year, employeeIds, employeeGroupId } = req.body;
        const userId = (req as any).user?.id || "system";

        // Check derived status (Tally Workflow: Lock -> Process -> Approve)
        const { status } = await payrollLockService.getDerivedPayrollStatus(
            companyId,
            Number(month),
            Number(year),
            employeeGroupId
        );

        if (status === "OPEN") {
            return res.status(400).json({
                message: `Cannot process salary. Period ${month}/${year} must be LOCKED first.`
            });
        }

        if (status === "APPROVED") {
            return res.status(400).json({
                message: `Cannot process salary. Period ${month}/${year} is already APPROVED for this group.`
            });
        }

        const result = await salaryProcessingService.processPayroll(
            companyId,
            Number(month),
            Number(year),
            employeeIds,
            userId,
            employeeGroupId
        );

        res.json({
            message: result.message || "Salary processed successfully",
            processedCount: result.processed || 0,
            skippedCount: result.skipped || 0,
            totalFound: result.totalFound || 0,
            totalEligible: result.totalEligible || 0
        });
    } catch (error: any) {
        console.error("[Salary Processing Controller] Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const approveVouchers = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { month, year, employeeGroupId } = req.body;
        const userId = (req as any).user?.id || "system";

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required to approve vouchers" });
        }

        // 1. Find all PROCESSED vouchers for the period (and group)
        const processedVouchers = await prisma.salaryVoucher.findMany({
            where: {
                companyId,
                month: Number(month),
                year: Number(year),
                status: "PROCESSED",
                ...(employeeGroupId ? {
                    employee: {
                        employeeGroupId: employeeGroupId === 'all' ? undefined : employeeGroupId
                    }
                } : {})
            }
        });

        if (processedVouchers.length === 0) {
            return res.status(400).json({ message: "No processed vouchers available for approval in this group" });
        }

        // 2. Update status to APPROVED
        const updateResult = await prisma.salaryVoucher.updateMany({
            where: {
                id: { in: processedVouchers.map(v => v.id) }
            },
            data: {
                status: "APPROVED",
                approvedAt: new Date(),
                approvedBy: userId
            }
        });

        // 3. Post System-Generated Payroll Journal (PF & PT Accounting)
        try {
            await payrollAccountingService.postPayrollJournal(
                companyId,
                Number(month),
                Number(year),
                userId
            );
        } catch (postError: any) {
            console.error("[Salary Voucher Approval] System Accounting Posting Error:", postError);
            // We report the error but keep the vouchers approved.
            return res.json({
                message: `Vouchers approved, but accounting posting failed: ${postError.message}`,
                approvedCount: updateResult.count,
                month: Number(month),
                year: Number(year),
                status: "APPROVED",
                accountingPosted: false,
                accountingError: postError.message
            });
        }

        res.json({
            message: `Successfully approved ${updateResult.count} vouchers and posted payroll journal for ${month}/${year}`,
            approvedCount: updateResult.count,
            month: Number(month),
            year: Number(year),
            status: "APPROVED",
            accountingPosted: true
        });
    } catch (error: any) {
        console.error("[Salary Voucher Approval] Error:", error);
        res.status(500).json({ message: error.message });
    }
};

