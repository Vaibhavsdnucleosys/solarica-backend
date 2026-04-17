/**
 * Stock Group Service
 * Business logic for managing Stock Groups (Inventory Masters)
 */

import {
    createStockGroupModel,
    getStockGroupByIdModel,
    getStockGroupsByCompanyIdModel,
    searchStockGroupsModel,
    findStockGroupByNameModel,
    updateStockGroupModel,
    deleteStockGroupModel,
    canDeleteStockGroupModel,
    checkCircularReferenceModel,
} from '../../api/model/inventory';
import { validateCompanyAccessService } from '../accounting/company.service';
import { INVENTORY_ERRORS } from '../../utils/inventory/constants';

/**
 * Get all stock groups for a company
 */
export const getStockGroupsService = async (companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await getStockGroupsByCompanyIdModel(companyId);
};

/**
 * Get a single stock group by ID
 */
export const getStockGroupByIdService = async (groupId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    const group = await getStockGroupByIdModel(groupId);
    if (!group) {
        throw new Error(INVENTORY_ERRORS.GROUP_NOT_FOUND);
    }

    // Ensure group belongs to the company
    if (group.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return group;
};

/**
 * Search stock groups (typeahead for sidebar)
 */
export const searchStockGroupsService = async (companyId: string, userId: string, query: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    return await searchStockGroupsModel(companyId, query);
};

/**
 * Validate if a name is available (duplicate check)
 */
export const validateNameService = async (
    companyId: string,
    userId: string,
    name: string,
    excludeGroupId?: string
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    const existing = await findStockGroupByNameModel(companyId, name);

    // If found and it's not the same group being edited, it's a duplicate
    if (existing && existing.id !== excludeGroupId) {
        return { available: false, message: `Stock group "${name}" already exists.` };
    }

    return { available: true, message: `Stock group name "${name}" is available.` };
};

/**
 * Create a new stock group
 */
export const createStockGroupService = async (
    companyId: string,
    userId: string,
    data: {
        name: string;
        alias?: string;
        underId?: string;
        shouldAddQuantities?: boolean;
        gstApplicable?: string;
        hsnSac?: string;
        hsnDescription?: string;
        taxabilityType?: string;
        gstRate?: number;
    }
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Validate required fields
    if (!data.name || !data.name.trim()) {
        throw new Error(INVENTORY_ERRORS.GROUP_NAME_REQUIRED);
    }

    // Check for duplicate name (case-insensitive)
    const existingGroup = await findStockGroupByNameModel(companyId, data.name.trim());
    if (existingGroup) {
        throw new Error(INVENTORY_ERRORS.GROUP_NAME_DUPLICATE);
    }

    // If underId is provided, check for circular reference
    if (data.underId) {
        // For new groups, we can't have circular reference yet
        // But we should verify the parent exists and is active
        const parentGroup = await getStockGroupByIdModel(data.underId);
        if (!parentGroup) {
            throw new Error('Parent stock group not found.');
        }
        if (parentGroup.companyId !== companyId) {
            throw new Error('Parent stock group must belong to the same company.');
        }
    }

    return await createStockGroupModel({
        companyId,
        name: data.name.trim(),
        alias: data.alias?.trim(),
        underId: data.underId,
        shouldAddQuantities: data.shouldAddQuantities,
        gstApplicable: data.gstApplicable,
        hsnSac: data.hsnSac?.trim(),
        hsnDescription: data.hsnDescription?.trim(),
        taxabilityType: data.taxabilityType,
        gstRate: data.gstRate,
        createdBy: userId,
    });
};

/**
 * Update an existing stock group
 */
export const updateStockGroupService = async (
    groupId: string,
    companyId: string,
    userId: string,
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
    }
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Ensure group exists and belongs to this company
    const existingGroup = await getStockGroupByIdModel(groupId);
    if (!existingGroup) {
        throw new Error(INVENTORY_ERRORS.GROUP_NOT_FOUND);
    }
    if (existingGroup.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // If name is being changed, check for duplicate
    if (data.name && data.name.trim() !== existingGroup.name) {
        const duplicate = await findStockGroupByNameModel(companyId, data.name.trim());
        if (duplicate && duplicate.id !== groupId) {
            throw new Error(INVENTORY_ERRORS.GROUP_NAME_DUPLICATE);
        }
    }

    // If underId is being changed, check for circular reference
    if (data.underId !== undefined && data.underId !== existingGroup.underId) {
        if (data.underId) {
            // Check if new parent would create circular reference
            const isCircular = await checkCircularReferenceModel(groupId, data.underId);
            if (isCircular) {
                throw new Error(INVENTORY_ERRORS.GROUP_CIRCULAR_REFERENCE);
            }

            // Verify parent exists and belongs to same company
            const parentGroup = await getStockGroupByIdModel(data.underId);
            if (!parentGroup) {
                throw new Error('Parent stock group not found.');
            }
            if (parentGroup.companyId !== companyId) {
                throw new Error('Parent stock group must belong to the same company.');
            }
        }
    }

    return await updateStockGroupModel(groupId, {
        name: data.name?.trim(),
        alias: data.alias?.trim(),
        underId: data.underId,
        shouldAddQuantities: data.shouldAddQuantities,
        gstApplicable: data.gstApplicable,
        hsnSac: data.hsnSac?.trim(),
        hsnDescription: data.hsnDescription?.trim(),
        taxabilityType: data.taxabilityType,
        gstRate: data.gstRate,
        updatedBy: userId,
    });
};

/**
 * Delete a stock group (soft delete)
 */
export const deleteStockGroupService = async (groupId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Ensure group exists and belongs to this company
    const existingGroup = await getStockGroupByIdModel(groupId);
    if (!existingGroup) {
        throw new Error(INVENTORY_ERRORS.GROUP_NOT_FOUND);
    }
    if (existingGroup.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);
    }

    // Business validation: can't delete if has sub-groups or stock items
    const { canDelete, reason } = await canDeleteStockGroupModel(groupId);
    if (!canDelete) {
        throw new Error(reason || INVENTORY_ERRORS.GROUP_HAS_ITEMS);
    }

    return await deleteStockGroupModel(groupId);
};

