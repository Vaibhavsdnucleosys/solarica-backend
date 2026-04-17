/**
 * Stock Item Service
 * Business logic for Stock Items
 */

import {
    createStockItemModel,
    getStockItemByIdModel,
    getStockItemsByCompanyIdModel,
    searchStockItemsModel,
    findItemByNameModel,
    updateStockItemModel,
    deleteStockItemModel,
    canDeleteItemModel,
} from '../../api/model/inventory/stock-item.model';
import { validateCompanyAccessService } from '../accounting/company.service';
import { INVENTORY_ERRORS } from '../../utils/inventory/constants';

/**
 * Get all items
 */
export const getStockItemsService = async (companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    return await getStockItemsByCompanyIdModel(companyId);
};

/**
 * Get item by ID
 */
export const getStockItemByIdService = async (itemId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    const item = await getStockItemByIdModel(itemId);
    if (!item || item.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.ITEM_NOT_FOUND);
    }
    return item;
};

/**
 * Create stock item
 */
export const createStockItemService = async (companyId: string, userId: string, data: any) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    if (!data.name?.trim()) throw new Error(INVENTORY_ERRORS.ITEM_NAME_REQUIRED);

    // Duplicate check
    const existing = await findItemByNameModel(companyId, data.name.trim());
    if (existing) throw new Error(INVENTORY_ERRORS.ITEM_NAME_DUPLICATE);

    // Auto-calculate opening value if not provided
    if (data.openingQty && data.openingRate && !data.openingValue) {
        data.openingValue = data.openingQty * data.openingRate;
    }

    return await createStockItemModel({
        ...data,
        companyId,
        createdBy: userId,
    });
};

/**
 * Update stock item
 */
export const updateStockItemService = async (itemId: string, companyId: string, userId: string, data: any) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    const existing = await getStockItemByIdModel(itemId);
    if (!existing || existing.companyId !== companyId) {
        throw new Error(INVENTORY_ERRORS.ITEM_NOT_FOUND);
    }

    if (data.name && data.name.trim() !== existing.name) {
        const duplicate = await findItemByNameModel(companyId, data.name.trim());
        if (duplicate) throw new Error(INVENTORY_ERRORS.ITEM_NAME_DUPLICATE);
    }

    return await updateStockItemModel(itemId, {
        ...data,
        updatedBy: userId,
    });
};

/**
 * Search items
 */
export const searchStockItemsService = async (companyId: string, userId: string, query: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    return await searchStockItemsModel(companyId, query);
};

/**
 * Delete item
 */
export const deleteStockItemService = async (itemId: string, companyId: string, userId: string) => {
    const hasAccess = await validateCompanyAccessService(companyId, userId);
    if (!hasAccess) throw new Error(INVENTORY_ERRORS.UNAUTHORIZED_ACCESS);

    const { canDelete, reason } = await canDeleteItemModel(itemId);
    if (!canDelete) throw new Error(reason || INVENTORY_ERRORS.ITEM_HAS_TRANSACTIONS);

    return await deleteStockItemModel(itemId);
};

