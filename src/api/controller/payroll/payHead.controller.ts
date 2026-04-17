import { Request, Response } from "express";
import prisma from "../../../config/prisma";

export const listPayHeads = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const payHeads = await prisma.payHead.findMany({
            where: {
                companyId,
                isActive: true
            }
        });
        res.json({ data: payHeads });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPayHead = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const body = req.body;

        console.log(`[PayHead] Creating pay head for company: ${companyId}`);
        console.log("[PayHead] Payload:", JSON.stringify(body, null, 2));

        // 1. Basic Validation
        if (!body.name) return res.status(400).json({ message: "Pay Head name is required" });
        if (!body.payHeadType) return res.status(400).json({ message: "Pay Head type is required" });
        if (!body.calcType) return res.status(400).json({ message: "Calculation type is required" });

        // 2. Statutory Validation
        const isStatutoryType = [
            'DEDUCTIONS_FROM_EMPLOYEES',
            'EMPLOYERS_STATUTORY_CONTRIBUTIONS'
        ].includes(body.payHeadType);

        if (isStatutoryType && !body.statutoryType) {
            console.error("[PayHead] Validation Failed: Statutory Type missing");
            return res.status(400).json({ message: "Statutory Type is required for statutory deduction/contribution pay heads" });
        }

        // 3. Computation Validation
        if (body.calcType === 'AS_COMPUTED_VALUE') {
            if (!body.computeOn) {
                console.error("[PayHead] Validation Failed: Compute On missing");
                return res.status(400).json({ message: "Compute On is required for computed pay heads" });
            }
            if (body.computeOn === 'SPECIFIED_PAY_HEADS' && (!body.computePayHeadIds || body.computePayHeadIds.length === 0)) {
                console.error("[PayHead] Validation Failed: Dependent heads missing");
                return res.status(400).json({ message: "At least one dependent pay head is required when computing on specified heads" });
            }
        }

        // 4. Map Data
        const prismaData: any = {
            companyId,
            name: body.name,
            alias: body.alias,
            payHeadType: body.payHeadType,
            incomeType: body.incomeType || 'Fixed',
            ledgerId: body.ledgerId,
            affectNetSalary: body.affectNetSalary ?? true,
            payslipDisplayName: body.payslipName || body.name,
            useForGratuity: body.useGratuity ?? false,
            calcType: body.calcType,
            computeOn: body.computeOn || 'NOT_APPLICABLE',
            computePayHeadIds: body.computePayHeadIds || [],
            computePercentage: body.computePercentage ? parseFloat(body.computePercentage) : null,
            isStatutory: isStatutoryType,
            statutoryType: body.statutoryType,
            isSystem: body.isSystem ?? false,
            isActive: body.isActive ?? true
        };

        // 5. Check for existing pay head with name in this company (Explicit check for better error)
        const existing = await prisma.payHead.findFirst({
            where: {
                companyId,
                name: { equals: body.name, mode: 'insensitive' },
                isActive: true
            }
        });

        if (existing) {
            return res.status(400).json({ message: `A pay head with name '${body.name}' already exists in this company.` });
        }

        // 6. Create in DB
        const payHead = await prisma.payHead.create({
            data: prismaData
        });

        res.status(201).json({ message: "Pay Head created successfully", data: payHead });
    } catch (error: any) {
        console.error("[PayHead] Create Error:", error);

        if (error.code === 'P2002') {
            return res.status(400).json({ message: "A pay head with this name already exists in this company." });
        }

        res.status(500).json({ message: error.message || "Internal server error during pay head creation" });
    }
};

export const getPayHead = async (req: Request, res: Response) => {
    try {
        const { companyId, id } = req.params;
        const payHead = await prisma.payHead.findFirst({
            where: { id, companyId }
        });

        if (!payHead) {
            return res.status(404).json({ message: "Pay Head not found" });
        }

        res.json({ data: payHead });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePayHead = async (req: Request, res: Response) => {
    try {
        const { companyId, id } = req.params;
        const body = req.body;

        // 1. Check if it exists and belongs to this company
        const existing = await prisma.payHead.findFirst({
            where: { id, companyId }
        });

        if (!existing) {
            return res.status(404).json({ message: "Pay head not found or doesn't belong to this company" });
        }

        // 2. Uniqueness check if name is changing
        if (body.name && body.name.toLowerCase() !== existing.name.toLowerCase()) {
            const duplicate = await prisma.payHead.findFirst({
                where: {
                    companyId,
                    name: { equals: body.name, mode: 'insensitive' },
                    NOT: { id },
                    isActive: true
                }
            });

            if (duplicate) {
                return res.status(400).json({ message: `Another pay head with name '${body.name}' already exists in this company.` });
            }
        }

        // 3. Map Data
        const isStatutoryType = body.payHeadType ? [
            'EMPLOYEES_STATUTORY_DEDUCTIONS',
            'EMPLOYERS_STATUTORY_CONTRIBUTIONS'
        ].includes(body.payHeadType) : existing.isStatutory;

        const updateData: any = {
            name: body.name,
            alias: body.alias,
            payHeadType: body.payHeadType,
            incomeType: body.incomeType,
            ledgerId: body.ledgerId,
            affectNetSalary: body.affectNetSalary,
            payslipDisplayName: body.payslipName,
            useForGratuity: body.useGratuity,
            calcType: body.calcType,
            computeOn: body.computeOn,
            computePayHeadIds: body.computePayHeadIds,
            computePercentage: body.computePercentage ? parseFloat(body.computePercentage) : undefined,
            isStatutory: isStatutoryType,
            statutoryType: body.statutoryType,
            isActive: body.isActive
        };

        // 4. Update in DB
        const updated = await prisma.payHead.update({
            where: { id },
            data: updateData
        });

        res.json({ message: "Pay Head updated successfully", data: updated });
    } catch (error: any) {
        console.error("[PayHead] Update Error:", error);

        if (error.code === 'P2002') {
            return res.status(400).json({ message: "A pay head with this name already exists in this company." });
        }

        res.status(500).json({ message: error.message || "Internal server error during pay head update" });
    }
};

export const deletePayHead = async (req: Request, res: Response) => {
    try {
        const { companyId, id } = req.params;

        // check if it belongs to company
        const payHead = await prisma.payHead.findFirst({
            where: { id, companyId }
        });
        if (!payHead) return res.status(404).json({ message: "Pay head not found" });

        await prisma.$transaction(async (tx) => {
            // 1. Delete SalaryVoucherItem using this pay head
            await tx.salaryVoucherItem.deleteMany({
                where: { payHeadId: id }
            });

            // 2. Delete SalaryStructureItem using this pay head
            await tx.salaryStructureItem.deleteMany({
                where: { payHeadId: id }
            });

            // 3. Remove this pay head from other pay heads' computation list
            const dependentHeads = await tx.payHead.findMany({
                where: {
                    companyId,
                    computePayHeadIds: { has: id }
                }
            });

            for (const ph of dependentHeads) {
                const newIds = ph.computePayHeadIds.filter(cid => cid !== id);
                await tx.payHead.update({
                    where: { id: ph.id },
                    data: { computePayHeadIds: newIds }
                });
            }

            // 4. Delete the pay head
            await tx.payHead.delete({
                where: { id }
            });
        });

        res.json({ message: "Pay Head deleted successfully" });
    } catch (error: any) {
        console.error("[PayHead] Delete Error:", error);
        res.status(500).json({ message: error.message || "Internal server error during deletion" });
    }
};

