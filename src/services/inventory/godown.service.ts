/**
 * Godown Service
 * Business logic for Godown (Warehouse/Location) management and stock tracking
 */

import {
    createGodownModel,
    getGodownByIdModel,
    getGodownsByCompanyIdModel,
    getGodownHierarchyModel,
    searchGodownsModel,
    findGodownByNameModel,
    getDefaultGodownModel,
    updateGodownModel,
    deleteGodownModel,
    canDeleteGodownModel,
    checkGodownCircularRefModel,
} from '../../api/model/inventory/godown.model';
import {
    getStockByGodownModel,
    getItemDistributionModel,
    getGodownStockSummaryModel,
    transferStockModel,
} from '../../api/model/inventory/godown-stock.model';
import { validateCompanyAccessService } from '../accounting/company.service';
import { INVENTORY_ERRORS } from '../../utils/inventory/constants';

// ============================================
// GODOWN MASTER CRUD
// ============================================

/**
 * Get all godowns (flat list)
 */
export const getGodownsService = async (companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    return await getGodownsByCompanyIdModel(companyId);
};

/**
 * Get godown hierarchy (nested tree)
 */
export const getGodownHierarchyService = async (companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    return await getGodownHierarchyModel(companyId);
};

/**
 * Get single godown by ID
 */
export const getGodownByIdService = async (godownId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    const godown = await getGodownByIdModel(godownId);
    if (!godown || godown.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.GODOWN_NOT_FOUND);
    }

    return godown;
};

/**
 * Search godowns (typeahead)
 */
export const searchGodownsService = async (companyId: string, userId: string, query: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    return await searchGodownsModel(companyId, query);
};

/**
 * Create a new godown
 */
export const createGodownService = async (
    companyId: string,
    userId: string,
    data: {
        name: string;
        alias?: string;
        underId?: string;
        address?: string;
        contactName?: string;
        contactPhone?: string;
    }
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    if (!data.name?.trim()) throw new Error(INVENTORY_ERRORS.GODOWN_NAME_REQUIRED);

    // Duplicate name check
    const existing = await findGodownByNameModel(companyId, data.name.trim());
    if (existing) throw new Error(INVENTORY_ERRORS.GODOWN_NAME_DUPLICATE);

    // Validate parent exists and belongs to company
    if (data.underId) {
        const parent = await getGodownByIdModel(data.underId);
        if (!parent || parent.companyId !== companyId) {
            throw new Error(INVENTORY_ERRORS.GODOWN_NOT_FOUND);
        }
    }

    return await createGodownModel({
        companyId,
        name: data.name.trim(),
        alias: data.alias?.trim(),
        underId: data.underId,
        address: data.address,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        createdBy: userId,
    });
};

/**
 * Update a godown
 */
export const updateGodownService = async (
    godownId: string,
    companyId: string,
    userId: string,
    data: {
        name?: string;
        alias?: string;
        underId?: string | null;
        address?: string;
        contactName?: string;
        contactPhone?: string;
    }
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    const existing = await getGodownByIdModel(godownId);
    if (!existing || existing.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.GODOWN_NOT_FOUND);
    }

    // Prevent renaming default godown
    if (existing.isDefault && data.name && data.name.trim() !== existing.name) {
        throw new Error(INVENTORY_ERRORS.GODOWN_IS_DEFAULT);
    }

    // Duplicate name check (if name is changing)
    if (data.name && data.name.trim() !== existing.name) {
        const duplicate = await findGodownByNameModel(companyId, data.name.trim());
        if (duplicate) throw new Error(INVENTORY_ERRORS.GODOWN_NAME_DUPLICATE);
    }

    // Circular reference check (if parent is changing)
    if (data.underId && data.underId !== existing.underId) {
        const isCircular = await checkGodownCircularRefModel(godownId, data.underId);
        if (isCircular) throw new Error(INVENTORY_ERRORS.GODOWN_CIRCULAR_REFERENCE);
    }

    return await updateGodownModel(godownId, {
        name: data.name?.trim(),
        alias: data.alias?.trim(),
        underId: data.underId,
        address: data.address,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        updatedBy: userId,
    });
};

/**
 * Delete a godown (soft delete)
 */
export const deleteGodownService = async (godownId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    const existing = await getGodownByIdModel(godownId);
    if (!existing || existing.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.GODOWN_NOT_FOUND);
    }

    const { canDelete, reason } = await canDeleteGodownModel(godownId);
    if (!canDelete) throw new Error(reason || INVENTORY_ERRORS.GODOWN_HAS_STOCK);

    return await deleteGodownModel(godownId);
};

// ============================================
// GODOWN STOCK TRACKING
// ============================================

/**
 * Get all items in a specific godown
 */
export const getGodownStockService = async (companyId: string, godownId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    // Verify godown belongs to company
    const godown = await getGodownByIdModel(godownId);
    if (!godown || godown.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.GODOWN_NOT_FOUND);
    }

    return await getStockByGodownModel(godownId);
};

/**
 * Get all godowns holding a specific item
 */
export const getItemGodownsService = async (companyId: string, itemId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    return await getItemDistributionModel(itemId);
};

/**
 * Get full godown stock summary for a company
 */
export const getGodownStockSummaryService = async (companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    return await getGodownStockSummaryModel(companyId);
};

/**
 * Transfer stock between godowns
 */
export const transferStockService = async (
    companyId: string,
    userId: string,
    data: {
        stockItemId: string;
        sourceGodownId: string;
        destinationGodownId: string;
        quantity: number;
        rate?: number;
        narration?: string;
    }
) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    // Validate quantity
    if (!data.quantity || data.quantity <= 0) {
        throw new Error(INVENTORY_ERRORS.GODOWN_TRANSFER_INVALID_QTY);
    }

    // Source and destination must be different
    if (data.sourceGodownId === data.destinationGodownId) {
        throw new Error(INVENTORY_ERRORS.GODOWN_TRANSFER_SAME);
    }

    // Validate source godown belongs to company
    const sourceGodown = await getGodownByIdModel(data.sourceGodownId);
    if (!sourceGodown || sourceGodown.companyId !== companyId) {
        throw new Error('Source godown not found or does not belong to this company.');
    }

    // Validate destination godown belongs to company
    const destGodown = await getGodownByIdModel(data.destinationGodownId);
    if (!destGodown || destGodown.companyId !== companyId) {
        throw new Error('Destination godown not found or does not belong to this company.');
    }

    // Execute atomic transfer
    const result = await transferStockModel({
        companyId,
        stockItemId: data.stockItemId,
        sourceGodownId: data.sourceGodownId,
        destinationGodownId: data.destinationGodownId,
        quantity: data.quantity,
        rate: data.rate || 0,
    });

    return {
        ...result,
        narration: data.narration,
        sourceGodownName: sourceGodown.name,
        destinationGodownName: destGodown.name,
    };
};

/**
 * Get or create default godown for a company
 * Used during company setup or when inventory is first enabled
 */
export const ensureDefaultGodownService = async (companyId: string, userId: string) => {
    const existing = await getDefaultGodownModel(companyId);
    if (existing) return existing;

    return await createGodownModel({
        companyId,
        name: 'Main Location',
        isDefault: true,
        createdBy: userId,
    });
};

