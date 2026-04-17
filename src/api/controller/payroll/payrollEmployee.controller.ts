import { Request, Response } from "express";
import prisma from "../../../config/prisma";

export const listEmployees = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const employees = await prisma.payrollEmployee.findMany({
            where: { companyId },
            include: { employeeGroup: true }
        });
        res.json({ message: "Payroll employees retrieved", data: employees });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const employee = await prisma.payrollEmployee.findUnique({
            where: { id },
            include: { employeeGroup: true, salaryStructures: true }
        });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ data: employee });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Shared helper to map request body to Prisma data structure.
 * Ensures consistent handling of empty strings as nulls and date conversions.
 * This is the final solution for P2002 Unique Constraint errors on (companyId, employeeNumber).
 */
const mapEmployeeData = (body: any) => {
    const data: any = {};

    // Identity & Employment
    if (body.name !== undefined) data.name = body.name;
    if (body.alias !== undefined) data.alias = body.alias || null;
    // CRITICAL: Convert empty string to null to avoid unique constraint violations on blank numbers
    if (body.employeeNumber !== undefined) data.employeeNumber = body.employeeNumber?.trim() || null;
    if (body.dateOfJoining !== undefined) data.dateOfJoining = body.dateOfJoining ? new Date(body.dateOfJoining) : undefined;

    // General Information
    const fields = [
        'designation', 'function', 'location', 'address', 'phone', 'email', 'gender',
        'fatherMotherName', 'spouseName', 'bloodGroup', 'bankName', 'bankAccountNumber',
        'ifscCode', 'bankBranch', 'pan', 'aadhaar', 'uan', 'pfAccountNumber', 'pran',
        'esiNumber', 'state'
    ];
    fields.forEach(f => {
        if (body[f] !== undefined) data[f] = body[f] || null;
    });

    if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;

    // Flags
    if (body.pfApplicable !== undefined || body.isPFApplicable !== undefined)
        data.pfApplicable = body.isPFApplicable ?? body.pfApplicable ?? false;
    if (body.ptApplicable !== undefined || body.isPTApplicable !== undefined)
        data.ptApplicable = body.isPTApplicable ?? body.ptApplicable ?? false;
    if (body.esiApplicable !== undefined || body.isESIApplicable !== undefined)
        data.esiApplicable = body.isESIApplicable ?? body.esiApplicable ?? false;

    if (body.employeeGroupId !== undefined) data.employeeGroupId = body.employeeGroupId || null;
    if (body.isActive !== undefined) data.isActive = body.isActive ?? true;

    return data;
};

export const createEmployee = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const userId = (req as any).user.id;
        const body = req.body;

        console.log(`[PayrollEmployee] Creating employee for company: ${companyId}`);

        if (!body.name) return res.status(400).json({ message: "Employee name is required" });

        // Default dateOfJoining to today if not provided
        if (!body.dateOfJoining) {
            body.dateOfJoining = new Date().toISOString();
        }

        // Resolve Group Name to ID if provided
        let employeeGroupId = body.employeeGroupId;
        if (!employeeGroupId && body.employeeGroupName) {
            const group = await prisma.employeeGroup.findFirst({
                where: { companyId, name: { equals: body.employeeGroupName, mode: 'insensitive' } }
            });
            if (group) employeeGroupId = group.id;
        }

        const prismaData = {
            ...mapEmployeeData(body),
            companyId,
            createdBy: userId,
            employeeGroupId: employeeGroupId || null
        };

        const employee = await prisma.payrollEmployee.create({ data: prismaData });
        res.status(201).json({ message: "Employee created successfully", data: employee });
    } catch (error: any) {
        console.error("[PayrollEmployee] Create Error:", error);
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            if (target.includes('employeeNumber')) {
                return res.status(400).json({ message: "Employee number already exists in this company" });
            }
            return res.status(400).json({ message: `Unique constraint violation: ${target.join(', ')}` });
        }
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const updateEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body;

        // Clean and Map Data
        const prismaData = mapEmployeeData(body);

        // Prevent accidental company/id updates via body
        delete prismaData.companyId;
        delete prismaData.id;
        delete prismaData.createdBy;

        const employee = await prisma.payrollEmployee.update({
            where: { id },
            data: prismaData
        });

        res.json({ message: "Employee updated", data: employee });
    } catch (error: any) {
        console.error("[PayrollEmployee] Update Error:", error);
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            if (target.includes('employeeNumber')) {
                return res.status(400).json({
                    message: "Another employee already has this Employee Number. Please use a unique number or leave it blank."
                });
            }
            return res.status(400).json({ message: `Unique constraint violation: ${target.join(', ')}` });
        }
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Manual Cleanup to mimic Cascade Delete
        await prisma.$transaction(async (tx) => {
            // 1. Delete SalaryVoucherItem (via SalaryVoucher)
            await tx.salaryVoucherItem.deleteMany({
                where: { salaryVoucher: { employeeId: id } }
            });

            // 2. Delete SalaryVoucher
            await tx.salaryVoucher.deleteMany({
                where: { employeeId: id }
            });

            // 3. Delete SalaryStructureItem (via SalaryStructure)
            await tx.salaryStructureItem.deleteMany({
                where: { salaryStructure: { employeeId: id } }
            });

            // 4. Delete SalaryStructure
            await tx.salaryStructure.deleteMany({
                where: { employeeId: id }
            });

            // 5. Delete AttendanceRecord
            await tx.attendanceRecord.deleteMany({
                where: { employeeId: id }
            });

            // 6. Delete the Employee
            await tx.payrollEmployee.delete({
                where: { id }
            });
        });

        res.json({ message: "Employee and all associated data deleted successfully" });
    } catch (error: any) {
        console.error("[PayrollEmployee] Delete Error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

