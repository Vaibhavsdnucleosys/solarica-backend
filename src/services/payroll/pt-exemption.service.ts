/**
 * Professional Tax (PT) Exemption Service
 * 
 * This service provides PT exemption checking logic to be used during salary processing.
 * It checks both employee-level exemptions and category-based exemptions.
 */

import prisma from "../../config/prisma";

// PT Exemption Categories
export enum PTExemptionCategory {
    SENIOR_CITIZEN = "SENIOR_CITIZEN",
    DISABLED = "DISABLED",
    PHYSICALLY_HANDICAPPED = "PHYSICALLY_HANDICAPPED"
}

/**
 * Check if an employee is exempt from Professional Tax
 * 
 * @param employeeId - User ID of the employee
 * @returns true if employee is PT exempt, false otherwise
 */
export const isEmployeePTExempt = async (employeeId: string): Promise<boolean> => {
    try {
        // 1. Check employee-level exemption flag
        const worker = await prisma.worker.findUnique({
            where: { userId: employeeId },
            select: { accessGrants: true }
        });

        if (!worker) {
            // If no worker profile, not exempt
            return false;
        }

        // Check if PT_EXEMPT flag is set
        if (worker.accessGrants && worker.accessGrants.includes("PT_EXEMPT")) {
            return true;
        }

        // 2. Check category-based exemptions
        // Note: Category information would need to be stored somewhere
        // For now, we check if any category exemption tags are in accessGrants
        const categoryExemptions = [
            "PT_EXEMPT_SENIOR_CITIZEN",
            "PT_EXEMPT_DISABLED",
            "PT_EXEMPT_PHYSICALLY_HANDICAPPED"
        ];

        const hasCategoryExemption = worker.accessGrants?.some(grant =>
            categoryExemptions.includes(grant)
        );

        return hasCategoryExemption || false;

    } catch (error) {
        console.error(`[PT Exemption] Error checking exemption for employee ${employeeId}:`, error);
        // In case of error, default to not exempt (safer for compliance)
        return false;
    }
};

/**
 * Set category-based PT exemption for an employee
 * 
 * @param employeeId - User ID of the employee
 * @param category - Exemption category
 * @param isExempt - true to add exemption, false to remove
 */
export const setCategoryPTExemption = async (
    employeeId: string,
    category: PTExemptionCategory,
    isExempt: boolean
): Promise<void> => {
    const worker = await prisma.worker.findUnique({
        where: { userId: employeeId }
    });

    if (!worker) {
        throw new Error("Worker profile not found for this employee");
    }

    let grants = worker.accessGrants || [];
    const exemptionTag = `PT_EXEMPT_${category}`;

    if (isExempt) {
        // Add category exemption
        if (!grants.includes(exemptionTag)) {
            grants.push(exemptionTag);
        }
        // Also add general PT_EXEMPT flag
        if (!grants.includes("PT_EXEMPT")) {
            grants.push("PT_EXEMPT");
        }
    } else {
        // Remove category exemption
        grants = grants.filter(g => g !== exemptionTag);

        // Check if any other category exemptions exist
        const otherCategoryExemptions = grants.filter(g =>
            g.startsWith("PT_EXEMPT_") && g !== exemptionTag
        );

        // If no other category exemptions, remove general PT_EXEMPT flag
        if (otherCategoryExemptions.length === 0) {
            grants = grants.filter(g => g !== "PT_EXEMPT");
        }
    }

    await prisma.worker.update({
        where: { id: worker.id },
        data: { accessGrants: grants }
    });
};

/**
 * Get PT exemption status and details for an employee
 * 
 * @param employeeId - User ID of the employee
 * @returns Exemption status and categories
 */
export const getPTExemptionStatus = async (employeeId: string) => {
    const worker = await prisma.worker.findUnique({
        where: { userId: employeeId },
        select: { accessGrants: true }
    });

    if (!worker) {
        return {
            isExempt: false,
            categories: [],
            reason: null
        };
    }

    const grants = worker.accessGrants || [];
    const isExempt = grants.includes("PT_EXEMPT");

    const categories: PTExemptionCategory[] = [];
    if (grants.includes("PT_EXEMPT_SENIOR_CITIZEN")) {
        categories.push(PTExemptionCategory.SENIOR_CITIZEN);
    }
    if (grants.includes("PT_EXEMPT_DISABLED")) {
        categories.push(PTExemptionCategory.DISABLED);
    }
    if (grants.includes("PT_EXEMPT_PHYSICALLY_HANDICAPPED")) {
        categories.push(PTExemptionCategory.PHYSICALLY_HANDICAPPED);
    }

    return {
        isExempt,
        categories,
        reason: categories.length > 0 ? categories.join(", ") : (isExempt ? "Manual exemption" : null)
    };
};

/**
 * Calculate PT amount for an employee based on gross salary and state
 * This function should be called during salary processing
 * 
 * @param employeeId - User ID of the employee
 * @param grossSalary - Gross salary amount
 * @param state - State code (for state-specific PT slabs)
 * @returns PT amount to deduct (0 if exempt)
 */
export const calculatePTAmount = async (
    employeeId: string,
    grossSalary: number,
    state: string = "MH" // Default to Maharashtra
): Promise<number> => {
    // 1. Check if employee is exempt
    const isExempt = await isEmployeePTExempt(employeeId);

    if (isExempt) {
        console.log(`[PT Calculation] Employee ${employeeId} is PT exempt. Skipping PT deduction.`);
        return 0;
    }

    // 2. Calculate PT based on state slabs
    // Note: This is a simplified implementation
    // In production, PT slabs should be configurable per state
    return calculatePTByState(grossSalary, state);
};

/**
 * Calculate PT based on state-specific slabs
 * This is a helper function with hardcoded slabs for common states
 * 
 * @param grossSalary - Gross salary amount
 * @param state - State code
 * @returns PT amount
 */
const calculatePTByState = (grossSalary: number, state: string): number => {
    // Maharashtra PT Slabs (as example)
    if (state === "MH" || state === "MAHARASHTRA") {
        if (grossSalary <= 7500) return 0;
        if (grossSalary <= 10000) return 175;
        if (grossSalary <= 25000) return 200;
        return 200; // Max PT in Maharashtra
    }

    // Karnataka PT Slabs
    if (state === "KA" || state === "KARNATAKA") {
        if (grossSalary <= 15000) return 0;
        if (grossSalary <= 20000) return 150;
        return 200;
    }

    // Tamil Nadu PT Slabs
    if (state === "TN" || state === "TAMIL NADU") {
        // TN has annual PT, not monthly
        // This is simplified - actual calculation is more complex
        const annualSalary = grossSalary * 12;
        if (annualSalary <= 21000) return 0;
        if (annualSalary <= 30000) return Math.ceil(135 / 12); // ~11.25 per month
        if (annualSalary <= 45000) return Math.ceil(330 / 12); // ~27.5 per month
        if (annualSalary <= 60000) return Math.ceil(660 / 12); // ~55 per month
        if (annualSalary <= 75000) return Math.ceil(1320 / 12); // ~110 per month
        return Math.ceil(2400 / 12); // ~200 per month (max)
    }

    // West Bengal PT Slabs
    if (state === "WB" || state === "WEST BENGAL") {
        if (grossSalary <= 8500) return 0;
        if (grossSalary <= 10000) return 110;
        if (grossSalary <= 15000) return 130;
        if (grossSalary <= 25000) return 150;
        if (grossSalary <= 40000) return 160;
        return 200; // Max
    }

    // Gujarat PT Slabs
    if (state === "GJ" || state === "GUJARAT") {
        if (grossSalary <= 5999) return 0;
        if (grossSalary <= 8999) return 20;
        if (grossSalary <= 11999) return 40;
        return 60; // Max PT in Gujarat
    }

    // Default: No PT for unknown states
    console.warn(`[PT Calculation] Unknown state: ${state}. Defaulting to 0 PT.`);
    return 0;
};

