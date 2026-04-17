/**
 * Stock Group Model
 * Database operations for StockGroup entity (Inventory Masters)
 */

import prisma from '../../../config/prisma';

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new stock group
 */
export const createStockGroupModel = async (data: {
    companyId: string;
    name: string;
    alias?: string;
    underId?: string;
    shouldAddQuantities?: boolean;
    gstApplicable?: string;
    hsnSac?: string;
    hsnDescription?: string;
    taxabilityType?: string;
    gstRate?: number;
    createdBy: string;
}) => {
    return await prisma.stockGroup.create({
        data: {
            companyId: data.companyId,
            name: data.name,
            alias: data.alias,
            underId: data.underId,
            shouldAddQuantities: data.shouldAddQuantities ?? false,
            gstApplicable: data.gstApplicable || 'Applicable',
            hsnSac: data.hsnSac,
            hsnDescription: data.hsnDescription,
            taxabilityType: data.taxabilityType,
            gstRate: data.gstRate ?? 0,
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
        },
    });
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get stock group by ID
 */
export const getStockGroupByIdModel = async (groupId: string) => {
    return await prisma.stockGroup.findUnique({
        where: { id: groupId },
        include: {
            StockGroup: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    other_StockGroup: true,
                    StockItem: true,
                },
            },
        },
    });
};

/**
 * Get all stock groups for a company
 */
export const getStockGroupsByCompanyIdModel = async (companyId: string) => {
    return await prisma.stockGroup.findMany({
        where: {
            companyId,
            isActive: true,
        },
        include: {
            StockGroup: {
                select: {
                    id: true,
                    name: true,
                },
            },
            _count: {
                select: {
                    other_StockGroup: true,
                    StockItem: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
};

/**
 * Search stock groups by name or alias (typeahead)
 * Optimized for <50ms response on sidebar search
 */
export const searchStockGroupsModel = async (companyId: string, query: string) => {
    return await prisma.stockGroup.findMany({
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
            gstApplicable: true,
            hsnSac: true,
            gstRate: true,
            underId: true,
        },
        orderBy: {
            name: 'asc',
        },
        take: 20, // Limit for fast sidebar results
    });
};

/**
 * Find stock group by name (case-insensitive) within a company
 * Used for duplicate validation
 */
export const findStockGroupByNameModel = async (companyId: string, name: string) => {
    return await prisma.stockGroup.findFirst({
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
 * Update a stock group
 */
export const updateStockGroupModel = async (
    groupId: string,
    data: {
        name?: string;
        alias?: string;
        underId?: string;
        shouldAddQuantities?: boolean;
        gstApplicable?: string;
        hsnSac?: string;
        hsnDescription?: string;
        taxabilityType?: string;
        gstRate?: number;
        updatedBy: string;
    }
) => {
    return await prisma.stockGroup.update({
        where: { id: groupId },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.alias !== undefined && { alias: data.alias }),
            ...(data.underId !== undefined && { underId: data.underId }),
            ...(data.shouldAddQuantities !== undefined && { shouldAddQuantities: data.shouldAddQuantities }),
            ...(data.gstApplicable !== undefined && { gstApplicable: data.gstApplicable }),
            ...(data.hsnSac !== undefined && { hsnSac: data.hsnSac }),
            ...(data.hsnDescription !== undefined && { hsnDescription: data.hsnDescription }),
            ...(data.taxabilityType !== undefined && { taxabilityType: data.taxabilityType }),
            ...(data.gstRate !== undefined && { gstRate: data.gstRate }),
            updatedBy: data.updatedBy,
        },
    });
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Soft delete stock group (set isActive = false)
 */
export const deleteStockGroupModel = async (groupId: string) => {
    return await prisma.stockGroup.update({
        where: { id: groupId },
        data: { isActive: false },
    });
};

// ============================================
// VALIDATION
// ============================================

/**
 * Check if stock group can be deleted (no sub-groups or stock items)
 */
export const canDeleteStockGroupModel = async (
    groupId: string
): Promise<{ canDelete: boolean; reason?: string }> => {
    const group = await prisma.stockGroup.findUnique({
        where: { id: groupId },
        include: {
            _count: {
                select: {
                    other_StockGroup: true,
                    StockItem: true,
                },
            },
        },
    });

    if (!group) {
        return { canDelete: false, reason: 'Stock group not found' };
    }

    if (group._count.other_StockGroup > 0) {
        return {
            canDelete: false,
            reason: `Cannot delete stock group "${group.name}". It has ${group._count.other_StockGroup} sub-group(s).`,
        };
    }

    if (group._count.StockItem > 0) {
        return {
            canDelete: false,
            reason: `Cannot delete stock group "${group.name}". It is used by ${group._count.StockItem} stock item(s).`,
        };
    }

    return { canDelete: true };
};

/**
 * Check for circular reference when setting parent
 */
export const checkCircularReferenceModel = async (
    groupId: string,
    parentId: string
): Promise<boolean> => {
    let currentId: string | null = parentId;
    const maxDepth = 10; // Prevent infinite loops
    let depth = 0;

    while (currentId !== null && depth < maxDepth) {
        if (currentId === groupId) {
            return true; // Circular reference detected
        }

        const parent: { underId: string | null } | null = await prisma.stockGroup.findUnique({
            where: { id: currentId },
            select: { underId: true },
        });

        currentId = parent?.underId || null;
        depth++;
    }

    return false; // No circular reference
};

