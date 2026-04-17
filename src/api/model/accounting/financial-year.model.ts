/**
 * Financial Year Model
 * Database operations for Financial Year entity
 */

import prisma from '../../../config/prisma';

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new financial year
 */
export const createFinancialYearModel = async (data: {
    companyId: string;
    yearName: string;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
}) => {
    return await prisma.financialYear.create({
        data: {
            companyId: data.companyId,
            yearName: data.yearName,
            startDate: data.startDate,
            endDate: data.endDate,
            isActive: data.isActive ?? true,
            isLocked: false,
        },
    });
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get financial year by ID
 */
export const getFinancialYearByIdModel = async (id: string) => {
    return await prisma.financialYear.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    vouchers: true,
                },
            },
        },
    });
};

/**
 * Get all financial years for a company
 */
export const getFinancialYearsByCompanyIdModel = async (companyId: string) => {
    return await prisma.financialYear.findMany({
        where: { companyId },
        include: {
            _count: {
                select: {
                    vouchers: true,
                },
            },
        },
        orderBy: {
            startDate: 'desc',
        },
    });
};

/**
 * Get active financial year for a company
 */
export const getActiveFinancialYearModel = async (companyId: string) => {
    return await prisma.financialYear.findFirst({
        where: {
            companyId,
            isActive: true,
        },
    });
};

/**
 * Check if a date falls within a financial year
 */
export const getFinancialYearByDateModel = async (
    companyId: string,
    date: Date
) => {
    return await prisma.financialYear.findFirst({
        where: {
            companyId,
            startDate: { lte: date },
            endDate: { gte: date },
        },
    });
};

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Set a financial year as active (and deactivate others)
 */
export const setActiveFinancialYearModel = async (
    companyId: string,
    financialYearId: string
) => {
    // First, deactivate all financial years for this company
    await prisma.financialYear.updateMany({
        where: { companyId },
        data: { isActive: false },
    });

    // Then, activate the selected one
    return await prisma.financialYear.update({
        where: { id: financialYearId },
        data: { isActive: true },
    });
};

/**
 * Lock a financial year
 */
export const lockFinancialYearModel = async (
    financialYearId: string,
    lockedBy: string
) => {
    return await prisma.financialYear.update({
        where: { id: financialYearId },
        data: {
            isLocked: true,
            lockedAt: new Date(),
            lockedBy,
        },
    });
};

/**
 * Unlock a financial year
 */
export const unlockFinancialYearModel = async (financialYearId: string) => {
    return await prisma.financialYear.update({
        where: { id: financialYearId },
        data: {
            isLocked: false,
            lockedAt: null,
            lockedBy: null,
        },
    });
};

// ============================================
// VALIDATION
// ============================================

/**
 * Check if a financial year is locked
 */
export const isFinancialYearLockedModel = async (
    financialYearId: string
): Promise<boolean> => {
    const fy = await prisma.financialYear.findUnique({
        where: { id: financialYearId },
        select: { isLocked: true },
    });

    return fy?.isLocked ?? true;
};

/**
 * Check if financial year has any vouchers
 */
export const hasVouchersInFinancialYearModel = async (
    financialYearId: string
): Promise<boolean> => {
    const count = await prisma.voucher.count({
        where: { financialYearId },
    });

    return count > 0;
};

