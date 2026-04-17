/**
 * Unit Model
 * Database operations for Unit entity (Inventory Masters)
 */

import prisma from '../../../config/prisma';

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new unit
 */
export const createUnitModel = async (data: {
    companyId: string;
    type?: string;
    symbol: string;
    formalName: string;
    uqc?: string;
    decimalPlaces?: number;
    firstUnitId?: string;
    secondUnitId?: string;
    conversionFactor?: number;
    createdBy: string;
}) => {
    return await prisma.unit.create({
        data: {
            companyId: data.companyId,
            type: data.type || 'Simple',
            symbol: data.symbol,
            formalName: data.formalName,
            uqc: data.uqc,
            decimalPlaces: data.decimalPlaces ?? 0,
            firstUnitId: data.firstUnitId,
            secondUnitId: data.secondUnitId,
            conversionFactor: data.conversionFactor,
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
        },
        include: {
            firstUnit: { select: { id: true, symbol: true, formalName: true } },
            secondUnit: { select: { id: true, symbol: true, formalName: true } },
        },
    });
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get unit by ID
 */
export const getUnitByIdModel = async (unitId: string) => {
    return await prisma.unit.findUnique({
        where: { id: unitId },
        include: {
            firstUnit: { select: { id: true, symbol: true, formalName: true } },
            secondUnit: { select: { id: true, symbol: true, formalName: true } },
            _count: {
                select: {
                    StockItem: true,
                },
            },
        },
    });
};

/**
 * Get all units for a company
 */
export const getUnitsByCompanyIdModel = async (companyId: string) => {
    return await prisma.unit.findMany({
        where: {
            companyId,
            isActive: true,
        },
        include: {
            firstUnit: { select: { id: true, symbol: true, formalName: true } },
            secondUnit: { select: { id: true, symbol: true, formalName: true } },
            _count: {
                select: {
                    StockItem: true,
                },
            },
        },
        orderBy: [
            { type: 'asc' },  // Simple units first, then Compound
            { symbol: 'asc' },
        ],
    });
};

/**
 * Search units by symbol or formalName (typeahead)
 * Optimized for <50ms response on sidebar search
 */
export const searchUnitsModel = async (companyId: string, query: string) => {
    return await prisma.unit.findMany({
        where: {
            companyId,
            isActive: true,
            OR: [
                { symbol: { contains: query, mode: 'insensitive' } },
                { formalName: { contains: query, mode: 'insensitive' } },
            ],
        },
        select: {
            id: true,
            symbol: true,
            formalName: true,
            type: true,
            uqc: true,
            decimalPlaces: true,
            conversionFactor: true,
            firstUnit: { select: { id: true, symbol: true } },
            secondUnit: { select: { id: true, symbol: true } },
        },
        orderBy: {
            symbol: 'asc',
        },
        take: 20, // Limit for fast sidebar results
    });
};

/**
 * Find unit by symbol (case-insensitive) within a company
 * Used for duplicate validation
 */
export const findUnitBySymbolModel = async (companyId: string, symbol: string) => {
    return await prisma.unit.findFirst({
        where: {
            companyId,
            symbol: { equals: symbol, mode: 'insensitive' },
            isActive: true,
        },
    });
};

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update a unit
 */
export const updateUnitModel = async (
    unitId: string,
    data: {
        symbol?: string;
        formalName?: string;
        uqc?: string;
        decimalPlaces?: number;
        firstUnitId?: string | null;
        secondUnitId?: string | null;
        conversionFactor?: number;
        type?: string;
        updatedBy: string;
    }
) => {
    return await prisma.unit.update({
        where: { id: unitId },
        data: {
            ...(data.symbol !== undefined && { symbol: data.symbol }),
            ...(data.formalName !== undefined && { formalName: data.formalName }),
            ...(data.uqc !== undefined && { uqc: data.uqc }),
            ...(data.decimalPlaces !== undefined && { decimalPlaces: data.decimalPlaces }),
            ...(data.type !== undefined && { type: data.type }),
            ...(data.firstUnitId !== undefined && { firstUnitId: data.firstUnitId }),
            ...(data.secondUnitId !== undefined && { secondUnitId: data.secondUnitId }),
            ...(data.conversionFactor !== undefined && { conversionFactor: data.conversionFactor }),
            updatedBy: data.updatedBy,
        },
        include: {
            firstUnit: { select: { id: true, symbol: true, formalName: true } },
            secondUnit: { select: { id: true, symbol: true, formalName: true } },
        },
    });
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Soft delete unit (set isActive = false)
 */
export const deleteUnitModel = async (unitId: string) => {
    return await prisma.unit.update({
        where: { id: unitId },
        data: { isActive: false },
    });
};

// ============================================
// VALIDATION
// ============================================

/**
 * Check if unit can be deleted (no stock items using it)
 */
export const canDeleteUnitModel = async (
    unitId: string
): Promise<{ canDelete: boolean; reason?: string }> => {
    const unit = await prisma.unit.findUnique({
        where: { id: unitId },
        include: {
            _count: {
                select: {
                    StockItem: true,
                },
            },
        },
    });

    if (!unit) {
        return { canDelete: false, reason: 'Unit not found' };
    }

    if (unit._count.StockItem > 0) {
        return {
            canDelete: false,
            reason: `Cannot delete unit "${unit.symbol}". It is used by ${unit._count.StockItem} stock item(s).`,
        };
    }

    return { canDelete: true };
};

// ============================================
// COMPOUND UNIT HELPERS
// ============================================

/**
 * Convert quantity between compound unit parts
 * Example: 2.5 Boxes where 1 Box = 12 Nos → returns { firstQty: 2, secondQty: 6 }
 */
export const convertCompoundQuantity = (totalSecondary: number, conversionFactor: number) => {
    if (!conversionFactor || conversionFactor <= 0) {
        return { firstQty: 0, secondQty: totalSecondary };
    }
    const firstQty = Math.floor(totalSecondary / conversionFactor);
    const secondQty = totalSecondary % conversionFactor;
    return { firstQty, secondQty };
};

/**
 * Get simple units only (for compound unit creation dropdowns)
 */
export const getSimpleUnitsModel = async (companyId: string) => {
    return await prisma.unit.findMany({
        where: {
            companyId,
            type: 'Simple',
            isActive: true,
        },
        select: {
            id: true,
            symbol: true,
            formalName: true,
            decimalPlaces: true,
        },
        orderBy: { symbol: 'asc' },
    });
};

/**
 * Check if a unit is used as part of any compound unit
 */
export const isUnitUsedInCompound = async (unitId: string): Promise<boolean> => {
    const count = await prisma.unit.count({
        where: {
            isActive: true,
            OR: [
                { firstUnitId: unitId },
                { secondUnitId: unitId },
            ],
        },
    });
    return count > 0;
};

