import { Request, Response } from "express";
import prisma from "../../../config/prisma";

export const listGroups = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const groups = await prisma.employeeGroup.findMany({
            where: { companyId },
            include: { parent: true }
        });
        res.json({ data: groups });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        console.log(`[EmployeeGroup] Creating group for company: ${companyId}`, req.body);

        const group = await prisma.employeeGroup.create({
            data: { ...req.body, companyId }
        });
        res.status(201).json({ message: "Group created", data: group });
    } catch (error: any) {
        console.error("[EmployeeGroup] Create Error:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "An employee group with this name already exists" });
        }
        if (error.code === 'P2003') {
            return res.status(400).json({ message: "Invalid parent group ID provided" });
        }
        res.status(500).json({ message: error.message });
    }
};

export const getGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const group = await prisma.employeeGroup.findUnique({
            where: { id },
            include: { parent: true }
        });
        if (!group) return res.status(404).json({ message: "Group not found" });
        res.json({ data: group });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const group = await prisma.employeeGroup.update({
            where: { id },
            data: req.body
        });
        res.json({ message: "Group updated", data: group });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGroup = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check for sub-groups
        const subGroups = await prisma.employeeGroup.count({
            where: { parentId: id }
        });
        if (subGroups > 0) {
            return res.status(400).json({ message: "Cannot delete group: It contains sub-groups. Please delete or move them first." });
        }

        // Check for employees
        const employees = await prisma.payrollEmployee.count({
            where: { employeeGroupId: id }
        });
        if (employees > 0) {
            return res.status(400).json({ message: "Cannot delete group: It contains employees. Please move them to another group first." });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Delete Group-level SalaryStructureItem (via SalaryStructure)
            await tx.salaryStructureItem.deleteMany({
                where: { salaryStructure: { employeeGroupId: id } }
            });

            // 2. Delete Group-level SalaryStructure
            await tx.salaryStructure.deleteMany({
                where: { employeeGroupId: id }
            });

            // 3. Delete the Group
            await tx.employeeGroup.delete({
                where: { id }
            });
        });

        res.json({ message: "Employee Group deleted successfully" });
    } catch (error: any) {
        console.error("[EmployeeGroup] Delete Error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

