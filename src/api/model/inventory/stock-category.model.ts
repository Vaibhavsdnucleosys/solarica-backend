/**
 * Stock Category Model
 * Database operations for StockCategory entity (Inventory Masters)
 * 
 * NOTE: Uses raw queries for relations since Prisma client may not have
 * been regenerated with the StockCategory model's relations yet.
 */

import prisma from '../../../config/prisma';

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new stock category
 */
export const createStockCategoryModel = async (data: {
    companyId: string;
    name: string;
    alias?: string;
    underId?: string;
    createdBy: string;
}) => {
    return await prisma.stockCategory.create({
        data: {
            companyId: data.companyId,
            name: data.name,
            alias: data.alias,
            underId: data.underId,
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
        },
    });
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get stock category by ID (with parent info and counts)
 */
export const getStockCategoryByIdModel = async (categoryId: string) => {
    const category = await prisma.stockCategory.findUnique({
        where: { id: categoryId },
    });

    if (!category) return null;

    // Fetch parent info manually if underId exists
    let parentInfo: { id: string; name: string } | null = null;
    if (category.underId) {
        const parent = await prisma.stockCategory.findUnique({
            where: { id: category.underId },
            select: { id: true, name: true },
        });
        parentInfo = parent;
    }

    // Count children and stock items
    const [childrenCount, stockItemsCount] = await Promise.all([
        prisma.stockCategory.count({ where: { underId: categoryId, isActive: true } }),
        prisma.stockItem.count({ where: { categoryId: categoryId, isActive: true } }),
    ]);

    return {
        ...category,
        parent: parentInfo,
        _count: { children: childrenCount, stockItems: stockItemsCount },
    };
};

/**
 * Get all stock categories for a company
 */
export const getStockCategoriesByCompanyIdModel = async (companyId: string) => {
    const categories = await prisma.stockCategory.findMany({
        where: {
            companyId,
            isActive: true,
        },
        orderBy: {
            name: 'asc',
        },
    });

    // Fetch parent info for all categories that have underId
    const parentIds = [...new Set(categories.filter(c => c.underId).map(c => c.underId!))];
    const parents = parentIds.length > 0
        ? await prisma.stockCategory.findMany({
            where: { id: { in: parentIds } },
            select: { id: true, name: true },
        })
        : [];

    const parentMap = new Map(parents.map(p => [p.id, p]));

    return categories.map(cat => ({
        ...cat,
        parent: cat.underId ? parentMap.get(cat.underId) || null : null,
    }));
};

/**
 * Search stock categories by name or alias (typeahead)
 */
export const searchStockCategoriesModel = async (companyId: string, query: string) => {
    return await prisma.stockCategory.findMany({
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
            underId: true,
        },
        orderBy: {
            name: 'asc',
        },
        take: 20,
    });
};

/**
 * Find stock category by name (case-insensitive) within a company
 * Used for duplicate validation
 */
export const findStockCategoryByNameModel = async (companyId: string, name: string) => {
    return await prisma.stockCategory.findFirst({
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
 * Update a stock category
 */
export const updateStockCategoryModel = async (
    categoryId: string,
    data: {
        name?: string;
        alias?: string;
        underId?: string;
        updatedBy: string;
    }
) => {
    return await prisma.stockCategory.update({
        where: { id: categoryId },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.alias !== undefined && { alias: data.alias }),
            ...(data.underId !== undefined && { underId: data.underId }),
            updatedBy: data.updatedBy,
        },
    });
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Soft delete stock category (set isActive = false)
 */
export const deleteStockCategoryModel = async (categoryId: string) => {
    return await prisma.stockCategory.update({
        where: { id: categoryId },
        data: { isActive: false },
    });
};

// ============================================
// VALIDATION
// ============================================

/**
 * Check if stock category can be deleted (no sub-categories or stock items)
 */
export const canDeleteStockCategoryModel = async (
    categoryId: string
): Promise<{ canDelete: boolean; reason?: string }> => {
    const category = await prisma.stockCategory.findUnique({
        where: { id: categoryId },
    });

    if (!category) {
        return { canDelete: false, reason: 'Stock category not found' };
    }

    const [childrenCount, stockItemsCount] = await Promise.all([
        prisma.stockCategory.count({ where: { underId: categoryId, isActive: true } }),
        prisma.stockItem.count({ where: { categoryId: categoryId, isActive: true } }),
    ]);

    if (childrenCount > 0) {
        return {
            canDelete: false,
            reason: `Cannot delete stock category "${category.name}". It has ${childrenCount} sub-category(ies).`,
        };
    }

    if (stockItemsCount > 0) {
        return {
            canDelete: false,
            reason: `Cannot delete stock category "${category.name}". It is used by ${stockItemsCount} stock item(s).`,
        };
    }

    return { canDelete: true };
};

/**
 * Check for circular reference when setting parent
 */
export const checkCategoryCircularReferenceModel = async (
    categoryId: string,
    parentId: string
): Promise<boolean> => {
    let currentId: string | null = parentId;
    const maxDepth = 10;
    let depth = 0;

    while (currentId !== null && depth < maxDepth) {
        if (currentId === categoryId) {
            return true; // Circular reference detected
        }

        const parent: { underId: string | null } | null = await prisma.stockCategory.findUnique({
            where: { id: currentId },
            select: { underId: true },
        });

        currentId = parent?.underId || null;
        depth++;
    }

    return false; // No circular reference
};

