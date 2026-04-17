import { Request, Response } from "express";
import prisma from "../../../config/prisma";
import * as payrollLockService from "../../../services/payroll/payrollLock.service";

export const listSalaryStructures = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const structures = await prisma.salaryStructure.findMany({
            where: { companyId },
            include: {
                items: {
                    where: {
                        payHead: { isActive: true }
                    },
                    include: { payHead: true },
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });
        res.json({ data: structures });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSalaryStructureItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;

        // Find the item first to check if it exists
        const item = await prisma.salaryStructureItem.findUnique({
            where: { id: itemId }
        });

        if (!item) {
            return res.status(404).json({ message: "Salary structure item not found" });
        }

        // Delete the item
        await prisma.salaryStructureItem.delete({
            where: { id: itemId }
        });

        res.json({ message: "Item deleted successfully" });
    } catch (error: any) {
        console.error("Delete Salary Item Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getLatestSalaryStructure = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const { employeeId, employeeGroupId, effectiveFrom } = req.query;

        if (!effectiveFrom) {
            return res.status(400).json({ message: "Effective from date is required" });
        }

        const requestedDate = new Date(effectiveFrom as string);
        requestedDate.setUTCHours(0, 0, 0, 0);

        const structure = await prisma.salaryStructure.findFirst({
            where: {
                companyId,
                employeeId: (employeeId as string) || null,
                employeeGroupId: (employeeGroupId as string) || null,
                effectiveFrom: {
                    lte: requestedDate
                },
                isActive: true
            },
            orderBy: {
                effectiveFrom: 'desc'
            },
            include: {
                items: {
                    where: {
                        payHead: { isActive: true }
                    },
                    include: { payHead: true },
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });

        res.json({ data: structure });
    } catch (error: any) {
        console.error("Get Latest Salary Structure Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const createSalaryStructure = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user.id;
        const { items, effectiveFrom, employeeId, employeeGroupId, isActive } = req.body;

        if (!effectiveFrom) {
            return res.status(400).json({ message: "Effective from date is required" });
        }

        const date = new Date(effectiveFrom);
        date.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight

        // Validate all Pay Heads belong to this company and are active
        const payHeadIds = items.map((it: any) => it.payHeadId);
        const validPayHeads = await prisma.payHead.findMany({
            where: {
                id: { in: payHeadIds },
                companyId,
                isActive: true
            },
            select: { id: true }
        });

        if (validPayHeads.length !== payHeadIds.length) {
            return res.status(400).json({ message: "One or more Pay Heads are invalid, inactive, or belong to another company." });
        }

        // Check if period is locked
        const isLocked = await payrollLockService.isPeriodLocked(companyId, date);
        if (isLocked) {
            return res.status(400).json({
                message: `Cannot create salary structure. The payroll period for ${date.getMonth() + 1}/${date.getFullYear()} is locked.`
            });
        }

        // Search for existing structure for the same date and target
        const existing = await prisma.salaryStructure.findFirst({
            where: {
                companyId,
                employeeId: employeeId || null,
                employeeGroupId: employeeGroupId || null,
                effectiveFrom: date
            }
        });

        if (existing) {
            // Update existing structure: 
            // We use a transaction to ensure atomic sync: delete old, create new
            const updated = await prisma.$transaction(async (tx) => {
                await tx.salaryStructureItem.deleteMany({
                    where: { salaryStructureId: existing.id }
                });

                return await tx.salaryStructure.update({
                    where: { id: existing.id },
                    data: {
                        items: {
                            create: items.map((it: any, idx: number) => ({
                                payHeadId: it.payHeadId,
                                amount: it.amount,
                                percentage: it.percentage,
                                formula: it.formula,
                                sortOrder: it.sortOrder !== undefined ? it.sortOrder : idx
                            }))
                        }
                    },
                    include: { items: true }
                });
            });

            return res.json({ message: "Salary Structure updated", data: updated });
        }

        const structure = await prisma.salaryStructure.create({
            data: {
                companyId,
                employeeId,
                employeeGroupId,
                isActive: isActive !== undefined ? isActive : true,
                effectiveFrom: date,
                createdBy: userId,
                items: {
                    create: items.map((it: any, idx: number) => ({
                        payHeadId: it.payHeadId,
                        amount: it.amount,
                        percentage: it.percentage,
                        formula: it.formula,
                        sortOrder: it.sortOrder !== undefined ? it.sortOrder : idx
                    }))
                }
            },
            include: { items: true }
        });
        res.status(201).json({ message: "Salary Structure created", data: structure });
    } catch (error: any) {
        console.error("SalaryStructure Error:", error);
        res.status(500).json({ message: error.message });
    }
};

