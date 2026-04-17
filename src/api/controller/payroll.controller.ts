import { Request, Response } from "express";
import { setPTExemptModel, bulkPTExemptModel } from "../model/payroll.model";
import {
    setCategoryPTExemption,
    getPTExemptionStatus,
    PTExemptionCategory
} from "../../services/payroll/pt-exemption.service";

// Toggle PT Exemption for a single employee
export const togglePTExempt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Employee User ID
        const { isExempt } = req.body; // boolean

        if (typeof isExempt !== 'boolean') {
            return res.status(400).json({ success: false, message: "isExempt (boolean) is required" });
        }

        const result = await setPTExemptModel(id, isExempt);

        res.status(200).json({
            success: true,
            message: `Professional Tax exemption ${isExempt ? 'enabled' : 'disabled'} successfully`,
            data: result
        });
    } catch (error: any) {
        console.error("Error setting PT exemption:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update PT exemption status",
            error: error.message
        });
    }
};

// Create exemption (bulk or single via POST)
export const createPTExemption = async (req: Request, res: Response) => {
    try {
        const { employeeIds, isExempt, category } = req.body;

        // Handle category-based exemption
        if (category) {
            if (!employeeIds || !Array.isArray(employeeIds)) {
                return res.status(400).json({
                    success: false,
                    message: "employeeIds (array) is required for category exemptions"
                });
            }

            const validCategories = Object.values(PTExemptionCategory);
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Must be one of: ${validCategories.join(", ")}`
                });
            }

            const results = [];
            for (const empId of employeeIds) {
                try {
                    await setCategoryPTExemption(empId, category, isExempt !== false);
                    results.push({ employeeId: empId, success: true });
                } catch (error: any) {
                    results.push({ employeeId: empId, success: false, error: error.message });
                }
            }

            return res.status(200).json({
                success: true,
                message: `Category-based PT exemption (${category}) processed`,
                data: results
            });
        }

        // Handle bulk general exemption
        if (!Array.isArray(employeeIds)) {
            return res.status(400).json({
                success: false,
                message: "employeeIds (array of strings) is required"
            });
        }

        const exemptStatus = isExempt !== undefined ? isExempt : true;
        const results = await bulkPTExemptModel(employeeIds, exemptStatus);

        res.status(200).json({
            success: true,
            message: "Processed PT exemptions",
            data: results
        });

    } catch (error: any) {
        console.error("Error creating PT exemptions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create PT exemptions",
            error: error.message
        });
    }
};

// Get PT exemption status for an employee
export const getPTExemptStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const status = await getPTExemptionStatus(id);

        res.status(200).json({
            success: true,
            data: status
        });
    } catch (error: any) {
        console.error("Error getting PT exemption status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get PT exemption status",
            error: error.message
        });
    }
};

