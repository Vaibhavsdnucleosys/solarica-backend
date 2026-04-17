/**
 * Account Group Model
 * Database operations for Account Group entity (Chart of Accounts)
 */

import prisma from '../../../config/prisma';
import { AccountNature, GroupType } from '@prisma/client';

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Create a new account group
 */
export const createAccountGroupModel = async (data: {
    companyId: string;
    name: string;
    code?: string;
    parentId?: string;
    groupType?: GroupType;
    nature: AccountNature;
    affectsGrossProfit?: boolean;
    level?: number;
    isSystem?: boolean;
    createdBy: string;
}) => {
    return await prisma.accountGroup.create({
        data: {
            companyId: data.companyId,
            name: data.name,
            code: data.code,
            parentId: data.parentId,
            groupType: data.groupType || 'CUSTOM',
            nature: data.nature,
            affectsGrossProfit: data.affectsGrossProfit || false,
            level: data.level || 0,
            isSystem: data.isSystem || false,
            isActive: true,
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
        },
        include: {
            parent: true,
        },
    });
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get account group by ID
 */
export const getAccountGroupByIdModel = async (groupId: string) => {
    return await prisma.accountGroup.findUnique({
        where: { id: groupId },
        include: {
            parent: true,
            children: true,
            _count: {
                select: {
                    ledgers: true,
                    children: true,
                },
            },
        },
    });
};

/**
 * Get all account groups for a company
 */
export const getAccountGroupsByCompanyIdModel = async (companyId: string) => {
    return await prisma.accountGroup.findMany({
        where: {
            companyId,
            isActive: true,
        },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                },
            },
            ledgers: {
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    openingBalance: true,
                    openingBalanceType: true,
                    currentBalance: true,
                    currentBalanceType: true,
                    isCashAccount: true,
                    isBankAccount: true,
                    isPartyAccount: true
                },
            },
            _count: {
                select: {
                    children: true,
                },
            },
        },
        orderBy: [
            { level: 'asc' },
            { name: 'asc' },
        ],
    });
};

/**
 * Get primary groups (Level 0)
 */
export const getPrimaryGroupsModel = async (companyId: string) => {
    return await prisma.accountGroup.findMany({
        where: {
            companyId,
            groupType: 'PRIMARY',
            isActive: true,
        },
        orderBy: {
            name: 'asc',
        },
    });
};

/**
 * Get child groups of a parent
 */
export const getChildGroupsModel = async (parentId: string) => {
    return await prisma.accountGroup.findMany({
        where: {
            parentId,
            isActive: true,
        },
        include: {
            _count: {
                select: {
                    ledgers: true,
                    children: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
};

/**
 * Get groups by nature (for reporting)
 */
export const getGroupsByNatureModel = async (
    companyId: string,
    nature: AccountNature
) => {
    return await prisma.accountGroup.findMany({
        where: {
            companyId,
            nature,
            isActive: true,
        },
        include: {
            ledgers: {
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    currentBalance: true,
                    currentBalanceType: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
    });
};

/**
 * Get hierarchical group structure
 */
export const getGroupHierarchyModel = async (companyId: string) => {
    // Get all groups
    const allGroups = await prisma.accountGroup.findMany({
        where: {
            companyId,
            isActive: true,
        },
        include: {
            ledgers: {
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    openingBalance: true,
                    openingBalanceType: true,
                    currentBalance: true,
                    currentBalanceType: true,
                    isCashAccount: true,
                    isBankAccount: true,
                    isPartyAccount: true,
                    address: true,
                    phone: true,
                    email: true,
                    contactPerson: true,
                    gstin: true,
                    pan: true,
                    bankName: true,
                    accountNumber: true,
                    ifscCode: true,
                    branch: true
                },
            },
        },
        orderBy: [
            { level: 'asc' },
            { name: 'asc' },
        ],
    });

    // Build hierarchy
    const groupMap = new Map();
    const rootGroups: any[] = [];

    // First pass: create map
    allGroups.forEach((group) => {
        groupMap.set(group.id, { ...group, children: [] });
    });

    // Second pass: build tree
    allGroups.forEach((group) => {
        if (group.parentId) {
            const parent = groupMap.get(group.parentId);
            if (parent) {
                parent.children.push(groupMap.get(group.id));
            }
        } else {
            rootGroups.push(groupMap.get(group.id));
        }
    });

    return rootGroups;
};

/**
 * Find group by name in a company
 */
export const findGroupByNameModel = async (companyId: string, name: string) => {
    return await prisma.accountGroup.findFirst({
        where: {
            companyId,
            name,
            isActive: true,
        },
    });
};

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update account group
 */
export const updateAccountGroupModel = async (
    groupId: string,
    data: {
        name?: string;
        code?: string;
        parentId?: string;
        affectsGrossProfit?: boolean;
        updatedBy: string;
    }
) => {
    return await prisma.accountGroup.update({
        where: { id: groupId },
        data: {
            ...data,
            updatedBy: data.updatedBy,
        },
    });
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Soft delete account group (set isActive = false)
 */
export const deleteAccountGroupModel = async (groupId: string) => {
    return await prisma.accountGroup.update({
        where: { id: groupId },
        data: { isActive: false },
    });
};

// ============================================
// VALIDATION
// ============================================

/**
 * Check if group can be deleted
 */
export const canDeleteGroupModel = async (
    groupId: string
): Promise<{ canDelete: boolean; reason?: string }> => {
    const group = await prisma.accountGroup.findUnique({
        where: { id: groupId },
        include: {
            _count: {
                select: {
                    ledgers: true,
                    children: true,
                },
            },
        },
    });

    if (!group) {
        return { canDelete: false, reason: 'Group not found' };
    }

    if (group.isSystem) {
        return { canDelete: false, reason: 'System groups cannot be deleted' };
    }

    if (group._count.children > 0) {
        return { canDelete: false, reason: 'Group has sub-groups' };
    }

    if (group._count.ledgers > 0) {
        return { canDelete: false, reason: 'Group has ledgers' };
    }

    return { canDelete: true };
};

