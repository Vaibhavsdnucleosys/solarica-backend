/**
 * Godown Model
 * Database operations for Godown entity (Warehouse/Location)
 */

import prisma from '../../../config/prisma';

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new godown
 */
export const createGodownModel = async (data: {
    companyId: string;
    name: string;
    alias?: string;
    underId?: string;
    address?: string;
    contactName?: string;
    contactPhone?: string;
    isDefault?: boolean;
    createdBy: string;
}) => {
    return await prisma.godown.create({
        data: {
            companyId: data.companyId,
            name: data.name,
            alias: data.alias,
            underId: data.underId,
            address: data.address,
            contactName: data.contactName,
            contactPhone: data.contactPhone,
            isDefault: data.isDefault ?? false,
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
        },
    });
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get godown by ID
 */
export const getGodownByIdModel = async (godownId: string) => {
    return await prisma.godown.findUnique({
        where: { id: godownId },
        include: {
            Godown: {
                select: { id: true, name: true },
            },
            _count: {
                select: {
                    other_Godown: true,
                    GodownStock: true,
                },
            },
        },
    });
};

/**
 * Get all godowns for a company (flat list)
 */
export const getGodownsByCompanyIdModel = async (companyId: string) => {
    return await prisma.godown.findMany({
        where: {
            companyId,
            isActive: true,
        },
        include: {
            Godown: {
                select: { id: true, name: true },
            },
            _count: {
                select: {
                    other_Godown: true,
                    GodownStock: true,
                },
            },
        },
        orderBy: [
            { isDefault: 'desc' },
            { name: 'asc' },
        ],
    });
};

/**
 * Get godown hierarchy (nested tree)
 */
export const getGodownHierarchyModel = async (companyId: string) => {
    const allGodowns = await prisma.godown.findMany({
        where: {
            companyId,
            isActive: true,
        },
        include: {
            _count: {
                select: {
                    GodownStock: true,
                },
            },
        },
        orderBy: { name: 'asc' },
    });

    // Build hierarchy (2-pass algorithm)
    const godownMap = new Map();
    const rootGodowns: any[] = [];

    // First pass: create map
    allGodowns.forEach((g) => {
        godownMap.set(g.id, { ...g, children: [] });
    });

    // Second pass: build tree
    allGodowns.forEach((g) => {
        if (g.underId) {
            const parent = godownMap.get(g.underId);
            if (parent) {
                parent.children.push(godownMap.get(g.id));
            }
        } else {
            rootGodowns.push(godownMap.get(g.id));
        }
    });

    return rootGodowns;
};

/**
 * Search godowns by name or alias (typeahead)
 */
export const searchGodownsModel = async (companyId: string, query: string) => {
    return await prisma.godown.findMany({
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
            isDefault: true,
            underId: true,
        },
        orderBy: { name: 'asc' },
        take: 20,
    });
};

/**
 * Find godown by name (case-insensitive) within a company
 */
export const findGodownByNameModel = async (companyId: string, name: string) => {
    return await prisma.godown.findFirst({
        where: {
            companyId,
            name: { equals: name, mode: 'insensitive' },
            isActive: true,
        },
    });
};

/**
 * Get the default godown ("Main Location") for a company
 */
export const getDefaultGodownModel = async (companyId: string) => {
    return await prisma.godown.findFirst({
        where: {
            companyId,
            isDefault: true,
            isActive: true,
        },
    });
};

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update a godown
 */
export const updateGodownModel = async (
    godownId: string,
    data: {
        name?: string;
        alias?: string;
        underId?: string | null;
        address?: string;
        contactName?: string;
        contactPhone?: string;
        updatedBy: string;
    }
) => {
    return await prisma.godown.update({
        where: { id: godownId },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.alias !== undefined && { alias: data.alias }),
            ...(data.underId !== undefined && { underId: data.underId }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.contactName !== undefined && { contactName: data.contactName }),
            ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
            updatedBy: data.updatedBy,
        },
    });
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Soft delete godown
 */
export const deleteGodownModel = async (godownId: string) => {
    return await prisma.godown.update({
        where: { id: godownId },
        data: { isActive: false },
    });
};

/**
 * Check if godown can be deleted
 */
export const canDeleteGodownModel = async (
    godownId: string
): Promise<{ canDelete: boolean; reason?: string }> => {
    const godown = await prisma.godown.findUnique({
        where: { id: godownId },
        include: {
            _count: {
                select: {
                    other_Godown: true,
                    GodownStock: true,
                },
            },
        },
    });

    if (!godown) {
        return { canDelete: false, reason: 'Godown not found' };
    }

    if (godown.isDefault) {
        return { canDelete: false, reason: 'Cannot delete the default godown "Main Location".' };
    }

    if (godown._count.other_Godown > 0) {
        return {
            canDelete: false,
            reason: `Cannot delete godown "${godown.name}". It has ${godown._count.other_Godown} sub-godown(s).`,
        };
    }

    // Check if godown has stock with quantity > 0
    const stockWithQty = await prisma.godownStock.count({
        where: {
            godownId,
            quantity: { gt: 0 },
        },
    });

    if (stockWithQty > 0) {
        return {
            canDelete: false,
            reason: `Cannot delete godown "${godown.name}". It currently holds ${stockWithQty} stock item(s).`,
        };
    }

    return { canDelete: true };
};

// ============================================
// VALIDATION
// ============================================

/**
 * Check for circular reference when setting parent
 */
export const checkGodownCircularRefModel = async (
    godownId: string,
    parentId: string
): Promise<boolean> => {
    let currentId: string | null = parentId;
    const maxDepth = 10;
    let depth = 0;

    while (currentId !== null && depth < maxDepth) {
        if (currentId === godownId) {
            return true; // Circular reference detected
        }

        const parent: { underId: string | null } | null = await prisma.godown.findUnique({
            where: { id: currentId },
            select: { underId: true },
        });

        currentId = parent?.underId ?? null;
        depth++;
    }

    return false;
};

