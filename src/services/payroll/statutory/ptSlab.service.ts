import prisma from "../../../config/prisma";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Create a new PT slab
 */
export const createPTSlab = async (data: {
    state: string;
    salaryFrom: number;
    salaryTo: number;
    monthlyAmount: number;
    isFebruaryOverride?: boolean;
}) => {
    const { state, salaryFrom, salaryTo, monthlyAmount, isFebruaryOverride = false } = data;

    // 1. Basic Validation
    if (salaryFrom >= salaryTo) {
        throw new Error("Salary From must be less than Salary To");
    }
    if (monthlyAmount < 0) {
        throw new Error("Monthly Amount cannot be negative");
    }

    // 2. Overlap Validation
    // Check if any existing slab for the same state and override flag intersects this range
    const overlappingSlab = await prisma.pTSlab.findFirst({
        where: {
            state,
            isFebruaryOverride,
            OR: [
                {
                    // Case 1: Existing slab starts inside new slab
                    salaryFrom: { gte: salaryFrom, lt: salaryTo }
                },
                {
                    // Case 2: Existing slab ends inside new slab
                    salaryTo: { gt: salaryFrom, lte: salaryTo }
                },
                {
                    // Case 3: Existing slab completely encloses new slab
                    salaryFrom: { lte: salaryFrom },
                    salaryTo: { gte: salaryTo }
                }
            ]
        }
    });

    if (overlappingSlab) {
        throw new Error(`Range [${salaryFrom} - ${salaryTo}] overlaps with existing slab [${overlappingSlab.salaryFrom} - ${overlappingSlab.salaryTo}] for state ${state}`);
    }

    // 3. Create
    return await prisma.pTSlab.create({
        data: {
            state,
            salaryFrom,
            salaryTo,
            monthlyAmount,
            isFebruaryOverride
        }
    });
};

/**
 * List all slabs for a state, sorted by salaryFrom
 */
export const getPTSlabsByState = async (state: string) => {
    return await prisma.pTSlab.findMany({
        where: { state },
        orderBy: { salaryFrom: "asc" }
    });
};

/**
 * Update an existing PT slab
 */
export const updatePTSlab = async (id: string, data: {
    salaryFrom?: number;
    salaryTo?: number;
    monthlyAmount?: number;
    isFebruaryOverride?: boolean;
}) => {
    const existing = await prisma.pTSlab.findUnique({ where: { id } });
    if (!existing) {
        throw new Error("PT Slab not found");
    }

    const state = existing.state;
    const salaryFrom = data.salaryFrom !== undefined ? data.salaryFrom : Number(existing.salaryFrom);
    const salaryTo = data.salaryTo !== undefined ? data.salaryTo : Number(existing.salaryTo);
    const isFebruaryOverride = data.isFebruaryOverride !== undefined ? data.isFebruaryOverride : existing.isFebruaryOverride;
    const monthlyAmount = data.monthlyAmount !== undefined ? data.monthlyAmount : Number(existing.monthlyAmount);

    // 1. Basic Validation
    if (salaryFrom >= salaryTo) {
        throw new Error("Salary From must be less than Salary To");
    }
    if (monthlyAmount < 0) {
        throw new Error("Monthly Amount cannot be negative");
    }

    // 2. Overlap Validation (excluding self)
    const overlappingSlab = await prisma.pTSlab.findFirst({
        where: {
            id: { not: id },
            state,
            isFebruaryOverride,
            OR: [
                {
                    salaryFrom: { gte: salaryFrom, lt: salaryTo }
                },
                {
                    salaryTo: { gt: salaryFrom, lte: salaryTo }
                },
                {
                    salaryFrom: { lte: salaryFrom },
                    salaryTo: { gte: salaryTo }
                }
            ]
        }
    });

    if (overlappingSlab) {
        throw new Error(`Updated range [${salaryFrom} - ${salaryTo}] overlaps with existing slab [${overlappingSlab.salaryFrom} - ${overlappingSlab.salaryTo}] for state ${state}`);
    }

    // 3. Update
    return await prisma.pTSlab.update({
        where: { id },
        data: {
            salaryFrom,
            salaryTo,
            monthlyAmount,
            isFebruaryOverride
        }
    });
};

/**
 * Delete a PT slab
 */
export const deletePTSlab = async (id: string) => {
    const existing = await prisma.pTSlab.findUnique({ where: { id } });
    if (!existing) {
        throw new Error("PT Slab not found");
    }

    return await prisma.pTSlab.delete({
        where: { id }
    });
};

