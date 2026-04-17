/**
 * Stock Item Model
 * Database operations for Stock Item entity
 */

import prisma from '../../../config/prisma';

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new stock item
 */
export const createStockItemModel = async (data: {
    companyId: string;
    name: string;
    alias?: string;
    groupId?: string;
    categoryId?: string;
    unitId?: string;
    gstApplicable?: string;
    hsnSource?: string;
    hsnSac?: string;
    hsnDescription?: string;
    gstRateSource?: string;
    taxabilityType?: string;
    gstRate?: number;
    typeOfSupply?: string;
    rateOfDuty?: number;
    openingQty?: number;
    openingRate?: number;
    openingValue?: number;
    createdBy?: string;
}) => {
    return await prisma.stockItem.create({
        data: {
            ...data,
            closingQty: data.openingQty || 0,
            closingValue: data.openingValue || 0,
            updatedBy: data.createdBy,
        },
        include: {
            StockGroup: true,
            StockCategory: true,
            Unit: true,
        }
    });
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get stock item by ID
 */
export const getStockItemByIdModel = async (itemId: string) => {
    return await prisma.stockItem.findUnique({
        where: { id: itemId },
        include: {
            StockGroup: true,
            StockCategory: true,
            Unit: true,
        },
    });
};

/**
 * Get all stock items for a company
 */
export const getStockItemsByCompanyIdModel = async (companyId: string) => {
    return await prisma.stockItem.findMany({
        where: {
            companyId,
            isActive: true,
        },
        include: {
            StockGroup: {
                select: { name: true }
            },
            Unit: {
                select: { symbol: true }
            }
        },
        orderBy: {
            name: 'asc',
        },
    });
};

/**
 * Search stock items (optimized for sidebar)
 */
export const searchStockItemsModel = async (companyId: string, query: string) => {
    return await prisma.stockItem.findMany({
        where: {
            companyId,
            isActive: true,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { alias: { contains: query, mode: 'insensitive' } },
            ],
        },
        select: {
            id: true,
            name: true,
            alias: true,
            closingQty: true,
            Unit: {
                select: { symbol: true }
            }
        },
        orderBy: {
            name: 'asc',
        },
        take: 20,
    });
};

/**
 * Check if name exists
 */
export const findItemByNameModel = async (companyId: string, name: string) => {
    return await prisma.stockItem.findFirst({
        where: {
            companyId,
            name: { equals: name, mode: 'insensitive' },
            isActive: true,
        },
    });
};

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update stock item
 */
export const updateStockItemModel = async (
    itemId: string,
    data: any
) => {
    return await prisma.stockItem.update({
        where: { id: itemId },
        data: {
            ...data,
            updatedAt: new Date(),
        },
    });
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Soft delete item
 */
export const deleteStockItemModel = async (itemId: string) => {
    return await prisma.stockItem.update({
        where: { id: itemId },
        data: { isActive: false },
    });
};

/**
 * Check if item can be deleted (mock for now, usually checks transactions)
 */
export const canDeleteItemModel = async (itemId: string) => {
    // In a full implementation, check if this item appears in any VoucherItem or StockLedger
    // For now, allow deletion if found
    const item = await prisma.stockItem.findUnique({
        where: { id: itemId },
    });

    // Future: const transactionCount = await prisma.voucherItem.count({ where: { itemId } });

    return { canDelete: !!item, reason: item ? null : "Item not found" };
};

